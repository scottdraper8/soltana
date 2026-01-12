const STORAGE_KEY = 'ot-timeline-read-days';

export function loadReadDays(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as string[]);
    }
  } catch {
    console.warn('Failed to load read days from localStorage');
  }
  return new Set();
}

function saveReadDays(readDays: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...readDays]));
  } catch {
    console.warn('Failed to save read days to localStorage');
  }
}

export function toggleDayRead(dayId: string, readDays: Set<string>): boolean {
  const wasRead = readDays.has(dayId);
  if (wasRead) {
    readDays.delete(dayId);
  } else {
    readDays.add(dayId);
  }
  saveReadDays(readDays);
  return !wasRead;
}

export function createDayId(weekNumber: number, dayIndex: number, prefix: string): string {
  const weekPadded = weekNumber.toString().padStart(2, '0');
  return `${prefix}-w${weekPadded}-d${String(dayIndex + 1)}`;
}
