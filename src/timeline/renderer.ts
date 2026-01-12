import type { Week, ViewMode } from '../types/timeline';
import { formatWeekNumber } from '../utils/dates';
import { createDayId, loadReadDays, toggleDayRead } from '../utils/storage';

/** In-memory cache of read days, synced with localStorage. */
let readDays = new Set<string>();

/** Current view mode - defaults to CFM daily */
let currentViewMode: ViewMode = 'cfm';

/** Cached weeks data for re-rendering */
let cachedWeeks: Week[] = [];

/** Cached current week for re-rendering */
let cachedCurrentWeek = 0;

/**
 * Renders a single day button element.
 * @param weekNumber - The week number (1-52)
 * @param dayIndex - The day index (0-6)
 * @param reading - The reading text for this day
 * @param prefix - Prefix for day ID to distinguish CFM vs chronological ('cfm' or 'chrono')
 */
function renderDayButton(
  weekNumber: number,
  dayIndex: number,
  reading: string,
  prefix = 'cfm'
): string {
  const dayId = createDayId(weekNumber, dayIndex, prefix);
  const dayOfYear = (weekNumber - 1) * 7 + dayIndex + 1;
  const isEmpty = reading.trim() === '';
  const isRead = readDays.has(dayId);

  const classes = ['day-button'];
  if (isEmpty) classes.push('day-button--empty');
  if (isRead) classes.push('day-button--read');

  const readingHtml = isEmpty
    ? '<span class="day-reading day-reading--empty">No reading</span>'
    : `<span class="day-reading">${reading}</span>`;

  return `<button
    type="button"
    class="${classes.join(' ')}"
    data-day-id="${dayId}"
    ${isEmpty ? 'disabled' : ''}
    aria-pressed="${String(isRead)}"
  >
    <span class="day-label">Day ${String(dayOfYear)}</span>
    ${readingHtml}
  </button>`;
}

/**
 * Renders daily readings as interactive day buttons.
 */
function renderDailyReadings(readings: string[], weekNumber: number, prefix: string): string {
  const buttons = readings
    .map((reading, index) => renderDayButton(weekNumber, index, reading, prefix))
    .join('\n                  ');

  return `<div class="day-buttons">
                  ${buttons}
                </div>`;
}

/**
 * Creates HTML for a single week row in the timeline table.
 */
function renderWeekRow(week: Week, isCurrentWeek: boolean, viewMode: ViewMode): string {
  const currentClass = isCurrentWeek ? ' class="current-week"' : '';
  const excerptHtml = week.cfm.excerpt
    ? `<div class="cfm-excerpt">
         <span class="cfm-excerpt-text">${week.cfm.excerpt}...</span>
         <a href="${week.cfm.link}" target="_blank" class="cfm-excerpt-more">See more</a>
       </div>`
    : '';

  // Background image element for all weeks with dynamic image from data
  const weekBg = week.cfm.image
    ? `<span class="week-bg" style="background-image: url('/src/${week.cfm.image}')" aria-hidden="true"></span>`
    : '';

  // Render CFM daily column
  const cfmDailyHtml =
    viewMode === 'cfm' || viewMode === 'both'
      ? `<td class="col-cfm-daily">${renderDailyReadings(week.cfmDaily, week.week, 'cfm')}</td>`
      : '';

  // Render chronological column
  const chronoHtml =
    viewMode === 'chronological' || viewMode === 'both'
      ? `<td class="col-chrono">${renderDailyReadings(week.chronological, week.week, 'chrono')}</td>`
      : '';

  return `
            <tr data-week="${String(week.week)}" data-week-start="${week.startDate}" data-week-end="${week.endDate}"${currentClass}>
              <td class="col-week">
                ${weekBg}
                <span class="row-overlay" aria-hidden="true"></span>
                <div class="weeknum">${formatWeekNumber(week.week)}</div>
                <div class="dates">${week.dateLabel}</div>
              </td>
              <td class="col-cfm">
                <a href="${week.cfm.link}" target="_blank">"${week.cfm.title}"</a>
                <div class="cfm-reading">${week.cfm.reading}</div>
                ${excerptHtml}
              </td>
              ${cfmDailyHtml}
              ${chronoHtml}
            </tr>`;
}

/**
 * Renders the table header based on current view mode.
 */
function renderTableHeader(viewMode: ViewMode): string {
  const cfmDailyHeader =
    viewMode === 'cfm' || viewMode === 'both' ? '<th>CFM Daily Reading</th>' : '';
  const chronoHeader =
    viewMode === 'chronological' || viewMode === 'both' ? '<th>Chronological Reading</th>' : '';

  return `
    <tr>
      <th>Week</th>
      <th>Come, Follow Me (OT 2026)</th>
      ${cfmDailyHeader}
      ${chronoHeader}
    </tr>`;
}

/**
 * Handles click events on day buttons.
 */
function handleDayButtonClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const dayId = button.dataset.dayId;
  if (!dayId) return;

  const isNowRead = toggleDayRead(dayId, readDays);
  button.classList.toggle('day-button--read', isNowRead);
  button.setAttribute('aria-pressed', String(isNowRead));
}

/**
 * Attaches click handlers to all day buttons.
 */
function attachDayButtonHandlers(): void {
  const buttons = document.querySelectorAll('.day-button:not([disabled])');
  buttons.forEach((button) => {
    button.addEventListener('click', handleDayButtonClick);
  });
}

/**
 * Renders all week rows into the timeline table body.
 */
export function renderTimeline(weeks: Week[], currentWeek: number): void {
  // Cache for re-rendering
  cachedWeeks = weeks;
  cachedCurrentWeek = currentWeek;

  const thead = document.querySelector('.timeline thead');
  const tbody = document.querySelector('.timeline tbody');
  if (!thead || !tbody) {
    console.error('Timeline thead/tbody not found');
    return;
  }

  // Load read days from localStorage before rendering
  readDays = loadReadDays();

  // Render header
  thead.innerHTML = renderTableHeader(currentViewMode);

  // Render body
  const html = weeks
    .map((week) => renderWeekRow(week, week.week === currentWeek, currentViewMode))
    .join('\n');

  tbody.innerHTML = html;

  // Attach click handlers after rendering
  attachDayButtonHandlers();

  // Update view toggle button states
  updateViewToggleStates();
}

/**
 * Gets the DOM element for a specific week row.
 */
export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}

/**
 * Gets the current view mode.
 */
export function getViewMode(): ViewMode {
  return currentViewMode;
}

/**
 * Sets the view mode and re-renders the timeline.
 */
export function setViewMode(mode: ViewMode): void {
  if (mode === currentViewMode) return;

  currentViewMode = mode;

  // Save preference to localStorage
  localStorage.setItem('timeline-view-mode', mode);

  // Re-render with cached data
  if (cachedWeeks.length > 0) {
    renderTimeline(cachedWeeks, cachedCurrentWeek);
  }
}

/**
 * Loads view mode from localStorage or returns default.
 */
export function loadViewMode(): ViewMode {
  const saved = localStorage.getItem('timeline-view-mode');
  if (saved === 'cfm' || saved === 'chronological' || saved === 'both') {
    currentViewMode = saved;
  }
  return currentViewMode;
}

/**
 * Updates the active state of view toggle buttons.
 */
function updateViewToggleStates(): void {
  const buttons = document.querySelectorAll('.view-toggle-btn');
  buttons.forEach((btn) => {
    const mode = (btn as HTMLElement).dataset.viewMode as ViewMode;
    btn.classList.toggle('view-toggle-btn--active', mode === currentViewMode);
    btn.setAttribute('aria-pressed', String(mode === currentViewMode));
  });
}
