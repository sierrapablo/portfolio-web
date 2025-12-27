pipeline {
  agent any

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Docker image tag to deploy')
  }

  environment {
    COMPOSE_PROJECT_NAME = 'portfolio-web'
    REGISTRY_REPO = 'sierrapablo/portfolio-web'
    DOCKER_IMAGE = "${REGISTRY_REPO}:${params.IMAGE_TAG}"
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        echo 'Checking out code...'
        checkout scm
      }
    }

    stage('Pull Docker Image') {
      steps {
        script {
          echo "Pulling Docker image: ${DOCKER_IMAGE}"
          sh "docker pull ${DOCKER_IMAGE}"
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

    stage('Deploy with Docker Compose') {
      steps {
        script {
          echo 'Deploying with docker-compose...'
          sh """
            export DOCKER_IMAGE=${DOCKER_IMAGE}
            docker-compose up -d
          """
        }
      }
    }

    stage('Verify Deployment') {
      steps {
        script {
          echo 'Verifying deployment...'
          sh '''
            sleep 5
            docker-compose ps
            docker-compose logs --tail=50
          '''
        }
      }
    }
  }

  post {
    success {
      echo """
        ==========================================
        DEPLOYMENT SUCCESSFUL
        ==========================================
        Image: ${DOCKER_IMAGE}
        Project: ${COMPOSE_PROJECT_NAME}
        Duration: ${currentBuild.durationString}
        ==========================================
      """
    }
    failure {
      echo """
        ==========================================
        DEPLOYMENT FAILED
        ==========================================
        Image: ${DOCKER_IMAGE}
        Duration: ${currentBuild.durationString}
        ==========================================
      """
      sh 'docker-compose logs --tail=100 || true'
    }
  }
}
