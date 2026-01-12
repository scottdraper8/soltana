import { setViewMode, getViewMode } from './renderer';

function renderSortToggle(): string {
  const currentMode = getViewMode();
  const isLesson = currentMode === 'lesson';

  // Sort icon that rotates based on mode
  const sortIcon = `
    <svg class="sort-icon ${isLesson ? 'sort-lesson' : 'sort-chrono'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 5h10"/>
      <path d="M11 9h7"/>
      <path d="M11 13h4"/>
      <path d="M3 17l3 3 3-3"/>
      <path d="M6 18V4"/>
    </svg>
  `;

  const tooltipText = isLesson ? 'Switch to Chronological Order' : 'Switch to Lesson Order';

  return `
    <button
      type="button"
      class="sort-toggle-btn"
      data-current-mode="${currentMode}"
      aria-label="Toggle reading order"
    >
      ${sortIcon}
      <span class="sort-tooltip">${tooltipText}</span>
    </button>
  `;
}

function handleSortToggleClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const currentMode = button.dataset.currentMode;
  const newMode = currentMode === 'lesson' ? 'chronological' : 'lesson';
  setViewMode(newMode);
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
}
