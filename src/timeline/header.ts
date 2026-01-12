let isHeaderVisible = true;

/** Initializes sticky header click-to-hide behavior (desktop only). */
export function initStickyHeader(): void {
  const header = document.getElementById('main-header');
  if (!header) return;

  const isMobile = () => window.innerWidth <= 768;

  if (!isMobile()) {
    document.addEventListener('click', () => {
      handlePageClick(header);
    });

    window.addEventListener(
      'scroll',
      () => {
        handleScroll(header);
      },
      { passive: true }
    );
  }

  window.addEventListener('resize', () => {
    if (isMobile()) {
      header.classList.remove('header-hidden');
    }
  });
}

function handlePageClick(header: HTMLElement): void {
  const scrollY = window.scrollY;
  if (scrollY > 100 && !header.classList.contains('header-hidden')) {
    isHeaderVisible = false;
    header.classList.add('header-hidden');
  }
}

function handleScroll(header: HTMLElement): void {
  const scrollY = window.scrollY;
  if ((scrollY > 100 && !isHeaderVisible) || scrollY <= 100) {
    isHeaderVisible = true;
    header.classList.remove('header-hidden');
  }
}
