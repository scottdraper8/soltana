const STORAGE_KEY = 'ot-timeline-read-days';
const LEGACY_DAY_ID = /^(lesson|chrono)-w(\d{2})-d(\d+)$/;

export function loadReadDays(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedDays = JSON.parse(stored) as string[];
      const normalizedDays = storedDays.map((dayId) => normalizeDayId(dayId));
      const normalizedSet = new Set(normalizedDays);
      const hasChanges =
        normalizedSet.size !== storedDays.length ||
        normalizedDays.some((dayId, index) => dayId !== storedDays[index]);

      if (hasChanges) {
        saveReadDays(normalizedSet);
      }

      return normalizedSet;
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

export function createDayId(weekNumber: number, dayIndex: number): string {
  const weekPadded = weekNumber.toString().padStart(2, '0');
  return `day-w${weekPadded}-d${String(dayIndex + 1)}`;
}

function normalizeDayId(dayId: string): string {
  const legacyMatch = LEGACY_DAY_ID.exec(dayId);
  if (legacyMatch) {
    const weekNumber = Number(legacyMatch[2]);
    const dayNumber = Number(legacyMatch[3]);
    if (!Number.isNaN(weekNumber) && !Number.isNaN(dayNumber)) {
      return createDayId(weekNumber, dayNumber - 1);
    }
  }
  return dayId;
}
