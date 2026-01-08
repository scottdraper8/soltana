import type { Week } from '../types/timeline';
import weeksData from './weeks.json';

/**
 * Typed array of all 52 weeks in the timeline.
 */
export const weeks: Week[] = weeksData as Week[];
