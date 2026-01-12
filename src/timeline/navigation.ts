import { getWeekRow } from './renderer';

let currentWeekRow: HTMLTableRowElement | null = null;

export function setCurrentWeekRow(weekNumber: number): void {
  currentWeekRow = getWeekRow(weekNumber);
}

function scrollToCurrentWeek(): void {
  if (currentWeekRow) {
    currentWeekRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function initScrollNavButton(): void {
  const scrollNav = document.getElementById('scroll-nav');
  const scrollArrow = scrollNav?.querySelector('.scroll-arrow') as HTMLElement | null;
  if (!scrollNav || !scrollArrow) return;

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
    scrollArrow.style.transform = rect.top > viewportHeight ? 'rotate(0deg)' : 'rotate(180deg)';
  }
}

export function initialScrollToCurrentWeek(): void {
  if (currentWeekRow) {
    setTimeout(scrollToCurrentWeek, 300);
  }
}
