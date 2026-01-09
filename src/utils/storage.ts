const STORAGE_KEY = 'ot-timeline-read-days';

/**
 * Loads the set of read day IDs from localStorage.
 */
export function loadReadDays(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      return new Set(parsed);
    }
  } catch {
    console.warn('Failed to load read days from localStorage');
  }
  return new Set();
}

/**
 * Saves the set of read day IDs to localStorage.
 */
export function saveReadDays(readDays: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readDays]));
  } catch {
    console.warn('Failed to save read days to localStorage');
  }
}

/**
 * Toggles the read state of a specific day and persists to localStorage.
 * Returns the new read state (true if now read, false if now unread).
 */
export function toggleDayRead(dayId: string, readDays: Set<string>): boolean {
  if (readDays.has(dayId)) {
    readDays.delete(dayId);
    saveReadDays(readDays);
    return false;
  }
  readDays.add(dayId);
  saveReadDays(readDays);
  return true;
}

/**
 * Creates a day ID from week number and day index.
 * Format: "w{week}-d{day}" (e.g., "w02-d3" for week 2, day 3)
 */
export function createDayId(weekNumber: number, dayIndex: number): string {
  const weekPadded = weekNumber.toString().padStart(2, '0');
  return `w${weekPadded}-d${String(dayIndex + 1)}`;
}
