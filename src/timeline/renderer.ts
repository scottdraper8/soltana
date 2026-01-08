import type { Week } from '../types/timeline';
import { TRACK_ORDER } from '../types/timeline';
import { formatWeekNumber } from '../utils/dates';

/**
 * Resource labels for track checkboxes.
 */
const TRACK_LABELS: Record<string, string> = {
  kjv: 'KJV-JST',
  mac: 'LSB-Mac',
  heb: 'Heb',
  esv: 'ESV',
};

/**
 * Renders chronological readings as a structured list.
 */
function renderChronologicalReadings(readings: string[], weekNumber: number): string {
  // Filter out empty readings for display
  const nonEmptyReadings = readings
    .map((reading, index) => ({
      reading,
      dayOfYear: (weekNumber - 1) * 7 + index + 1,
    }))
    .filter((entry) => entry.reading.trim() !== '');

  // If all readings are empty, show placeholder text
  if (nonEmptyReadings.length === 0) {
    return '<span class="chrono-placeholder">No readings assigned</span>';
  }

  const items = nonEmptyReadings
    .map(
      (entry) =>
        `<li><span class="chrono-day">Day ${String(entry.dayOfYear)}</span> <span class="chrono-reading">${entry.reading}</span></li>`
    )
    .join('\n                  ');

  return `<ol class="chrono-list">
                  ${items}
                </ol>`;
}

/**
 * Creates HTML for a single track checkbox.
 */
function renderTrackCheckbox(resource: string): string {
  const label = TRACK_LABELS[resource] ?? resource.toUpperCase();
  return `<label class="chk"><input type="checkbox"> ${label}</label>`;
}

/**
 * Creates HTML for a single week row in the timeline table.
 */
function renderWeekRow(week: Week, isCurrentWeek: boolean): string {
  const currentClass = isCurrentWeek ? ' class="current-week"' : '';
  const trackHtml = TRACK_ORDER.map(renderTrackCheckbox).join('\n                ');

  return `
            <tr data-week="${String(week.week)}" data-week-start="${week.startDate}" data-week-end="${week.endDate}"${currentClass}>
              <td class="col-week">
                <div class="weeknum">${formatWeekNumber(week.week)}</div>
                <div class="dates">${week.dateLabel}</div>
              </td>
              <td class="col-cfm">
                <a href="${week.cfm.link}" target="_blank">"${week.cfm.title}"</a>
                <div class="cfm-reading">${week.cfm.reading}</div>
              </td>
              <td class="col-chrono">${renderChronologicalReadings(week.chronological, week.week)}</td>
              <td class="col-track">
                ${trackHtml}
              </td>
            </tr>`;
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

  const html = weeks.map((week) => renderWeekRow(week, week.week === currentWeek)).join('\n');

  tbody.innerHTML = html;
}

/**
 * Gets the DOM element for a specific week row.
 */
export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}
