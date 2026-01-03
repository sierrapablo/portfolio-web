import { describe, it, expect, vi, beforeEach } from "vitest";
import { initScrollToTop } from "@/animations/scrollToTop";

describe("initScrollToTop", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("muestra el botón cuando scrollY > 300", () => {
    document.body.innerHTML = `<button id="toTop"></button>`;

    Object.defineProperty(window, "scrollY", {
      value: 500,
      writable: true,
    });
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }
    );

    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    initScrollToTop("toTop");

    window.dispatchEvent(new Event("scroll"));

    const btn = document.getElementById("toTop")!;
    expect(btn.classList.contains("show")).toBe(true);
  });

  it("oculta el botón cuando scrollY <= 300", () => {
    document.body.innerHTML = `<button id="toTop" class="show"></button>`;

    Object.defineProperty(window, "scrollY", {
      value: 100,
      writable: true,
    });

    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      }
    );

    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    initScrollToTop("toTop");

    window.dispatchEvent(new Event("scroll"));

    const btn = document.getElementById("toTop")!;
    expect(btn.classList.contains("show")).toBe(false);
  });

  it("hace scroll suave al top cuando se hace click", () => {
    document.body.innerHTML = `<button id="toTop"></button>`;

    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    initScrollToTop("toTop");

    const btn = document.getElementById("toTop")!;
    btn.click();

    expect(scrollSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("no falla si el botón no existe", () => {
    expect(() => initScrollToTop("does-not-exist")).not.toThrow();
  });
});
