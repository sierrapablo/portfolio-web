import type { Project } from "../types/projects";

export const projects: Project[] = [
  {
    title: "Portfolio Web",
    description:
      "A personal portfolio website built with Astro to showcase my experience and projects. Features a responsive design, dark mode, and smooth animations.",
    techStack: ["Astro", "TypeScript", "CSS"],
    url: "https://github.com/sierrapablo/portfolio-web",
    link: "https://www.sierrapablo.dev",
    slug: "portfolio-web",
  },
  {
    title: "Reverse Proxy with Monitoring",
    description:
      "Monitoring for Nginx Reverse Proxy in Docker with HTTPS, Prometheus and Grafana.",
    techStack: ["Docker", "Nginx", "Prometheus", "Grafana", "Terraform"],
    url: "https://github.com/sierrapablo/reverse-proxy-monitoring",
    slug: "reverse-proxy-monitoring",
  },
  {
    title: "CoachHub",
    description:
      "CoachHub is a web platform for sports clubs to manage their teams and players.",
    techStack: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "PostgreSQL",
      "AWS",
    ],
    link: "https://coachhub.sierrapablo.dev",
    slug: "coachhub",
  },
];
