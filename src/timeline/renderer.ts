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

  return `
            <tr data-week="${String(week.week)}" data-week-start="${week.startDate}" data-week-end="${week.endDate}"${currentClass}>
              <td class="col-week">
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
 * Adjusts line-clamp values for excerpts dynamically based on available space.
 */
function adjustExcerptLineClamps(): void {
  const excerpts = document.querySelectorAll<HTMLElement>('.cfm-excerpt-text');

  excerpts.forEach((excerpt) => {
    const cfmCell = excerpt.closest('.col-cfm');
    const row = excerpt.closest('tr');
    if (!cfmCell || !row) return;

    // Get all the content in the CFM column before the excerpt
    const titleLink = cfmCell.querySelector('a');
    const readingDiv = cfmCell.querySelector('.cfm-reading');
    const excerptContainer = cfmCell.querySelector('.cfm-excerpt');

    if (!titleLink || !readingDiv || !excerptContainer) return;

    // Calculate heights
    const titleHeight = (titleLink as HTMLElement).offsetHeight;
    const readingHeight = (readingDiv as HTMLElement).offsetHeight;
    const excerptMarginTop = 8; // from CSS

    // Get the chronological column to match its height
    const chronoCell = row.querySelector<HTMLElement>('.col-chrono');
    if (!chronoCell) return;

    const chronoHeight = chronoCell.offsetHeight;

    // Available space for excerpt is: chrono column height - title - reading - margins/padding
    const cellPadding = 32; // Approximate padding in cell
    const availableHeight =
      chronoHeight - titleHeight - readingHeight - excerptMarginTop - cellPadding;

    // Calculate how many lines can fit
    const lineHeight = parseFloat(getComputedStyle(excerpt).lineHeight);
    const maxLines = Math.max(2, Math.floor(availableHeight / lineHeight));

    // Apply the calculated line-clamp (cap at 8 lines for very tall rows)
    excerpt.style.webkitLineClamp = String(Math.min(maxLines, 8));
    excerpt.style.setProperty('line-clamp', String(Math.min(maxLines, 8)));
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

  // Adjust excerpt line-clamps after rendering
  requestAnimationFrame(() => {
    adjustExcerptLineClamps();
  });

  // Re-adjust on window resize
  window.addEventListener('resize', adjustExcerptLineClamps);
}

/**
 * Gets the DOM element for a specific week row.
 */
export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}
