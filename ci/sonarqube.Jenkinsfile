pipeline {
  agent any

  environment {
    SONAR_PROJECT_KEY = 'sierrapablo-portfolio-web'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Detect Version') {
      steps {
        script {
          def rawVersion = sh(script: 'jq -r .version package.json', returnStdout: true).trim()
          if (!rawVersion.matches(/\d+\.\d+\.\d+/)) {
            error "Invalid version format in VERSION file: '${rawVersion}'. Expected 'major.minor.patch'."
          }
          def ver = rawVersion.tokenize('.')

          int major = ver[0].toInteger()
          int minor = ver[1].toInteger()
          int patch = ver[2].toInteger()

          env.VERSION = "${major}.${minor}.${patch}"
          echo "Detected version: ${env.VERSION}"
        }
      }
    }

    stage('Setup pnpm') {
      steps {
        sh '''
          set -euxo pipefail
          node -v
          corepack enable
          corepack prepare pnpm@10.27.0 --activate
          pnpm -v
        '''
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'pnpm install --frozen-lockfile --shamefully-hoist'
      }
    }

    stage('Run tests') {
      steps {
        sh """
          set -euxo pipefail
          pnpm test:coverage
          ls -la coverage
          test -f coverage/lcov.info
          head -n 20 coverage/lcov.info
        """
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube') {
          sh """
            ${tool 'sonar-scanner'}/bin/sonar-scanner \
            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
            -Dsonar.projectVersion=${env.VERSION} \
            -Dsonar.sources=src \
            -Dsonar.tests=src/tests \
            -Dsonar.test.inclusions=src/tests/**/*.{test,spec}.ts \
            -Dsonar.exclusions=node_modules/**,dist/**,build/**,.astro/**,coverage/**,src/tests/** \
            -Dsonar.coverage.exclusions=src/types/**,**/*.d.ts \
            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
          """
        }
      }
    }

  }

  post {
    success {
      echo """
        ==========================================
        SONARQUBE ANALYSIS SUCCESSFUL
        ==========================================
        Version: ${env.VERSION}
        Duration: ${currentBuild.durationString}
        =========================================="""
    }
    failure {
      echo """
        ==========================================
        SONARQUBE ANALYSIS FAILED
        ==========================================
        Version: ${env.VERSION}
        Duration: ${currentBuild.durationString}
        =========================================="""
    }
    always {
      echo 'Attempting to clean up workspace...'
      cleanWs()
    }
  }
}
