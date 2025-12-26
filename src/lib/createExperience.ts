import type { Experience } from "../types/experiences";

export const createExperience = (
  title: string,
  company: string,
  period: string,
  description: string,
  technologies: string[]
): Experience => ({
  title,
  company,
  period,
  description,
  technologies,
});
