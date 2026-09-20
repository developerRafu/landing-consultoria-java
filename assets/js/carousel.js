export function initCarousel(container, config = {}) {
  const track = container.querySelector(".carousel__track");
  const slides = container.querySelectorAll(".carousel__slide");
  const prevBtn = container.querySelector(".carousel__arrow--prev");
  const nextBtn = container.querySelector(".carousel__arrow--next");
  const dotsContainer = container.querySelector(".carousel__dots");

  if (!track || slides.length === 0) {
    return;
  }

  const isSingle = slides.length === 1;
  const showArrows = !isSingle && config.showArrows;
  const showDots = !isSingle && config.showDots;
  const autoplay = !isSingle && config.autoplay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const interval = config.interval || 5000;

  if (isSingle) {
    container.classList.add("carousel--single");
    if (prevBtn) prevBtn.remove();
    if (nextBtn) nextBtn.remove();
    if (dotsContainer) dotsContainer.remove();
    return;
  }

  if (!showArrows) {
    prevBtn?.remove();
    nextBtn?.remove();
  }

  if (!showDots && dotsContainer) {
    dotsContainer.remove();
  }

  let currentIndex = 0;
  let autoplayTimer = null;

  const getSlideWidth = () => {
    const slide = slides[0];
    return slide.offsetWidth + parseInt(getComputedStyle(track).gap || "0", 10);
  };

  const goTo = (index) => {
    const maxIndex = slides.length - 1;
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    track.scrollTo({ left: currentIndex * getSlideWidth(), behavior: "smooth" });
    updateDots();
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll(".carousel__dot").forEach((dot, i) => {
      dot.classList.toggle("carousel__dot--active", i === currentIndex);
      dot.setAttribute("aria-selected", i === currentIndex ? "true" : "false");
    });
  };

  const startAutoplay = () => {
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goTo(currentIndex >= slides.length - 1 ? 0 : currentIndex + 1);
    }, interval);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  if (showDots && dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = `carousel__dot${i === 0 ? " carousel__dot--active" : ""}`;
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  prevBtn?.addEventListener("click", () => goTo(currentIndex - 1));
  nextBtn?.addEventListener("click", () => goTo(currentIndex + 1));

  track.addEventListener("scroll", () => {
    const width = getSlideWidth();
    if (width === 0) return;
    currentIndex = Math.round(track.scrollLeft / width);
    updateDots();
  }, { passive: true });

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);
  container.addEventListener("focusin", stopAutoplay);
  container.addEventListener("focusout", startAutoplay);

  startAutoplay();
}
