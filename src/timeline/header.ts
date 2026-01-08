let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
let isScrolling = false;

/**
 * Initializes the sticky header auto-hide behavior.
 */
export function initStickyHeader(): void {
  const header = document.getElementById('main-header');

  if (!header) {
    return;
  }

  window.addEventListener(
    'scroll',
    () => {
      handleScroll(header);
    },
    { passive: true }
  );
}

/**
 * Handles scroll events for the sticky header.
 * Shows header while scrolling, hides immediately when scrolling stops.
 */
function handleScroll(header: HTMLElement): void {
  const scrollY = window.scrollY;

  if (!isScrolling && scrollY > 100) {
    isScrolling = true;
    header.classList.remove('header-hidden');
  }

  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    if (scrollY > 100) {
      header.classList.add('header-hidden');
    }
  }, 50);

  if (scrollY <= 100) {
    header.classList.remove('header-hidden');
  }
}
