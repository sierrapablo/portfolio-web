export function initExperienceCarousel() {
  const carousel = document.getElementById("experience-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (carousel && prevBtn && nextBtn) {
    const scrollAmount = () =>
      carousel.clientWidth > 800 ? 800 : carousel.clientWidth;

    const scrollNext = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

      if (isAtEnd) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: scrollAmount(), behavior: "smooth" });
      }
    };

    const scrollPrev = () => {
      carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    };

    // Auto-play logic
    let autoplayInterval = setInterval(scrollNext, 10000);

    const resetAutoplay = () => {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(scrollNext, 10000);
    };

    prevBtn.addEventListener("click", () => {
      scrollPrev();
      resetAutoplay();
    });

    nextBtn.addEventListener("click", () => {
      scrollNext();
      resetAutoplay();
    });

    // Pause on hover
    carousel.addEventListener("mouseenter", () =>
      clearInterval(autoplayInterval)
    );
    carousel.addEventListener("mouseleave", resetAutoplay);

    const updateButtons = () => {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      (prevBtn as HTMLElement).style.opacity = scrollLeft <= 0 ? "0.3" : "1";
      (prevBtn as HTMLElement).style.pointerEvents =
        scrollLeft <= 0 ? "none" : "all";

      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      (nextBtn as HTMLElement).style.opacity = isAtEnd ? "0.3" : "1";
      (nextBtn as HTMLElement).style.pointerEvents = isAtEnd ? "none" : "all";
    };

    carousel.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }
}
