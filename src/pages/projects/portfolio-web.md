---
layout: ../../layouts/ProjectLayout.astro
title: "DevOps-Driven Portfolio Web Deployment"
description: "A comprehensive guide to the automated build and deployment pipeline of a modern Astro web application using Docker and Jenkins."
techStack: ["Docker", "Jenkins", "Nginx", "Astro"]
url: "https://github.com/sierrapablo/portfolio-web"
link: "https://www.sierrapablo.dev"
---

# DevOps-Driven Portfolio Web Deployment

This project goes beyond just building a personal portfolio; it serves as a demonstration of a **modern DevOps workflow**. While the frontend is built with **Astro** for high performance, the core focus of this documentation is the **automated infrastructure**, **containerization strategy**, and **CI/CD pipelines** that ensure reliable, repeatable, and secure deployments.

## DevOps Highlights

By treating the portfolio as a professional software product, the project implements several industry-standard practices:

- **Intelligent Containerization**: Utilizing specialized build strategies to minimize footprint and maximize security.
- **Full CI/CD Automation**: Leveraging Jenkins to orchestrate the entire lifecycle from code commit to production release.
- **Infrastructure as Code**: Managing environment configuration through automated scripts and orchestration tools.
- **High Availability**: Implementing deployment strategies that ensure the website remains accessible during updates.

## Containerization Strategy

To ensure a "work everywhere" consistency, the application is fully containerized. The project employs a **multi-stage build process**, which acts as a sophisticated assembly line. Instead of creating a heavy image containing all development tools, the process is divided into functional phases:

1.  **Environment Setup**: Establishing the baseline runtime requirements.
2.  **Dependency Management**: Separating production-only modules from build-time tools to optimize cache usage.
3.  **Compilation**: Building the Astro application into static assets within an isolated environment.
4.  **Runtime Optimization**: Creating the final, slim delivery image that only contains the essential files needed to serve the site.

This approach significantly reduces the attack surface and results in a lightweight container that starts faster and uses fewer resources.

## Continuous Integration (CI)

The CI pipeline is the gatekeeper of the project. Managed by **Jenkins**, it automates the validation and packaging of the application. Whenever changes are integrated, the pipeline performs several critical tasks:

- **Validation & Build**: The code is compiled and tested inside a controlled environment to catch errors early.
- **Artifact Versioning**: The system automatically tags Docker images based on git metadata, allowing for precise tracking of what is running in production.
- **Registry Management**: Validated images are securely pushed to a central repository, making them available for deployment across different environments.
- **Automated Cleanup**: To maintain system health, the pipeline manages local storage by removing temporary build artifacts and outdated images.

## Continuous Deployment (CD)

The CD pipeline completes the journey from code to user. It provides a seamless transition into the production environment with a focus on reliability:

- **Automated Orchestration**: Using modern deployment tools to pull the latest verified images and update the running services.
- **Version Control & Rollbacks**: Because every deployment is based on specific versions, the system can instantly revert to a previous stable state if any issues are detected.
- **Health Verification**: After every update, the pipeline automatically verifies that the service is healthy and responding correctly before considering the deployment successful.

## Deployment Architecture

The application operates behind an **Nginx** reverse proxy. This professional-grade architecture provides several benefits:

- **SSL/TLS Security**: Encryption is handled at the gateway level, ensuring all user data is protected without burdening the application logic.
- **Operational Performance**: Nginx acts as an efficient buffer, handling high loads and static asset delivery with minimal latency.
- **Scalable Foundation**: The containerized nature of the app allows it to be easily scaled horizontally or moved to cloud-native platforms like Kubernetes in the future.

## Conclusion

By implementing this DevOps-first approach, the portfolio project achieves a professional level of reliability and automation. It demonstrates how modern tools like **Docker** and **Jenkins** can be used to transform a simple website into a robust, automated, and professionally managed web platform.
