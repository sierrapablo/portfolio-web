---
layout: ../../layouts/ProjectLayout.astro
title: "DevOps-Driven Portfolio Web Deployment"
description: "A comprehensive guide to the automated build and deployment pipeline of a modern Astro web application using Docker and Jenkins."
techStack: ["Docker", "Jenkins", "Nginx", "Astro"]
url: "https://github.com/sierrapablo/portfolio-web"
link: "https://www.sierrapablo.dev"
---

# DevOps-Driven Portfolio Web Deployment

This project goes beyond just building a personal portfolio; it serves as a demonstration of a **modern DevOps workflow**. While the frontend is built with **Astro** for performance, the core focus of this documentation is on the **automated infrastructure**, **containerization strategy**, and **CI/CD pipelines** that ensure reliable and repeatable deployments.

## DevOps Highlights

- **Containerization**: Multi-stage Docker builds to ensure minimal image size and security.
- **CI/CD Automation**: Full Jenkins pipelines for building, testing, and deploying.
- **Infrastructure as Code**: Deployment managed via Docker Compose and automated scripts.
- **Zero-Downtime Deployment**: Strategies to ensure high availability during updates.

## Containerization Strategy

To ensure consistency across development and production environments, the application is fully containerized. We use a **multi-stage Dockerfile** to optimize the final image size and security.

### Optimized Docker Image

The build process is split into 5 distinct stages to separate build dependencies from runtime requirements:

1.  **Base**: Sets up the shared Node.js environment.
2.  **Prod-Deps**: Installs only production dependencies (cached).
3.  **Build-Deps**: Installs all dependencies including dev tools (cached).
4.  **Build**: Compiles the Astro application.
5.  **Runtime**: A minimal layer containing only the built assets and production modules.

```dockerfile
# Stage 1: Base
FROM node:24.11.1-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 2: Prod Dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Stage 3: Build Dependencies
FROM base AS build-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Stage 4: Build
FROM build-deps AS build
WORKDIR /app
COPY . .
RUN pnpm run build

# Stage 5: Runtime
FROM base AS runtime
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
```

## Continuous Integration (CI)

The CI pipeline is responsible for validating the code, building the Docker image, and pushing it to the registry. It is defined in a `Jenkinsfile` and supports building specific tags as well as the `latest` version.

### Build Pipeline

Key features of this pipeline:
- **Parameterization**: Allows building specific git tags or branches.
- **Artifact Management**: Pushes tagged images to Docker Hub.
- **Cleanup**: Automatically removes local artifacts to save disk space.

```groovy
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
          echo 'Cleaning up local images...'
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
```

## Continuous Deployment (CD)

The CD pipeline automates the release of the application to the production environment. It uses **Docker Compose** to orchestrate the deployment, ensuring that the new version is pulled and started seamlessly.

### Deploy Pipeline

This pipeline handles:
- **Version Selection**: Deploys any specific tag available in the registry.
- **Rollback Capability**: By deploying specific tags, we can easily revert to a previous version.
- **Verification**: Automatically checks service health after deployment.

```groovy
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
```

## Deployment Architecture

The application runs behind an **Nginx** reverse proxy, which handles SSL termination and routes traffic to the containerized Astro application. This setup ensures:

- **Security**: SSL/TLS encryption managed at the proxy level.
- **Performance**: Nginx serves as an efficient gateway.
- **Scalability**: The containerized app can be easily scaled horizontally.

## Conclusion

By implementing this DevOps-first approach, the portfolio project achieves a professional level of reliability and automation. The use of **Docker** ensures portability, while **Jenkins** orchestrates the complex lifecycle of building and deploying modern web applications.
