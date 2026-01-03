import { describe, it, expect } from "vitest";
import { createExperience } from "@/lib/createExperience";

describe("createExperience", () => {
  it("crea una Experience con todos los campos", () => {
    const exp = createExperience(
      "Frontend Developer",
      "ACME",
      "2022 – 2024",
      "Desarrollo de aplicaciones web",
      ["Astro", "TypeScript", "Tailwind"]
    );

    expect(exp).toEqual({
      title: "Frontend Developer",
      company: "ACME",
      period: "2022 – 2024",
      description: "Desarrollo de aplicaciones web",
      technologies: ["Astro", "TypeScript", "Tailwind"],
    });
  });

  it("mantiene el orden de las tecnologías", () => {
    const exp = createExperience(
      "Backend Developer",
      "ACME",
      "2021",
      "APIs",
      ["Node", "PostgreSQL"]
    );

    expect(exp?.technologies?.[0]).toBe("Node");
    expect(exp?.technologies?.[1]).toBe("PostgreSQL");
  });
});
