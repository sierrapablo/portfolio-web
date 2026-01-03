import { describe, it, expect } from "vitest";
import { initBurgerMenu } from "@/animations/burgerMenu";

describe("initBurgerMenu", () => {
  it("togglea la clase 'active' en burger y nav al hacer click", () => {
    document.body.innerHTML = `
      <button class="burger-menu"></button>
      <nav class="nav-links"></nav>
    `;

    initBurgerMenu();

    const burger = document.querySelector<HTMLElement>(".burger-menu")!;
    const nav = document.querySelector<HTMLElement>(".nav-links")!;

    expect(burger.classList.contains("active")).toBe(false);
    expect(nav.classList.contains("active")).toBe(false);

    burger.click();
    expect(burger.classList.contains("active")).toBe(true);
    expect(nav.classList.contains("active")).toBe(true);

    burger.click();
    expect(burger.classList.contains("active")).toBe(false);
    expect(nav.classList.contains("active")).toBe(false);
  });

  it("cierra el menú cuando se hace click en un link dentro de nav-links", () => {
    document.body.innerHTML = `
      <button class="burger-menu active"></button>
      <nav class="nav-links active">
        <a href="#" onclick="event.preventDefault()">
          <span>About</span>
        </a>
      </nav>
    `;

    initBurgerMenu();

    const burger = document.querySelector<HTMLElement>(".burger-menu")!;
    const nav = document.querySelector<HTMLElement>(".nav-links")!;

    // click en un elemento dentro del <a> para cubrir closest('a')
    const inner = nav.querySelector("a span") as HTMLElement;
    inner.click();

    expect(burger.classList.contains("active")).toBe(false);
    expect(nav.classList.contains("active")).toBe(false);
  });

  it("no cierra el menú si el click en nav-links NO ocurre dentro de un <a>", () => {
    document.body.innerHTML = `
      <button class="burger-menu active"></button>
      <nav class="nav-links active">
        <div class="not-a-link">Hola</div>
      </nav>
    `;

    initBurgerMenu();

    const burger = document.querySelector<HTMLElement>(".burger-menu")!;
    const nav = document.querySelector<HTMLElement>(".nav-links")!;

    (nav.querySelector(".not-a-link") as HTMLElement).click();

    expect(burger.classList.contains("active")).toBe(true);
    expect(nav.classList.contains("active")).toBe(true);
  });

  it("no falla si no encuentra los elementos", () => {
    document.body.innerHTML = `<div></div>`;
    expect(() => initBurgerMenu()).not.toThrow();
  });
});
