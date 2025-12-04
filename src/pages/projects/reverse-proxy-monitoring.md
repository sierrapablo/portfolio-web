---
layout: ../../layouts/ProjectLayout.astro
title: "DevOps-Driven Reverse Proxy & Monitoring"
description: "A comprehensive DevOps approach to deploying a secure Nginx reverse proxy with automated monitoring using Terraform, Docker, Prometheus, and Grafana."
techStack: ["Terraform", "Docker", "Nginx", "Prometheus", "Grafana"]
url: "https://github.com/sierrapablo/reverse-proxy-monitoring"
---

# DevOps-Driven Reverse Proxy & Monitoring Infrastructure

In modern DevOps practices, **Infrastructure as Code (IaC)** and **Observability** are pillars of a robust system. This project demonstrates a fully automated deployment of a secure **Nginx reverse proxy** coupled with a complete monitoring stack using **Prometheus** and **Grafana**.

Instead of manual configuration, this project leverages **Terraform** to define the entire infrastructure state, ensuring reproducibility and scalability. The architecture is containerized using **Docker**, making it portable and consistent across environments.

## Architecture Overview

The infrastructure is designed to be modular and self-contained:

- **Reverse Proxy (Nginx)**: Handles incoming traffic, terminates SSL, and routes requests to appropriate services.
- **Monitoring Core (Prometheus)**: Scrapes metrics from defined targets.
- **Visualization (Grafana)**: Consumes Prometheus data to render actionable dashboards.
- **Exporters**:
  - **Nginx Exporter**: Exposes Nginx-specific metrics.
  - **Node Exporter**: Exposes host system metrics.
- **Automation**: A sidecar process monitors configuration changes to trigger hot-reloads of the Nginx service.

## Infrastructure as Code with Terraform

Terraform is the backbone of this deployment. It manages the lifecycle of Docker images, containers, networks, and volumes. By defining infrastructure in code, we avoid configuration drift and enable version-controlled infrastructure changes.

### Provider Configuration

We start by defining the required providers. In this case, we rely heavily on the Docker provider to orchestrate our containers locally or on a remote Docker host.

```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}
```

### Network Infrastructure

To ensure secure communication between services, a dedicated Docker network is provisioned. This isolates our monitoring stack from external noise and strictly controls ingress/egress.

```hcl
resource "docker_network" "reverse_proxy" {
  name   = "reverse-proxy"
  driver = "bridge"
}

output "reverse_proxy_network_id" {
  description = "Docker network ID for the reverse-proxy network"
  value       = docker_network.reverse_proxy.id
}
```

### Container Resources

Each service is defined as a Terraform resource. This includes the configuration for ports, volumes, and environment variables. For example, the Nginx container is configured to mount our local configuration and SSL certificates.

```hcl
resource "docker_image" "reverse_proxy_image" {
  name = "nginx-reverse-proxy"
  build {
    context = abspath("${path.module}/..")
  }
}

resource "docker_container" "reverse_proxy" {
  name    = "nginx-proxy"
  image   = docker_image.reverse_proxy_image.image_id
  restart = "always"

  networks_advanced {
    name = docker_network.reverse_proxy.name
  }

  ports {
    internal = 80
    external = 80
  }
  ports {
    internal = 443
    external = 443
  }

  volumes {
    host_path      = local.nginx_conf_abs
    container_path = "/etc/nginx/nginx.conf"
  }
  volumes {
    host_path      = local.nginx_conf_d_abs
    container_path = "/etc/nginx/conf.d/"
  }
  volumes {
    host_path      = local.ssl_path_abs
    container_path = "/etc/nginx/ssl"
    read_only      = true
  }
  volumes {
    host_path      = local.htpasswd_abs
    container_path = "/etc/nginx/.htpasswd"
    read_only      = true
  }
}

variable "nginx_conf_path" {
  description = "Local path to nginx.conf"
  type        = string
  default     = "../nginx/nginx.conf"
}

variable "nginx_conf_d_path" {
  description = "Local path to nginx conf.d directory"
  type        = string
  default     = "../nginx/conf.d/"
}

locals {
  nginx_conf_abs   = abspath("${path.module}/${var.nginx_conf_path}")
  nginx_conf_d_abs = abspath("${path.module}/${var.nginx_conf_d_path}")
}

output "reverse_proxy_ip" {
  description = "Internal IP address of the nginx-proxy container in the reverse-proxy network"
  value       = docker_container.reverse_proxy.network_data[0].ip_address
}

output "reverse_proxy_ports" {
  description = "Ports exposed by the nginx-proxy container"
  value = {
    http  = docker_container.reverse_proxy.ports[0].external
    https = docker_container.reverse_proxy.ports[1].external
  }
}
```

Similarly, the monitoring stack (Prometheus and Grafana) is provisioned with persistent storage to ensure data retention across restarts.

**Prometheus**

```hcl
resource "docker_image" "prometheus" {
  name = "prom/prometheus"
}

resource "docker_container" "prometheus" {
  name    = "prometheus"
  image   = docker_image.prometheus.image_id
  restart = "always"

  networks_advanced {
    name = docker_network.reverse_proxy.name
  }

  ports {
    internal = 4000
    external = 4000
  }

  volumes {
    host_path      = local.prometheus_path_abs
    container_path = "/etc/prometheus/prometheus.yml"
  }

  command = ["--config.file=/etc/prometheus/prometheus.yml"]
}

variable "prometheus_config_path" {
  description = "Local path to Prometheus config file"
  type        = string
  default     = "../prometheus/prometheus.yml"
}

locals {
  prometheus_path_abs = abspath("${path.module}/${var.prometheus_config_path}")
}
```

**Grafana**

```hcl
resource "docker_image" "grafana" {
  name = "grafana/grafana"
}

resource "docker_container" "grafana" {
  name    = "grafana"
  image   = docker_image.grafana.image_id
  restart = "always"

  networks_advanced {
    name = docker_network.reverse_proxy.name
  }

  ports {
    internal = 3000
    external = 3000
  }

  volumes {
    host_path      = local.grafana_path_abs
    container_path = "/etc/grafana/provisioning/"
  }

  env = [
    "GF_SECURITY_ADMIN_USER=${var.grafana_admin_user}",
    "GF_SECURITY_ADMIN_PASSWORD=${var.grafana_admin_password}"
  ]
}

variable "grafana_admin_user" {
  description = "Admin username for Grafana"
  type        = string
  default     = "admin"
}

variable "grafana_admin_password" {
  description = "Admin password for Grafana"
  type        = string
  sensitive   = true
  default     = "changeme" # needs to be changed on first logging in
}

variable "grafana_provisioning_path" {
  description = "Local path to Grafana provisioning directory"
  type        = string
  default     = "../grafana/provisioning/"
}

locals {
  grafana_path_abs = abspath("${path.module}/${var.grafana_provisioning_path}")
}
```

## Observability Pipeline

Additional to Prometheus-Grafana stack, this project also implements a complete observability pipeline for the reverse proxy and the server is located:
Uses the nginx-exporter to expose metrics from the reverse proxy:

```hcl
resource "docker_image" "nginx_exporter" {
  name = "nginx/nginx-prometheus-exporter:latest"
}

resource "docker_container" "nginx_exporter" {
  name    = "nginx-exporter"
  image   = docker_image.nginx_exporter.image_id
  restart = "always"
  command = ["--nginx.scrape-uri=http://nginx-proxy:8080/nginx_status"]

  networks_advanced {
    name = docker_network.reverse_proxy.name
  }

  ports {
    internal = 9113
    external = 9113
  }

  depends_on = [docker_container.reverse_proxy]
}

output "nginx_exporter_ports" {
  description = "Ports exposed by the nginx-exporter container"
  value = {
    metrics = docker_container.nginx_exporter.ports[0].external
  }
}

output "nginx_exporter_url" {
  description = "URL to access Nginx Exporter metrics"
  value       = "http://localhost:${docker_container.nginx_exporter.ports[0].external}/metrics"
}
```

And the node-exporter to expose metrics from the server:

```hcl
resource "docker_image" "node_exporter" {
  name = "prom/node-exporter:latest"
}

resource "docker_container" "node_exporter" {
  name    = "node-exporter"
  image   = docker_image.node_exporter.image_id
  restart = "always"

  networks_advanced {
    name = docker_network.reverse_proxy.name
  }

  volumes {
    host_path      = "/proc"
    container_path = "/host/proc"
    read_only      = true
  }
  volumes {
    host_path      = "/sys"
    container_path = "/host/sys"
    read_only      = true
  }
  volumes {
    host_path      = "/"
    container_path = "/rootfs"
    read_only      = true
  }

  command = [
    "--path.procfs=/host/proc",
    "--path.sysfs=/host/sys",
    "--path.rootfs=/rootfs"
  ]
}

output "node_exporter_info" {
  description = "Information about the Node Exporter container"
  value = {
    name  = docker_container.node_exporter.name
    ports = docker_container.node_exporter.ports
  }
}
```

A key DevOps goal is visibility. This project establishes a complete pipeline:

1.  **Metric Exposure**: Services expose metrics via HTTP endpoints (e.g., `/metrics`).
2.  **Scraping**: Prometheus is configured to poll these endpoints at set intervals.
3.  **Visualization**: Grafana queries Prometheus to display real-time data.

This setup allows for proactive monitoring of:

- **Traffic Analysis**: Request rates, latency, and error rates from Nginx.
- **Resource Usage**: CPU, memory, and disk I/O from the host system.

## Security & Automation

Security is integrated into the design:

- **SSL/TLS**: Nginx is configured to serve traffic over HTTPS using provided certificates.
- **Access Control**: Prometheus is protected behind a Basic Auth layer managed by Nginx, preventing unauthorized access to raw metrics.
- **Hot Reloading**: An automated script watches for configuration changes, ensuring that updates to Nginx rules are applied immediately without downtime.

## Conclusion

This project serves as a template for a production-ready DevOps environment. By combining **Terraform** for provisioning, **Docker** for isolation, and **Prometheus/Grafana** for observability, it provides a solid foundation for deploying and monitoring web services.
