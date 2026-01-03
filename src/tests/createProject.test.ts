import { describe, it, expect } from 'vitest';
import { createProject } from '@/lib/createProject';

describe('createProject', () => {
  it('crea un Project con todos los campos', () => {
    const p = createProject(
      'Proyecto de test',
      'Descripción',
      ['Astro', 'TypeScript'],
      'proyecto-de-test',
      'https://example.com',
      'https://github.com/sierrapablo/proyecto-de-test',
    );

    expect(p).toEqual({
      title: 'Proyecto de test',
      description: 'Descripción',
      techStack: ['Astro', 'TypeScript'],
      slug: 'proyecto-de-test',
      url: 'https://example.com',
      link: 'https://github.com/sierrapablo/proyecto-de-test',
    });
  });

  it('permite url y link opcionales', () => {
    const p = createProject('Sin links', 'Solo datos', ['Astro'], 'sin-links');

    expect(p.url).toBeUndefined();
    expect(p.link).toBeUndefined();
    expect(p.slug).toBe('sin-links');
  });
});
