pipeline {
  agent any

  parameters {
    choice(name: 'BUMP', choices: ['MAJOR', 'MINOR', 'PATCH'], description: 'Which type of release (MAJOR, MINOR, PATCH)')
  }

  environment {
    GIT_USER_NAME = 'Jenkins CI'
    GIT_USER_EMAIL = 'jenkins[bot]@noreply.jenkins.io'
    SONAR_PROJECT_KEY = 'sierrapablo-portfolio-web'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'apt update && apt install -y jq nodejs npm'
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Read package.json') {
      steps {
        script {
          def rawVersion = sh(script: 'jq -r .version package.json', returnStdout: true).trim()
          def ver = rawVersion.tokenize('.')

          int major = ver[0].toInteger()
          int minor = ver[1].toInteger()
          int patch = ver[2].toInteger()

          if (params.BUMP == 'MAJOR') {
            major += 1
            minor = 0
            patch = 0
          } else if (params.BUMP == 'MINOR') {
            minor += 1
            patch = 0
          } else if (params.BUMP == 'PATCH') {
            patch += 1
          }
          env.NEW_VERSION = "${major}.${minor}.${patch}"
          echo "New calculated version: ${env.NEW_VERSION}"
        }
      }
    }

    stage('Create release branch') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              git config user.name "${env.GIT_USER_NAME}"
              git config user.email "${env.GIT_USER_EMAIL}"
              git checkout develop
              git pull origin develop
              git checkout -b release/${env.NEW_VERSION}
            """
          }
        }
      }
    }

    stage('Update version & format code') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              set -e

              jq --arg v '${env.NEW_VERSION}' '.version = \$v' package.json > package.tmp.json
              mv package.tmp.json package.json
              git add package.json
              git commit -m "chore: update version to ${env.NEW_VERSION}"

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

              git push origin release/${env.NEW_VERSION}
            """
          }
        }
      }
    }

    stage('SonarQube analysis') {
      steps {
        withSonarQubeEnv('sonarqube') {
          sh """
            ${tool 'sonar-scanner'}/bin/sonar-scanner \
            -X \
            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
            -Dsonar.projectVersion=${env.NEW_VERSION} \
            -Dsonar.sources=. \
            -Dsonar.exclusions=node_modules/**,dist/**,build/**
          """
        }
      }
    }

    stage('Stop Previous Deployment') {
      steps {
        script {
          echo 'Stopping previous deployment if exists...'
          sh 'docker-compose down || true'
        }
      }
    }

    stage('Deploy new version') {
      steps {
        script {
          echo 'Deploying new version...'
          sh '''
            docker-compose up -d --build
          '''
        }
      }
    }

    stage('Cleanup') {
      steps {
        script {
          echo 'Cleaning up local images...'
          sh '''
            docker system prune -f
          '''
          echo 'Cleanup completed'
        }
      }
    }

    stage('Merge Release into Main') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              git checkout main
              git merge release/${env.NEW_VERSION} --no-ff
              git push origin main
            """
          }
        }
      }
    }

    stage('Create Tag') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              git tag ${env.NEW_VERSION}
              git push origin ${env.NEW_VERSION}
            """
          }
        }
      }
    }

    stage('Generate Release Notes') {
      steps {
        script {
          sh """
            PREV_TAG=\$(git describe --tags --abbrev=0 "${env.NEW_VERSION}^" 2>/dev/null || echo "")
            if [ -z "\$PREV_TAG" ]; then
              git log --oneline > changes.txt
            else
              git log --oneline "\$PREV_TAG".."${env.NEW_VERSION}" > changes.txt
            fi
          """
        }
      }
    }

    stage('Create GitHub Release') {
      steps {
        withCredentials([string(credentialsId: 'github-repo-pat', variable: 'GITHUB_PAT')]) {
          script {
            def changes = readFile('changes.txt').trim()
            def changesEscaped = changes.replace('"', '\\"').replace('\n', '\\n')

            writeFile file: 'release.json', text: """
            {
              "tag_name": "${env.NEW_VERSION}",
              "name": "Release ${env.NEW_VERSION}",
              "body": "${changesEscaped}",
              "draft": false,
              "prerelease": false
            }
            """

            sh """
              curl -X POST \
                -H "Authorization: token ${GITHUB_PAT}" \
                -H "Accept: application/vnd.github+json" \
                https://api.github.com/repos/sierrapablo/portfolio-web/releases \
                -d @release.json
            """
            sh 'rm -f changes.txt release.json'
          }
        }
      }
    }

    stage('Sync Develop with Main') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh '''
              git checkout develop
              git pull origin develop
              git merge --ff-only main || git merge main
              git push origin develop
            '''
          }
        }
      }
    }
}

  post {
    success {
      echo """
        ==========================================
        RELEASE SUCCESSFUL
        ==========================================
        Version: ${env.NEW_VERSION}
        Duration: ${currentBuild.durationString}
        ==========================================""
      """
    }
    failure {
      echo """
        ==========================================
        RELEASE FAILED
        ==========================================
        Version: ${env.NEW_VERSION}
        Duration: ${currentBuild.durationString}
        ==========================================
      """
    }
    always {
      script {
        echo "Attempting to clean up remote branch release/${env.NEW_VERSION}..."
        sshagent(credentials: ['github']) {
          sh 'git checkout develop'
          sh 'git fetch origin'
          sh "git branch -D release/${env.NEW_VERSION} || true"
          sh "git push origin --delete release/${env.NEW_VERSION} || true"
        }
      }
    }
  }
}
