import type { Week } from '../types/timeline';
import { formatWeekNumber } from '../utils/dates';
import { createDayId, loadReadDays, toggleDayRead } from '../utils/storage';

/** In-memory cache of read days, synced with localStorage. */
let readDays = new Set<string>();

/**
 * Renders a single day button element.
 */
function renderDayButton(weekNumber: number, dayIndex: number, reading: string): string {
  const dayId = createDayId(weekNumber, dayIndex);
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
 * Renders chronological readings as interactive day buttons.
 */
function renderChronologicalReadings(readings: string[], weekNumber: number): string {
  const buttons = readings
    .map((reading, index) => renderDayButton(weekNumber, index, reading))
    .join('\n                  ');

  return `<div class="day-buttons">
                  ${buttons}
                </div>`;
}

/**
 * Creates HTML for a single week row in the timeline table.
 */
function renderWeekRow(week: Week, isCurrentWeek: boolean): string {
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
              <td class="col-chrono">${renderChronologicalReadings(week.chronological, week.week)}</td>
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
  const tbody = document.querySelector('.timeline tbody');
  if (!tbody) {
    console.error('Timeline tbody not found');
    return;
  }

  // Load read days from localStorage before rendering
  readDays = loadReadDays();

  const html = weeks.map((week) => renderWeekRow(week, week.week === currentWeek)).join('\n');

  tbody.innerHTML = html;

  // Attach click handlers after rendering
  attachDayButtonHandlers();
}

/**
 * Gets the DOM element for a specific week row.
 */
export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}
