import { describe, it, expect } from 'vitest';
import TECH from '@/data/tech.json';
import rawExperiences from '@/data/experiences.json';
import rawProjects from '@/data/projects.json';
import { experiences, projects } from '@/lib/data';

describe('data.ts', () => {
  it('exporta experiences y projects como arrays no vacíos (si hay datos)', () => {
    expect(Array.isArray(experiences)).toBe(true);
    expect(Array.isArray(projects)).toBe(true);
    expect(experiences.length).toBeGreaterThan(0);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('mapea techKeys usando TECH cuando existe, y deja la key si no existe', () => {
    const techEntries = Object.entries(TECH as Record<string, string>);
    expect(techEntries.length).toBeGreaterThan(0);

    const [knownKey, mappedValue] = techEntries[0];
    const unknownKey = '__unknown_tech_key__';
    const mapExpected = (key: string) => (TECH as Record<string, string>)[key] ?? key;

    expect(mapExpected(knownKey)).toBe(mappedValue);
    expect(mapExpected(unknownKey)).toBe(unknownKey);

    const anyExp = experiences[0];
    expect(anyExp?.technologies?.length).toBeGreaterThan(0);

    const rawAnyExp = rawExperiences[0] as any;
    if (rawAnyExp?.techKeys?.length) {
      const rawKey = rawAnyExp.techKeys[0] as string;
      const expected = mapExpected(rawKey);
      expect(anyExp?.technologies?.[0]).toBe(expected);
    }
  });

  it('construye experiences y projects con la shape esperada', () => {
    const e = experiences[0];
    expect(e).toHaveProperty('title');
    expect(e).toHaveProperty('company');
    expect(e).toHaveProperty('period');
    expect(e).toHaveProperty('description');
    expect(Array.isArray(e.technologies)).toBe(true);

    const p = projects[0];
    expect(p).toHaveProperty('title');
    expect(p).toHaveProperty('description');
    expect(Array.isArray(p.techStack)).toBe(true);
    expect(p).toHaveProperty('slug');
  });

  it('respeta el número de entradas de los JSON (1:1 mapping)', () => {
    expect(experiences.length).toBe(rawExperiences.length);
    expect(projects.length).toBe(rawProjects.length);
  });
});
