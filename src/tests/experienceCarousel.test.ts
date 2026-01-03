import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initExperienceCarousel } from '@/animations/experienceCarousel';

type Rect = { left: number; width: number };

function setRect(el: Element, rect: Rect) {
  (el as any).getBoundingClientRect = () =>
    ({
      left: rect.left,
      width: rect.width,
      top: 0,
      right: rect.left + rect.width,
      bottom: 0,
      height: 0,
      x: rect.left,
      y: 0,
      toJSON: () => {},
    }) as DOMRect;
}

describe('initExperienceCarousel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('sale sin hacer nada si faltan elementos requeridos', () => {
    document.body.innerHTML = `<div id="experience-carousel"></div>`;
    expect(() => initExperienceCarousel()).not.toThrow();
  });

  it('marca el indicador activo correcto y lo actualiza en scroll/resize', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card" id="c0"></div>
        <div class="card" id="c1"></div>
        <div class="card" id="c2"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar"></div>
      <div class="indicator" id="i0"></div>
      <div class="indicator" id="i1"></div>
      <div class="indicator" id="i2"></div>
    `;

    const carousel = document.getElementById('experience-carousel')!;
    const cards = carousel.querySelectorAll('.card');
    const indicators = document.querySelectorAll('.indicator');

    setRect(carousel, { left: 0, width: 100 });

    setRect(cards[0], { left: 0, width: 20 }); // center 10
    setRect(cards[1], { left: 40, width: 20 }); // center 50
    setRect(cards[2], { left: 80, width: 20 }); // center 90

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    initExperienceCarousel();

    expect(indicators[0].classList.contains('active')).toBe(false);
    expect(indicators[1].classList.contains('active')).toBe(true);
    expect(indicators[2].classList.contains('active')).toBe(false);

    // Ahora el más cercano será el 0
    setRect(cards[0], { left: 40, width: 20 }); // center 50
    setRect(cards[1], { left: 0, width: 20 }); // center 10
    setRect(cards[2], { left: 80, width: 20 }); // center 90

    carousel.dispatchEvent(new Event('scroll'));
    expect(indicators[0].classList.contains('active')).toBe(true);

    window.dispatchEvent(new Event('resize'));
    expect(indicators[0].classList.contains('active')).toBe(true);
  });

  it('next: hace scrollBy si no está al final; hace scrollTo(0) si está al final', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar"></div>
      <div class="indicator"></div>
    `;

    const carousel = document.getElementById('experience-carousel') as any;

    Object.defineProperty(carousel, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(carousel, 'scrollWidth', { value: 2000, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', {
      value: 200,
      writable: true,
      configurable: true,
    });

    const scrollBySpy = vi.fn();
    const scrollToSpy = vi.fn();
    carousel.scrollBy = scrollBySpy;
    carousel.scrollTo = scrollToSpy;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    initExperienceCarousel();

    const next = document.getElementById('next-btn')!;

    // NO final => scrollBy
    next.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scrollBySpy).toHaveBeenCalled();
    expect(scrollToSpy).not.toHaveBeenCalled();

    // Final => scrollTo(0)
    (carousel as any).scrollLeft = 1495; // 1495 + 500 = 1995 >= 1990
    scrollBySpy.mockClear();
    scrollToSpy.mockClear();

    next.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scrollToSpy).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
    expect(scrollBySpy).not.toHaveBeenCalled();
  });

  it('prev: hace scrollTo(scrollWidth) si está al inicio; hace scrollBy negativo si no', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar"></div>
      <div class="indicator"></div>
    `;

    const carousel = document.getElementById('experience-carousel') as any;

    Object.defineProperty(carousel, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(carousel, 'scrollWidth', { value: 2000, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', { value: 5, writable: true, configurable: true });

    const scrollBySpy = vi.fn();
    const scrollToSpy = vi.fn();
    carousel.scrollBy = scrollBySpy;
    carousel.scrollTo = scrollToSpy;

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    initExperienceCarousel();

    const prev = document.getElementById('prev-btn')!;

    // Inicio => scrollTo(scrollWidth)
    prev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scrollToSpy).toHaveBeenCalledWith({ left: 2000, behavior: 'smooth' });
    expect(scrollBySpy).not.toHaveBeenCalled();

    // No inicio => scrollBy negativo
    (carousel as any).scrollLeft = 300;
    scrollBySpy.mockClear();
    scrollToSpy.mockClear();

    prev.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(scrollBySpy).toHaveBeenCalled();
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('click en un indicador hace scrollIntoView del card correspondiente', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card" id="c0"></div>
        <div class="card" id="c1"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar"></div>
      <button class="indicator" id="i0" type="button"></button>
      <button class="indicator" id="i1" type="button"></button>
    `;

    const c1 = document.getElementById('c1') as any;
    c1.scrollIntoView = vi.fn();

    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    initExperienceCarousel();

    document.getElementById('i1')!.click();

    expect(c1.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  });

  it('autoplay: cuando el progreso llega a 100% avanza el carrusel y resetea el progreso', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar" style="width: 0%"></div>
      <div class="indicator"></div>
    `;

    const carousel = document.getElementById('experience-carousel') as any;
    const progressBar = document.getElementById('progress-bar') as HTMLDivElement;

    Object.defineProperty(carousel, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(carousel, 'scrollWidth', { value: 2000, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', {
      value: 200,
      writable: true,
      configurable: true,
    });

    carousel.scrollBy = vi.fn();
    carousel.scrollTo = vi.fn();

    let rafCalls = 0;
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCalls += 1;
      if (rafCalls === 1) cb(0);
      return rafCalls;
    });

    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      const v = now;
      now += 20_000;
      return v;
    });

    initExperienceCarousel();

    expect(
      (carousel.scrollBy as any).mock.calls.length + (carousel.scrollTo as any).mock.calls.length,
    ).toBeGreaterThan(0);

    expect(progressBar.style.width).toBe('0%');

    expect(cancelSpy).toHaveBeenCalled();
    expect(rafSpy).toHaveBeenCalled();
  });

  it('pausa con mouseenter y reanuda con mouseleave (no avanza progreso mientras está pausado)', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar" style="width: 0%"></div>
      <div class="indicator"></div>
    `;

    const carousel = document.getElementById('experience-carousel') as any;
    const progressBar = document.getElementById('progress-bar') as HTMLDivElement;

    Object.defineProperty(carousel, 'clientWidth', { value: 500, configurable: true });
    Object.defineProperty(carousel, 'scrollWidth', { value: 2000, configurable: true });
    Object.defineProperty(carousel, 'scrollLeft', {
      value: 200,
      writable: true,
      configurable: true,
    });

    carousel.scrollBy = vi.fn();
    carousel.scrollTo = vi.fn();

    const rafCbs: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    initExperienceCarousel();

    carousel.dispatchEvent(new Event('mouseenter'));

    const tick1 = rafCbs.shift()!;
    now += 5000;
    tick1(0);

    expect(progressBar.style.width).toBe('0%');

    carousel.dispatchEvent(new Event('mouseleave'));

    const tick2 = rafCbs.shift()!;
    now += 1000;
    tick2(0);

    expect(progressBar.style.width).not.toBe('0%');
  });

  it('si se hace click en un indicador sin card correspondiente, no rompe y resetea autoplay', () => {
    document.body.innerHTML = `
      <div id="experience-carousel">
        <div class="card" id="c0"></div>
      </div>
      <button id="prev-btn" type="button">Prev</button>
      <button id="next-btn" type="button">Next</button>
      <div id="progress-bar" style="width: 50%"></div>

      <!-- 2 indicadores pero solo 1 card -->
      <button class="indicator" id="i0" type="button"></button>
      <button class="indicator" id="i1" type="button"></button>
    `;

    const progressBar = document.getElementById('progress-bar') as HTMLDivElement;

    let rafCalls = 0;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => {
      rafCalls += 1;
      return rafCalls;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

    const c0 = document.getElementById('c0') as any;
    c0.scrollIntoView = vi.fn();

    initExperienceCarousel();

    document.getElementById('i1')!.click();

    expect(c0.scrollIntoView).not.toHaveBeenCalled();
    expect(progressBar.style.width).toBe('0%');
  });
});
