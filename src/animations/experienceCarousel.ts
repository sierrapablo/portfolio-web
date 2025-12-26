export function initExperienceCarousel() {
  const carousel = document.getElementById("experience-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const progressBar = document.getElementById("progress-bar");
  const indicators = document.querySelectorAll(".indicator");

  if (carousel && prevBtn && nextBtn && progressBar) {
    const AUTOPLAY_DURATION = 10000;
    let startTime = Date.now();
    let isPaused = false;
    let progressAnimationFrame: number;

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
      resetAutoplay();
    };

    const scrollPrev = () => {
      const { scrollLeft } = carousel;
      if (scrollLeft <= 10) {
        const { scrollWidth } = carousel;
        carousel.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
      }
      resetAutoplay();
    };

    const jumpToSlide = (index: number) => {
      const cards = carousel.querySelectorAll(".card");
      if (cards[index]) {
        (cards[index] as HTMLElement).scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
      resetAutoplay();
    };

    const updateProgress = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed / AUTOPLAY_DURATION) * 100;

        if (progress >= 100) {
          progressBar.style.width = "100%";
          scrollNext();
          return; // scrollNext calls resetAutoplay which restarts the loop
        }
        progressBar.style.width = `${progress}%`;
      }
      progressAnimationFrame = requestAnimationFrame(updateProgress);
    };

    const resetAutoplay = () => {
      startTime = Date.now();
      progressBar.style.width = "0%";
      cancelAnimationFrame(progressAnimationFrame);
      progressAnimationFrame = requestAnimationFrame(updateProgress);
    };

    const pauseAutoplay = () => {
      isPaused = true;
    };

    const resumeAutoplay = () => {
      isPaused = false;
      const currentProgress = parseFloat(progressBar.style.width) || 0;
      startTime = Date.now() - (currentProgress / 100) * AUTOPLAY_DURATION;
    };

    // Event Listeners
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollPrev();
    });
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollNext();
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => jumpToSlide(index));
    });

    carousel.addEventListener("mouseenter", pauseAutoplay);
    carousel.addEventListener("mouseleave", resumeAutoplay);

    const updateState = () => {
      // indicators update logic
      const cards = carousel.querySelectorAll(".card");
      let activeIndex = 0;
      let minDistance = Infinity;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const carouselRect = carousel.getBoundingClientRect();
        const distance = Math.abs(
          cardRect.left +
            cardRect.width / 2 -
            (carouselRect.left + carouselRect.width / 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
    };

    carousel.addEventListener("scroll", updateState);
    window.addEventListener("resize", updateState);

    // Initial update and start
    updateState();
    progressAnimationFrame = requestAnimationFrame(updateProgress);
  }
}
