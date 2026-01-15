import { setViewMode, getViewMode } from './renderer';

let fabHideTimeout: ReturnType<typeof setTimeout> | null = null;
let tooltipHideTimeout: ReturnType<typeof setTimeout> | null = null;

export const TOOLTIP_TEXT = {
  lesson: 'Switch to Chronological Order',
  chronological: 'Switch to Book Order',
} as const;

export function getTooltipText(): string {
  return TOOLTIP_TEXT[getViewMode()];
}

function renderSortToggle(): string {
  const currentMode = getViewMode();
  const isLesson = currentMode === 'lesson';

  const sortIcon = `
    <svg class="sort-icon ${isLesson ? 'sort-lesson' : 'sort-chrono'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 5h10"/>
      <path d="M11 9h7"/>
      <path d="M11 13h4"/>
      <path d="M3 17l3 3 3-3"/>
      <path d="M6 18V4"/>
    </svg>
  `;

  return `
    <button
      type="button"
      class="sort-toggle-btn"
      data-current-mode="${currentMode}"
      aria-label="Toggle reading order"
    >
      ${sortIcon}
      <span class="sort-tooltip">${getTooltipText()}</span>
    </button>
  `;
}

function handleSortToggleClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const currentMode = button.dataset.currentMode;
  const newMode = currentMode === 'lesson' ? 'chronological' : 'lesson';
  setViewMode(newMode);
}

function isMobile(): boolean {
  return window.innerWidth <= 1768;
}

function showFabTemporarily(): void {
  const fab = document.getElementById('sort-fab');
  if (!fab || !isMobile()) return;

  fab.classList.add('visible');

  if (fabHideTimeout) clearTimeout(fabHideTimeout);
  fabHideTimeout = setTimeout(() => {
    fab.classList.remove('visible');
  }, 5000);
}

function showTooltip(): void {
  const fab = document.getElementById('sort-fab');
  const tooltip = fab?.querySelector('.sort-fab-tooltip');
  if (!tooltip) return;

  tooltip.classList.add('show');

  if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
  tooltipHideTimeout = setTimeout(() => {
    tooltip.classList.remove('show');
  }, 2000);
}

function updateFabVisibility(): void {
  const fab = document.getElementById('sort-fab');
  if (!fab) return;

  const thead = document.querySelector('.timeline thead');
  if (!thead) return;

  if (isMobile()) {
    if (!fab.classList.contains('visible')) {
      showFabTemporarily();
    }
  } else {
    const rect = thead.getBoundingClientRect();
    const isHeaderVisible = rect.bottom > 0;
    fab.classList.toggle('visible', !isHeaderVisible);
  }
}

export function updateSortFabIcon(): void {
  const fab = document.getElementById('sort-fab');
  if (!fab) return;

  const isLesson = getViewMode() === 'lesson';

  const icon = fab.querySelector('.sort-fab-icon');
  if (icon) {
    icon.classList.toggle('sort-lesson', isLesson);
    icon.classList.toggle('sort-chrono', !isLesson);
  }

  const tooltip = fab.querySelector('.sort-fab-tooltip');
  if (tooltip) {
    tooltip.textContent = getTooltipText();
  }
}

function initSortFab(): void {
  const fab = document.getElementById('sort-fab');
  if (!fab) return;

  fab.addEventListener('click', () => {
    const newMode = getViewMode() === 'lesson' ? 'chronological' : 'lesson';
    setViewMode(newMode);
    showTooltip();
    if (isMobile()) {
      showFabTemporarily();
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!isMobile()) {
        updateFabVisibility();
      }
    },
    { passive: true }
  );

  const touchZone = document.createElement('div');
  touchZone.className = 'sort-fab-touch-zone';
  document.body.appendChild(touchZone);
  touchZone.addEventListener('click', () => {
    if (isMobile()) {
      showFabTemporarily();
    }
  });

  updateFabVisibility();
}

export function initViewToggle(containerId = 'sort-toggle-container'): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Sort toggle container #${containerId} not found`);
    return;
  }

  container.innerHTML = renderSortToggle();
  const button = container.querySelector('.sort-toggle-btn');
  if (button) {
    button.addEventListener('click', handleSortToggleClick);
  }

  updateSortFabIcon();
  initSortFab();
}
