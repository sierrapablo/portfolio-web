import { describe, it, expect, vi } from 'vitest';

vi.mock('@/data/tech.json', () => ({
  default: { astro: 'Astro' },
}));

vi.mock('@/data/experiences.json', () => ({
  default: [
    {
      title: 'T',
      company: 'C',
      period: 'P',
      description: 'D',
      techKeys: ['__missing__'],
    },
  ],
}));

vi.mock('@/data/projects.json', () => ({
  default: [
    {
      title: 'PT',
      description: 'PD',
      techKeys: ['astro', '__missing__'],
      slug: 'slug',
      url: undefined,
      link: undefined,
    },
  ],
}));

describe('data.ts (unknown tech branch)', () => {
  it('si TECH no tiene la key, devuelve la key tal cual', async () => {
    const mod = await import('@/lib/data');

    expect(mod.experiences[0].technologies).toEqual(['__missing__']);
    expect(mod.projects[0].techStack).toEqual(['Astro', '__missing__']);
  });
});
