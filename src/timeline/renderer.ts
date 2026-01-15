import type { Week, ViewMode } from '../types/timeline';
import { formatWeekNumber } from '../utils/dates';
import { createDayId, loadReadDays, toggleDayRead } from '../utils/storage';
import { formatChapters, distributeAcrossDays } from '../utils/chapterFormatter';
import { updateSortFabIcon, getTooltipText } from './viewToggle';
import chronologicalOrderData from '../data/chronologicalOrder.json';

let readDays = new Set<string>();
let currentViewMode: ViewMode = 'lesson';
let cachedWeeks: Week[] = [];

const chronoIndexMap = new Map<string, number>();
chronologicalOrderData.itemListElement.forEach((item, index) => {
  if (Array.isArray(item)) {
    for (const chapter of item) {
      chronoIndexMap.set(chapter, index);
    }
  } else {
    chronoIndexMap.set(item, index);
  }
});

function getDailyReadings(week: Week, viewMode: ViewMode): string[] {
  const chapters =
    viewMode === 'lesson'
      ? week.chapters
      : [...week.chapters].sort(
          (a, b) => (chronoIndexMap.get(a) ?? Infinity) - (chronoIndexMap.get(b) ?? Infinity)
        );

  const days = distributeAcrossDays(chapters);
  return days.map(formatChapters);
}

function renderDayButton(weekNumber: number, dayIndex: number, reading: string): string {
  const dayId = createDayId(weekNumber, dayIndex);
  const dayOfYear = (weekNumber - 1) * 7 + dayIndex + 1;
  const isEmpty = reading === '';
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

function renderDailyReadings(readings: string[], weekNumber: number): string {
  const buttons = readings
    .map((reading, index) => renderDayButton(weekNumber, index, reading))
    .join('\n');

  return `<div class="day-buttons">${buttons}</div>`;
}

function renderWeekRow(week: Week, isCurrentWeek: boolean): string {
  const currentClass = isCurrentWeek ? ' class="current-week"' : '';

  const excerptHtml = week.cfm.excerpt
    ? `<div class="cfm-excerpt">
         <span class="cfm-excerpt-text">${week.cfm.excerpt}</span>
         <a href="${week.cfm.link}" target="_blank" class="cfm-excerpt-more">See more</a>
       </div>`
    : '';

  const weekBg = week.cfm.image
    ? `<span class="week-bg" data-bg-image="${week.cfm.image}" aria-hidden="true"></span>`
    : '';

  const daily = getDailyReadings(week, currentViewMode);
  const readingsHtml = `<td class="col-readings">${renderDailyReadings(daily, week.week)}</td>`;

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
      ${readingsHtml}
    </tr>`;
}

function handleDayButtonClick(event: Event): void {
  const button = event.currentTarget as HTMLButtonElement;
  const dayId = button.dataset.dayId;
  if (!dayId) return;

  const isNowRead = toggleDayRead(dayId, readDays);
  button.classList.toggle('day-button--read', isNowRead);
  button.setAttribute('aria-pressed', String(isNowRead));
}

function attachDayButtonHandlers(): void {
  document.querySelectorAll('.day-button:not([disabled])').forEach((button) => {
    button.addEventListener('click', handleDayButtonClick);
  });
}

function updateSortToggleState(): void {
  const button = document.querySelector('.sort-toggle-btn');
  if (!button) return;

  const isLesson = currentViewMode === 'lesson';
  (button as HTMLButtonElement).dataset.currentMode = currentViewMode;

  const icon = button.querySelector('.sort-icon');
  if (icon) {
    icon.classList.toggle('sort-lesson', isLesson);
    icon.classList.toggle('sort-chrono', !isLesson);
  }

  const tooltip = button.querySelector('.sort-tooltip');
  if (tooltip) {
    tooltip.innerHTML = getTooltipText();
  }

  updateSortFabIcon();
}

export function renderTimeline(weeks: Week[], currentWeek: number): void {
  cachedWeeks = weeks;

  const tbody = document.querySelector('.timeline tbody');
  if (!tbody) {
    console.error('Timeline tbody not found');
    return;
  }

  readDays = loadReadDays();
  tbody.innerHTML = weeks.map((week) => renderWeekRow(week, week.week === currentWeek)).join('\n');

  attachDayButtonHandlers();
  updateSortToggleState();
}

export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}

export function getViewMode(): ViewMode {
  return currentViewMode;
}

function reorderReadings(): void {
  if (cachedWeeks.length === 0) return;

  cachedWeeks.forEach((week) => {
    const row = getWeekRow(week.week);
    if (!row) return;

    const readingsCell = row.querySelector('.col-readings');
    if (!readingsCell) return;

    const daily = getDailyReadings(week, currentViewMode);
    readingsCell.innerHTML = renderDailyReadings(daily, week.week);
  });

  attachDayButtonHandlers();
}

export function setViewMode(mode: ViewMode): void {
  if (mode === currentViewMode) return;

  currentViewMode = mode;
  localStorage.setItem('timeline-view-mode', mode);

  reorderReadings();
  updateSortToggleState();
}

export function loadViewMode(): ViewMode {
  const saved = localStorage.getItem('timeline-view-mode');
  if (saved === 'lesson' || saved === 'chronological') {
    currentViewMode = saved;
  }
  return currentViewMode;
}
