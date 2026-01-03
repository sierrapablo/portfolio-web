pipeline {
  agent any

  parameters {
    gitParameter(
      name: 'BRANCH_NAME',
      type: 'PT_BRANCH',
      defaultValue: 'develop',
      branchFilter: 'origin/(.*)',
      description: 'Selecciona la rama para ejecutar el formateo',
      sortMode: 'DESCENDING_SMART',
      selectedValue: 'DEFAULT'
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
            echo "Ejecutando formateo en la rama: ${params.BRANCH_NAME}"
            sh """
              git config user.name "${env.GIT_USER_NAME}"
              git config user.email "${env.GIT_USER_EMAIL}"

              git fetch --all
              git checkout ${params.BRANCH_NAME}
              git pull
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

    stage('Format code') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              set -e

              echo "Installing dev dependencies only..."
              pnpm install --frozen-lockfile

              echo "Running prettier..."
              pnpm exec prettier --config .prettierrc --write "src/**/*.{ts,js,html,css,astro,md,json}"

              if ! git diff --quiet; then
                git add .
                git commit -m "chore: format code"
              else
                echo "No changes to commit."
              fi

              git push
            """
          }
        }
      }
    }
  }
  post {
    success {
      echo """
        ==========================================
        FORMAT SUCCESSFUL
        ==========================================
        Duration: ${currentBuild.durationString}
        ==========================================
      """
    }
    failure {
      echo """
        ==========================================
        FORMAT FAILED
        ==========================================
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
