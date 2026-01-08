/**
 * Represents the Come, Follow Me lesson data for a week.
 */
export interface CfmLesson {
  /** Lesson title displayed as link text */
  title: string;
  /** URL to the official lesson on churchofjesuschrist.org */
  link: string;
  /** Scripture reading assignment for the week */
  reading: string;
}

/**
 * Represents a single week in the timeline.
 * Designed for future JSON-LD expansion.
 */
export interface Week {
  /** Week number (1-52) */
  week: number;
  /** ISO date string for the start of the week (Monday) */
  startDate: string;
  /** ISO date string for the end of the week (Sunday) */
  endDate: string;
  /** Human-readable date range label (e.g., "Jan 5–11") */
  dateLabel: string;
  /** Come, Follow Me lesson details */
  cfm: CfmLesson;
  /** Array of 7 daily readings (empty strings for days without readings) */
  chronological: string[];
}

/**
 * Badge types for tracking different Bible resources.
 */
export type ResourceBadge = 'kjv' | 'mac' | 'heb' | 'esv';

/**
 * Labels for each resource badge type.
 */
export const RESOURCE_LABELS: Record<ResourceBadge, string> = {
  kjv: 'KJV-JST',
  mac: 'LSB-Mac',
  heb: 'Heb',
  esv: 'ESV',
};

/**
 * Order of track checkboxes displayed in each row.
 */
export const TRACK_ORDER: ResourceBadge[] = ['kjv', 'mac', 'heb', 'esv'];
