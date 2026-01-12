import type { Week, ViewMode } from '../types/timeline';
import { formatWeekNumber } from '../utils/dates';
import { createDayId, loadReadDays, toggleDayRead } from '../utils/storage';
import { formatChapters, distributeAcrossDays } from '../utils/chapterFormatter';
import chronologicalOrderData from '../data/chronologicalOrder.json';

let readDays = new Set<string>();
let currentViewMode: ViewMode = 'lesson';
let cachedWeeks: Week[] = [];
let cachedCurrentWeek = 0;

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
  const dayId = createDayId(
    weekNumber,
    dayIndex,
    currentViewMode === 'lesson' ? 'lesson' : 'chrono'
  );
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
    ? `<span class="week-bg" style="background-image: url('/src/${week.cfm.image}')" aria-hidden="true"></span>`
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

function renderTableHeader(): string {
  const headerText = currentViewMode === 'lesson' ? 'Daily Reading' : 'Chronological Reading';
  return `
    <tr>
      <th>Week</th>
      <th>Come, Follow Me (OT 2026)</th>
      <th>${headerText}</th>
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

function updateViewToggleStates(): void {
  document.querySelectorAll('.view-toggle-btn').forEach((btn) => {
    const mode = (btn as HTMLElement).dataset.viewMode as ViewMode;
    btn.classList.toggle('view-toggle-btn--active', mode === currentViewMode);
    btn.setAttribute('aria-pressed', String(mode === currentViewMode));
  });
}

export function renderTimeline(weeks: Week[], currentWeek: number): void {
  cachedWeeks = weeks;
  cachedCurrentWeek = currentWeek;

  const thead = document.querySelector('.timeline thead');
  const tbody = document.querySelector('.timeline tbody');
  if (!thead || !tbody) {
    console.error('Timeline thead/tbody not found');
    return;
  }

  readDays = loadReadDays();
  thead.innerHTML = renderTableHeader();
  tbody.innerHTML = weeks.map((week) => renderWeekRow(week, week.week === currentWeek)).join('\n');

  attachDayButtonHandlers();
  updateViewToggleStates();
}

export function getWeekRow(weekNumber: number): HTMLTableRowElement | null {
  return document.querySelector(`tr[data-week="${String(weekNumber)}"]`);
}

export function getViewMode(): ViewMode {
  return currentViewMode;
}

export function setViewMode(mode: ViewMode): void {
  if (mode === currentViewMode) return;

  currentViewMode = mode;
  localStorage.setItem('timeline-view-mode', mode);

  if (cachedWeeks.length > 0) {
    renderTimeline(cachedWeeks, cachedCurrentWeek);
  }
}

export function loadViewMode(): ViewMode {
  const saved = localStorage.getItem('timeline-view-mode');
  if (saved === 'lesson' || saved === 'chronological') {
    currentViewMode = saved;
  }
  return currentViewMode;
}
