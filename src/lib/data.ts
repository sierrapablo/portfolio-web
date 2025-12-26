import type { Experience } from "../types/experiences";
import type { Project } from "../types/projects";
import { createExperience } from "./createExperience";
import { createProject } from "./createProject";
import TECH from "../data/tech.json";
import rawExperiences from "../data/experiences.json";
import rawProjects from "../data/projects.json";

export const experiences: Experience[] = rawExperiences.map((exp) =>
  createExperience(
    exp.title,
    exp.company,
    exp.period,
    exp.description,
    exp.techKeys.map((key) => TECH[key as keyof typeof TECH] || key)
  )
);

export const projects: Project[] = rawProjects.map((p) =>
  createProject(
    p.title,
    p.description,
    p.techKeys.map((key) => TECH[key as keyof typeof TECH] || key),
    p.slug,
    p.url,
    p.link
  )
);
