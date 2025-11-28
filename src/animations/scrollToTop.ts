export const initScrollToTop = (buttonId: string) => {
  const scrollToTopBtn = document.getElementById(buttonId);

  if (scrollToTopBtn) {
    let isScrolling: number;

    window.addEventListener("scroll", () => {
      window.cancelAnimationFrame(isScrolling);

      isScrolling = window.requestAnimationFrame(() => {
        if (window.scrollY > 300) {
          scrollToTopBtn.classList.add("show");
        } else {
          scrollToTopBtn.classList.remove("show");
        }
      });
    });

    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
};
