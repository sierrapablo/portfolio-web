pipeline {
  agent any

  environment {
    GIT_USER_NAME = 'Jenkins CI'
    GIT_USER_EMAIL = 'jenkins[bot]@noreply.jenkins.io'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'apt update && apt install -y jq nodejs npm'
      }
    }

    stage('Checkout') {
      steps {
        sshagent(credentials: ['github']) {
          sh """
            git config --global user.name "${GIT_USER_NAME}"
            git config --global user.email "${GIT_USER_EMAIL}"
            git checkout develop
            git pull origin develop
          """
        }
      }
    }

    stage('Format code') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              set -e

              echo "Installing dev dependencies only..."
              npm install --omit=prod

              PRETTIER_VERSION=\$(jq -r '.devDependencies.prettier' package.json | sed 's/^[^0-9]*//')

              if [ -z "\$PRETTIER_VERSION" ]; then
                echo "WARNING: Prettier not found in devDependencies, not formatting code."
              else
                echo "Using Prettier \$PRETTIER_VERSION"
                npx prettier@\$PRETTIER_VERSION --config .prettierrc --write "src/**/*.{ts,js,html,css,astro,md,json}"
              fi

              if ! git diff --quiet; then
                git add .
                git commit -m "chore: format code"
              else
                echo "No changes to commit."
              fi

              git push origin develop
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
