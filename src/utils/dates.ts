import type { Week } from '../types/timeline';

/**
 * Parses an ISO date string to a Date object at midnight local time.
 */
function parseDate(dateStr: string): Date {
  const date = new Date(dateStr + 'T00:00:00');
  return date;
}

/**
 * Determines if a given date falls within a week's date range.
 */
export function isDateInWeek(date: Date, week: Week): boolean {
  const start = parseDate(week.startDate);
  const end = new Date(week.endDate + 'T23:59:59');
  return date >= start && date <= end;
}

/**
 * Finds the current week number based on today's date.
 * Returns 1 if before the timeline starts, 52 if after it ends.
 */
export function getCurrentWeekNumber(weeks: Week[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const week of weeks) {
    if (isDateInWeek(today, week)) {
      return week.week;
    }
  }

  const firstStart = parseDate(weeks[0].startDate);
  if (today < firstStart) {
    return 1;
  }

  return 52;
}

/**
 * Formats a week number as a zero-padded string (e.g., "W01").
 */
export function formatWeekNumber(week: number): string {
  return `W${week.toString().padStart(2, '0')}`;
}
