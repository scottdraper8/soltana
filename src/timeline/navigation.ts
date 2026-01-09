import { getWeekRow } from './renderer';

let currentWeekRow: HTMLTableRowElement | null = null;

/**
 * Sets the current week row reference for navigation.
 */
export function setCurrentWeekRow(weekNumber: number): void {
  currentWeekRow = getWeekRow(weekNumber);
}

/**
 * Scrolls the current week row into view.
 */
function scrollToCurrentWeek(): void {
  if (currentWeekRow) {
    currentWeekRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Initializes the scroll navigation button behavior.
 */
export function initScrollNavButton(): void {
  const scrollNav = document.getElementById('scroll-nav');
  const scrollArrow = scrollNav?.querySelector('.scroll-arrow') as HTMLElement | null;

  if (!scrollNav || !scrollArrow) {
    return;
  }

  scrollNav.addEventListener('click', scrollToCurrentWeek);

  window.addEventListener(
    'scroll',
    () => {
      updateScrollNavVisibility(scrollNav, scrollArrow);
    },
    { passive: true }
  );

  updateScrollNavVisibility(scrollNav, scrollArrow);
}

/**
 * Updates the visibility and direction of the scroll nav button.
 */
function updateScrollNavVisibility(scrollNav: HTMLElement, scrollArrow: HTMLElement): void {
  if (!currentWeekRow) {
    scrollNav.classList.remove('visible');
    return;
  }

  const rect = currentWeekRow.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const isInView = rect.top >= 0 && rect.bottom <= viewportHeight;

  if (isInView) {
    scrollNav.classList.remove('visible');
  } else {
    scrollNav.classList.add('visible');

    if (rect.top > viewportHeight) {
      scrollArrow.style.transform = 'rotate(0deg)';
    } else {
      scrollArrow.style.transform = 'rotate(180deg)';
    }
  }
}

/**
 * Performs initial scroll to current week on page load.
 */
export function initialScrollToCurrentWeek(): void {
  if (currentWeekRow) {
    setTimeout(scrollToCurrentWeek, 300);
  }
}
