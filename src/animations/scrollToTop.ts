const SCROLL_THRESHOLD = 300;

export const initScrollToTop = (buttonId: string) => {
  const scrollToTopBtn = document.getElementById(buttonId);

  if (scrollToTopBtn) {
    let isScrolling: number;

    window.addEventListener('scroll', () => {
      globalThis.cancelAnimationFrame(isScrolling);

      isScrolling = globalThis.requestAnimationFrame(() => {
        if (window.scrollY > SCROLL_THRESHOLD) {
          scrollToTopBtn.classList.add('show');
        } else {
          scrollToTopBtn.classList.remove('show');
        }
      });
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }
};
