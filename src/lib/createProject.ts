import type { Project } from '../types/projects';

export const createProject = (
  title: string,
  description: string,
  techStack: string[],
  slug: string,
  url?: string,
  link?: string,
): Project => ({
  title,
  description,
  techStack,
  slug,
  url,
  link,
});
