const AUTOPLAY_DURATION = 10000;

const getScrollAmount = (carousel: HTMLElement) =>
  carousel.clientWidth > 800 ? 800 : carousel.clientWidth;

const handleScrollNext = (carousel: HTMLElement, resetAutoplay: () => void) => {
  const { scrollLeft, scrollWidth, clientWidth } = carousel;
  const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;

  if (isAtEnd) {
    carousel.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    carousel.scrollBy({ left: getScrollAmount(carousel), behavior: 'smooth' });
  }
  resetAutoplay();
};

const handleScrollPrev = (carousel: HTMLElement, resetAutoplay: () => void) => {
  const { scrollLeft, scrollWidth } = carousel;
  if (scrollLeft <= 10) {
    carousel.scrollTo({ left: scrollWidth, behavior: 'smooth' });
  } else {
    carousel.scrollBy({ left: -getScrollAmount(carousel), behavior: 'smooth' });
  }
  resetAutoplay();
};

const handleJumpToSlide = (carousel: HTMLElement, index: number, resetAutoplay: () => void) => {
  const cards = carousel.querySelectorAll('.card');
  const card = cards[index];
  if (card) {
    card.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }
  resetAutoplay();
};

const updateUIState = (carousel: HTMLElement, indicators: NodeListOf<Element>) => {
  const cards = carousel.querySelectorAll('.card');
  const { left, width } = carousel.getBoundingClientRect();
  const carouselCenter = left + width / 2;

  let activeIndex = 0;
  let minDistance = Infinity;

  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const distance = Math.abs(cardRect.left + cardRect.width / 2 - carouselCenter);

    if (distance < minDistance) {
      minDistance = distance;
      activeIndex = index;
    }
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === activeIndex);
  });
};

export function initExperienceCarousel() {
  const carousel = document.getElementById('experience-carousel');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const indicators = document.querySelectorAll('.indicator');

  if (!carousel || !prevBtn || !nextBtn || !progressBar) return;

  let startTime = Date.now();
  let isPaused = false;
  let progressAnimationFrame: number;

  const resetAutoplay = () => {
    startTime = Date.now();
    progressBar.style.width = '0%';
    cancelAnimationFrame(progressAnimationFrame);
    progressAnimationFrame = requestAnimationFrame(updateProgress);
  };

  const updateProgress = () => {
    if (!isPaused) {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / AUTOPLAY_DURATION) * 100;

      if (progress >= 100) {
        progressBar.style.width = '100%';
        handleScrollNext(carousel, resetAutoplay);
        return;
      }
      progressBar.style.width = `${progress}%`;
    }
    progressAnimationFrame = requestAnimationFrame(updateProgress);
  };

  const resumeAutoplay = () => {
    isPaused = false;
    const currentProgress = parseFloat(progressBar.style.width) || 0;
    startTime = Date.now() - (currentProgress / 100) * AUTOPLAY_DURATION;
  };

  // Event Listeners
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleScrollPrev(carousel, resetAutoplay);
  });
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleScrollNext(carousel, resetAutoplay);
  });

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => handleJumpToSlide(carousel, index, resetAutoplay));
  });

  carousel.addEventListener('mouseenter', () => (isPaused = true));
  carousel.addEventListener('mouseleave', resumeAutoplay);
  carousel.addEventListener('scroll', () => updateUIState(carousel, indicators));
  window.addEventListener('resize', () => updateUIState(carousel, indicators));

  // Initial update and start
  updateUIState(carousel, indicators);
  progressAnimationFrame = requestAnimationFrame(updateProgress);
}
