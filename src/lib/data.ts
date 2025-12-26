import type { Experience } from "../types/experiences";
import type { Project } from "../types/projects";
import { createExperience } from "./createExperience";
import { createProject } from "./createProject";
import TECH from "../data/tech.json";
import rawExperiences from "../data/experiences.json";
import rawProjects from "../data/projects.json";

const mapTechKey = (key: string): string => {
  if (!(key in TECH)) {
    console.warn(`[Data] Tech key "${key}" not found in tech.json.`);
    return key;
  }
  return TECH[key as keyof typeof TECH];
};

export const experiences: Experience[] = rawExperiences.map((exp) =>
  createExperience(
    exp.title,
    exp.company,
    exp.period,
    exp.description,
    exp.techKeys.map(mapTechKey),
  ),
);

export const projects: Project[] = rawProjects.map((p) =>
  createProject(
    p.title,
    p.description,
    p.techKeys.map(mapTechKey),
    p.slug,
    p.url,
    p.link,
  ),
);
