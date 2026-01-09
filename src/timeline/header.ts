let isHeaderVisible = true;

/**
 * Initializes the sticky header click-to-hide behavior.
 */
export function initStickyHeader(): void {
  const header = document.getElementById('main-header');

  if (!header) {
    return;
  }

  // Check if we're on mobile
  const isMobile = () => window.innerWidth <= 768;

  // Only add click listener if not on mobile
  if (!isMobile()) {
    // Click anywhere on page to hide header when in sticky mode
    document.addEventListener('click', () => {
      handlePageClick(header);
    });

    // Show header when scrolling starts (if hidden and past threshold)
    window.addEventListener(
      'scroll',
      () => {
        handleScroll(header);
      },
      { passive: true }
    );
  }

  // Re-check on resize to handle orientation changes
  window.addEventListener('resize', () => {
    if (isMobile()) {
      header.classList.remove('header-hidden');
    }
  });
}

/**
 * Handles click events anywhere on the page.
 * Hides header when clicked while in sticky mode.
 */
function handlePageClick(header: HTMLElement): void {
  const scrollY = window.scrollY;

  // Only hide if we're past the threshold (in sticky mode)
  if (scrollY > 100 && !header.classList.contains('header-hidden')) {
    isHeaderVisible = false;
    header.classList.add('header-hidden');
  }
}

/**
 * Handles scroll events for the sticky header.
 * Shows header when scrolling if it was hidden.
 */
function handleScroll(header: HTMLElement): void {
  const scrollY = window.scrollY;

  // Show header when scrolling starts or when at top
  if ((scrollY > 100 && !isHeaderVisible) || scrollY <= 100) {
    isHeaderVisible = true;
    header.classList.remove('header-hidden');
  }
}
