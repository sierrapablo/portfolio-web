---
layout: ../../layouts/ProjectLayout.astro
title: "Portfolio Web"
description: "A personal portfolio website built with Astro to showcase my experience and projects. Features a responsive design, dark mode, and smooth animations."
techStack: ["Astro", "TypeScript", "CSS"]
url: "https://github.com/sierrapablo/portfolio-web"
link: "https://www.sierrapablo.dev"
---

## Overview

This portfolio website is built with **Astro**, a modern static site generator that delivers exceptional performance through its unique approach to shipping zero JavaScript by default. The site showcases my professional experience, technical skills, and personal projects in an elegant and responsive design.

## Key Features

### Modern Design
- **Responsive Layout**: Fully responsive design that works seamlessly across all devices
- **Dark Mode Support**: Built-in dark mode with smooth transitions
- **Smooth Animations**: Carefully crafted animations using CSS for enhanced user experience
- **Gradient Accents**: Eye-catching gradient effects on headings and interactive elements

### Technical Highlights
- **Static Site Generation**: Lightning-fast page loads with pre-rendered HTML
- **TypeScript Integration**: Type-safe development for better code quality
- **Component-Based Architecture**: Reusable Astro components for maintainable code
- **SEO Optimized**: Proper meta tags and semantic HTML for better search engine visibility

### Performance
- **Minimal JavaScript**: Only essential JavaScript is shipped to the browser
- **Optimized Assets**: Automatic image optimization and asset bundling
- **Fast Load Times**: Excellent Lighthouse scores across all metrics

## Technical Stack

The project leverages modern web technologies:

- **Astro**: Static site generator with excellent performance
- **TypeScript**: For type-safe development
- **CSS**: Custom styling with CSS variables for theming
- **Docker**: Containerized deployment with Nginx

## Architecture

The site follows a clean, component-based architecture:

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts
├── pages/          # Route pages
├── styles/         # Global and component styles
├── data/           # Static data (projects, experiences)
└── types/          # TypeScript type definitions
```

## Deployment

The portfolio is deployed using Docker and served via Nginx, ensuring:
- Fast content delivery
- Reliable uptime
- Easy scalability
- Simple CI/CD integration

Its deploy is automated using Jenkins, separating the build and deploy for flexibility.

### Build pipeline
Builds the Docker image and pushes it to Docker Hub.It always builds the latest tag and the tag specified in the parameters.
```Groovy
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

#### Dockerfile

The Dockerfile is separated into 5 stages:

- `base`: Base image with Node.js and pnpm
- `prod-deps`: Production dependencies
- `build-deps`: Build dependencies
- `build`: Build stage
- `runtime`: Runtime stage

The `base` stage is used as a common base for all other stages, containing the Node.js and pnpm installation.

```Dockerfile
# Stage 1: Base
FROM node:24.11.1-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
```

The `prod-deps` stage installs only production dependencies, which are cached for faster rebuilds.
```Dockerfile
# Stage 2: Prod Dependencies
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
```

The `build-deps` stage installs all dependencies, including dev dependencies, which are cached for faster rebuilds.
```Dockerfile
# Stage 3: Build Dependencies
FROM base AS build-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
```

The `build` stage builds the application using the cached dependencies.
```Dockerfile
# Stage 4: Build
FROM build-deps AS build
WORKDIR /app
COPY . .
RUN pnpm run build
```

The `runtime` stage copies the production dependencies and the built application to the runtime image.
```Dockerfile
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

### Deploy pipeline

The deploy pipeline allows to deploy a concrete version of the Docker image to the production environment. It serves itself as a rollback in case of failure when using the latest tag.
```Groovy
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
