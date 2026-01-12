import { setViewMode, getViewMode } from './renderer';

function renderViewToggle(): string {
  const currentMode = getViewMode();

  return `
    <div class="view-toggle" role="group" aria-label="Reading order options">
      <button
        type="button"
        class="view-toggle-btn ${currentMode === 'lesson' ? 'view-toggle-btn--active' : ''}"
        data-view-mode="lesson"
        aria-pressed="${String(currentMode === 'lesson')}"
        title="Show readings in Come, Follow Me lesson order"
      >
        <svg class="view-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <span class="view-toggle-label">Lesson Order</span>
      </button>
      <button
        type="button"
        class="view-toggle-btn ${currentMode === 'chronological' ? 'view-toggle-btn--active' : ''}"
        data-view-mode="chronological"
        aria-pressed="${String(currentMode === 'chronological')}"
        title="Show readings in Old Testament chronological order"
      >
        <svg class="view-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="view-toggle-label">Chronological</span>
      </button>
    </div>
  `;
}

function handleViewToggleClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const mode = button.dataset.viewMode;
  if (mode === 'lesson' || mode === 'chronological') {
    setViewMode(mode);
  }
}

export function initViewToggle(containerId = 'view-toggle-container'): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`View toggle container #${containerId} not found`);
    return;
  }

  container.innerHTML = renderViewToggle();
  container.querySelectorAll('.view-toggle-btn').forEach((button) => {
    button.addEventListener('click', handleViewToggleClick);
  });
}
