pipeline {
  agent any

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'The tag to apply to the Docker image')
  }

  environment {
    REGISTRY_REPO = 'sierrapablo/portfolio-web'
    DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  stages {
    stage('Build') {
      steps {
        script {
          echo 'Building Docker images...'
          if (params.IMAGE_TAG != 'latest') {
            echo "Building image with tag: ${params.IMAGE_TAG}"
            dockerTaggedImage = docker.build("${env.REGISTRY_REPO}:${params.IMAGE_TAG}")
          }
          echo 'Building image with tag: latest'
          dockerLatestImage = docker.build("${env.REGISTRY_REPO}:latest")
          echo 'Build completed successfully'
        }
      }
    }

    stage('Push') {
      steps {
        script {
          echo 'Pushing images to Docker Hub...'
          docker.withRegistry('', DOCKER_HUB_CREDENTIALS_ID) {
            if (params.IMAGE_TAG != 'latest') {
              dockerTaggedImage.push()
              echo "Pushed ${env.REGISTRY_REPO}:${params.IMAGE_TAG}"
            }
            dockerLatestImage.push()
            echo "Pushed ${env.REGISTRY_REPO}:latest"
          }
        }
      }
    }

    stage('Cleanup') {
      steps {
        script {
          echo '🧹 Cleaning up local images...'
          sh """
            docker rmi ${env.REGISTRY_REPO}:latest || true
            ${params.IMAGE_TAG != 'latest' ? "docker rmi ${env.REGISTRY_REPO}:${params.IMAGE_TAG} || true" : ''}
            docker system prune -f
          """
          echo 'Cleanup completed'
        }
      }
    }
  }

  post {
    success {
      echo """
        ==========================================
        BUILD SUCCESSFUL
        ==========================================
        Image: ${env.REGISTRY_REPO}
        Tags : ${params.IMAGE_TAG != 'latest' ? params.IMAGE_TAG + ', latest' : 'latest'}
        Duration: ${currentBuild.durationString}
        ==========================================
      """
    }
    failure {
      echo """
        ==========================================
        BUILD FAILED
        ==========================================
        Image: ${env.REGISTRY_REPO}
        Tag: ${params.IMAGE_TAG}
        Duration: ${currentBuild.durationString}
        =========================================="
      """
    }
  }
}
