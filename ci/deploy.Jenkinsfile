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

    stage('Generate environment variables') {
      environment {
        CONTACT_FORM_ENDPOINT = credentials('portfolio-web-contact-endpoint')
      }
      steps {
        sh """
          touch .env
          echo "CONTACT_FORM_ENDPOINT=${CONTACT_FORM_ENDPOINT}" > .env
        """
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
            docker exec --user root portfolio-web sh -c "rm -rf /app/server/*"
            docker cp dist/. portfolio-web:/app/server/
            docker exec --user root portfolio-web sh -c "chown -R node:node /app/server"
            docker restart portfolio-web
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
