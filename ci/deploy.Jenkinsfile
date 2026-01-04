pipeline {
  agent any

  parameters {
    gitParameter(
      name: 'TAG',
      type: 'PT_TAG',
      defaultValue: '',
      description: 'Tag to deploy',
      sortMode: 'DESCENDING_SMART',
      selectedValue: 'TOP'
    )
  }

  environment {
    GIT_USER_NAME = 'Jenkins CI'
    GIT_USER_EMAIL = 'jenkins[bot]@noreply.jenkins.io'
  }

  stages {
    stage('Checkout') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            if (!params.TAG || params.TAG == '') {
              error "The 'TAG' parameter is mandatory. Please select a valid tag."
            }
            sh """
              git config user.name "${env.GIT_USER_NAME}"
              git config user.email "${env.GIT_USER_EMAIL}"

              git fetch --tags --force
              git checkout ${params.TAG}
            """
          }
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
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Build') {
      steps {
        sh 'pnpm run build'
      }
    }

    stage('Deploy') {
      steps {
        input message: "Deploy version ${params.TAG}?", ok: 'Deploy'
        script {
          sh '''
            # Parar completamente
            docker stop portfolio-web || true
            
            # Copiar directamente al volumen en el host
            # (usa la variable host_path de Terraform: /srv/portfolio-web)
            sudo rm -rf /srv/portfolio-web/*
            sudo cp -r dist/. /srv/portfolio-web/
            sudo chown -R 1000:1000 /srv/portfolio-web/
            
            # Arrancar
            docker start portfolio-web
          '''
        }
      }
    }
  }
  post {
    success {
      echo """
        ==========================================
        DEPLOY SUCCESSFUL
        ==========================================
        Version: ${params.TAG}
        Duration: ${currentBuild.durationString}
        ==========================================""
      """
    }
    failure {
      echo """
        ==========================================
        DEPLOY FAILED
        ==========================================
        Version: ${params.TAG}
        Duration: ${currentBuild.durationString}
        ==========================================
      """
    }
    always {
      script {
        echo 'Attempting to clean up workspace...'
        cleanWs()
      }
    }
  }
}
