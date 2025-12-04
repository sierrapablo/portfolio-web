pipeline {
  agent any

  parameters {
    choice(name: 'BUMP', choices: ['X', 'Y', 'Z'], description: 'Which type of release (X=Major, Y=Minor, Z=Patch)')
  }

  environment {
    GIT_USER_NAME = 'Jenkins CI'
    GIT_USER_EMAIL = 'jenkins@M910Q'
    REGISTRY_REPO = 'sierrapablo/portfolio-web'
    DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
  }

  stages {
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

          if (params.BUMP == 'X') {
            major += 1
            minor = 0
            patch = 0
          } else if (params.BUMP == 'Y') {
            minor += 1
            patch = 0
          } else if (params.BUMP == 'Z') {
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

    stage('Update package.json') {
      steps {
        sshagent(credentials: ['github']) {
          script {
            sh """
              jq --arg v "${env.NEW_VERSION}" '.version = $v' package.json > package.tmp.json
              mv package.tmp.json package.json
              git add package.json
              git commit -m "Update version to ${env.NEW_VERSION}"
              git push origin release/${env.NEW_VERSION}
            """
          }
        }
      }
    }

    stage('Build Docker image') {
      steps {
        script {
          echo 'Building Docker image...'
          echo "Building image with tag: ${env.NEW_VERSION}"
          dockerImage = docker.build("${env.REGISTRY_REPO}:temp-${env.NEW_VERSION}")
          echo 'Build completed successfully'
        }
      }
    }

    stage('Tag Docker images') {
      steps {
        script {
          echo "Tagging image with version ${env.NEW_VERSION} and latest"
          dockerTaggedImage = dockerImage.tag("${env.REGISTRY_REPO}:${env.NEW_VERSION}")
          dockerLatestImage = dockerImage.tag("${env.REGISTRY_REPO}:latest")
        }
      }
    }

    stage('Push Docker images') {
      steps {
        script {
          echo 'Pushing Docker images to Docker Hub...'
          docker.withRegistry('', DOCKER_HUB_CREDENTIALS_ID) {
            dockerTaggedImage.push()
            echo "Pushed ${env.REGISTRY_REPO}:${env.NEW_VERSION}"
            dockerLatestImage.push()
            echo "Pushed ${env.REGISTRY_REPO}:latest"
          }
        }
      }
    }

    stage('Cleanup') {
      steps {
        script {
          echo 'Cleaning up local images...'
          sh """
            docker rmi ${env.REGISTRY_REPO}:latest || true
            docker rmi ${env.REGISTRY_REPO}:${env.NEW_VERSION} || true
            docker system prune -f
          """
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
          sh 'git fetch origin'
          sh "git branch -D release/${env.NEW_VERSION} || true"
          sh "git push origin --delete release/${env.NEW_VERSION} || true"
        }
      }
    }
  }
}
