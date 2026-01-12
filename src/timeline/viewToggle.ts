import type { ViewMode } from '../types/timeline';
import { setViewMode, getViewMode } from './renderer';

/**
 * Renders the view toggle buttons for switching between reading plans.
 */
export function renderViewToggle(): string {
  const currentMode = getViewMode();

  return `
    <div class="view-toggle" role="group" aria-label="Reading plan view options">
      <button
        type="button"
        class="view-toggle-btn ${currentMode === 'cfm' ? 'view-toggle-btn--active' : ''}"
        data-view-mode="cfm"
        aria-pressed="${String(currentMode === 'cfm')}"
        title="Show Come, Follow Me daily readings"
      >
        <svg class="view-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <span class="view-toggle-label">CFM</span>
      </button>
      <button
        type="button"
        class="view-toggle-btn ${currentMode === 'chronological' ? 'view-toggle-btn--active' : ''}"
        data-view-mode="chronological"
        aria-pressed="${String(currentMode === 'chronological')}"
        title="Show chronological Old Testament readings"
      >
        <svg class="view-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="view-toggle-label">Chronological</span>
      </button>
      <button
        type="button"
        class="view-toggle-btn ${currentMode === 'both' ? 'view-toggle-btn--active' : ''}"
        data-view-mode="both"
        aria-pressed="${String(currentMode === 'both')}"
        title="Show both reading plans side by side"
      >
        <svg class="view-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
        </svg>
        <span class="view-toggle-label">Both</span>
      </button>
    </div>
  `;
}

/**
 * Handles click events on view toggle buttons.
 */
function handleViewToggleClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const mode = button.dataset.viewMode as ViewMode | undefined;
  if (mode === 'cfm' || mode === 'chronological' || mode === 'both') {
    setViewMode(mode);
  }
}

/**
 * Attaches click handlers to view toggle buttons.
 */
export function attachViewToggleHandlers(): void {
  const buttons = document.querySelectorAll('.view-toggle-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', handleViewToggleClick);
  });
}

/**
 * Initializes the view toggle component.
 * Renders the toggle into the specified container and attaches handlers.
 */
export function initViewToggle(containerId = 'view-toggle-container'): void {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`View toggle container #${containerId} not found`);
    return;
  }

  container.innerHTML = renderViewToggle();
  attachViewToggleHandlers();
}
