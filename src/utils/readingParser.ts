/**
 * Reading Parser Utility
 *
 * Parses CFM reading strings (e.g., "Genesis 1–2; Moses 2–3; Abraham 4–5")
 * and expands them into individual chapter readings distributed across 7 days.
 */

import booksData from '../data/books.json';

/** Map of book names to their chapter counts for quick lookup */
const bookChapterCounts: Record<string, number> = {};

// Build the lookup map from JSON-LD structured data
for (const book of booksData.itemListElement) {
  bookChapterCounts[book.name] = book.chapterCount;
}

/** Special week readings that shouldn't be parsed into chapters */
const SPECIAL_READINGS = ['Introduction to the Old Testament', 'Easter', 'Christmas'];

/**
 * Represents a single chapter reference (e.g., "Genesis 1")
 */
interface ChapterRef {
  book: string;
  chapter: number;
}

/**
 * Normalizes various dash characters to a standard hyphen
 */
function normalizeDashes(text: string): string {
  return text.replace(/[–—−]/g, '-');
}

/**
 * Parses a book reference segment like "Genesis 1-5" or "Psalms 1-2; 8; 19-33"
 * Returns an array of individual chapter references
 */
function parseBookSegment(segment: string): ChapterRef[] {
  const chapters: ChapterRef[] = [];
  const normalized = normalizeDashes(segment.trim());

  // Match book name (may include numbers like "1 Samuel")
  const bookRegex = /^(\d?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(.*)/;
  const bookMatch = bookRegex.exec(normalized);
  if (!bookMatch) return chapters;

  const bookName = bookMatch[1].trim();
  const chapterPart = bookMatch[2].trim();

  // If no chapters specified, it might be a whole book reference or special reading
  if (!chapterPart) {
    // Check if this is a known book
    if (bookChapterCounts[bookName]) {
      // Return all chapters of the book
      const count = bookChapterCounts[bookName];
      for (let i = 1; i <= count; i++) {
        chapters.push({ book: bookName, chapter: i });
      }
    }
    return chapters;
  }

  // Parse chapter references (can be comma or semicolon separated within a book)
  // e.g., "1-2; 8; 19-33" for Psalms
  const chapterSegments = chapterPart.split(/[,;]/).map((s) => s.trim());

  for (const seg of chapterSegments) {
    if (!seg) continue;

    // Check for range (e.g., "1-5")
    const rangeRegex = /^(\d+)\s*-\s*(\d+)$/;
    const rangeMatch = rangeRegex.exec(seg);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        chapters.push({ book: bookName, chapter: i });
      }
    } else {
      // Single chapter
      const chapterNum = parseInt(seg, 10);
      if (!isNaN(chapterNum)) {
        chapters.push({ book: bookName, chapter: chapterNum });
      }
    }
  }

  return chapters;
}

/**
 * Parses a full CFM reading string into individual chapter references.
 * Handles semicolon-separated book segments like "Genesis 1–2; Moses 2–3; Abraham 4–5"
 */
export function parseReadingString(reading: string): ChapterRef[] {
  // Check for special readings that shouldn't be parsed
  if (SPECIAL_READINGS.includes(reading)) {
    return [];
  }

  const chapters: ChapterRef[] = [];
  const normalized = normalizeDashes(reading);

  // Split by semicolon to get individual book segments
  // But be careful - semicolons within Psalms references should stay together
  // e.g., "Psalms 1-2; 8; 19-33" is one book with multiple chapter refs
  const segments = splitByBookBoundaries(normalized);

  for (const segment of segments) {
    const parsed = parseBookSegment(segment);
    chapters.push(...parsed);
  }

  return chapters;
}

/**
 * Splits a reading string by book boundaries, keeping chapter refs with their books.
 * For example: "Genesis 1-2; Moses 2-3" becomes ["Genesis 1-2", "Moses 2-3"]
 * But: "Psalms 1-2; 8; 19-33" stays as one segment
 */
function splitByBookBoundaries(reading: string): string[] {
  const segments: string[] = [];
  const parts = reading.split(';').map((p) => p.trim());

  let currentSegment = '';

  for (const part of parts) {
    // Check if this part starts with a book name (letter, possibly preceded by number)
    const startsWithBook = /^\d?\s*[A-Za-z]/.test(part);

    // Check if this is just chapter numbers (continuation of previous book)
    const isChapterOnly = /^\d+(-\d+)?$/.test(part);

    if (startsWithBook && !isChapterOnly) {
      // New book - save current segment and start new one
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = part;
    } else if (currentSegment) {
      // Continuation of current book (e.g., additional psalm numbers)
      currentSegment += '; ' + part;
    } else {
      // Orphan segment - shouldn't happen with valid input
      currentSegment = part;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

/**
 * Formats a chapter reference back to a string (e.g., "Genesis 1")
 */
function formatChapterRef(ref: ChapterRef): string {
  return `${ref.book} ${String(ref.chapter)}`;
}

/**
 * Groups consecutive chapters from the same book into ranges.
 * e.g., [Gen 1, Gen 2, Gen 3] becomes "Genesis 1-3"
 */
function groupConsecutiveChapters(chapters: ChapterRef[]): string[] {
  if (chapters.length === 0) return [];

  const result: string[] = [];
  let rangeStart = chapters[0];
  let rangeEnd = chapters[0];

  for (let i = 1; i < chapters.length; i++) {
    const current = chapters[i];

    if (current.book === rangeEnd.book && current.chapter === rangeEnd.chapter + 1) {
      // Extend the range
      rangeEnd = current;
    } else {
      // Save the current range and start a new one
      if (rangeStart.book === rangeEnd.book && rangeStart.chapter === rangeEnd.chapter) {
        result.push(formatChapterRef(rangeStart));
      } else {
        result.push(`${rangeStart.book} ${String(rangeStart.chapter)}-${String(rangeEnd.chapter)}`);
      }
      rangeStart = current;
      rangeEnd = current;
    }
  }

  // Don't forget the last range
  if (rangeStart.book === rangeEnd.book && rangeStart.chapter === rangeEnd.chapter) {
    result.push(formatChapterRef(rangeStart));
  } else {
    result.push(`${rangeStart.book} ${String(rangeStart.chapter)}-${String(rangeEnd.chapter)}`);
  }

  return result;
}

/**
 * Distributes chapters evenly across 7 days.
 * Returns an array of 7 strings, each representing the reading for that day.
 * Empty strings for days without readings.
 */
export function distributeAcrossDays(chapters: ChapterRef[]): string[] {
  const days: string[] = ['', '', '', '', '', '', ''];

  if (chapters.length === 0) {
    return days;
  }

  // Calculate how many chapters per day
  const chaptersPerDay = Math.ceil(chapters.length / 7);

  let chapterIndex = 0;
  for (let day = 0; day < 7 && chapterIndex < chapters.length; day++) {
    const dayChapters: ChapterRef[] = [];

    // Assign chapters to this day
    for (let i = 0; i < chaptersPerDay && chapterIndex < chapters.length; i++) {
      dayChapters.push(chapters[chapterIndex]);
      chapterIndex++;
    }

    // Group consecutive chapters into ranges for cleaner display
    const grouped = groupConsecutiveChapters(dayChapters);
    days[day] = grouped.join('; ');
  }

  return days;
}

/**
 * Main function: Takes a CFM reading string and returns 7 daily readings.
 * Handles special readings (Easter, Christmas, etc.) by placing them on day 1.
 */
export function parseCfmReadingToDaily(reading: string): string[] {
  // Handle special readings
  if (SPECIAL_READINGS.includes(reading)) {
    return [reading, '', '', '', '', '', ''];
  }

  const chapters = parseReadingString(reading);

  if (chapters.length === 0) {
    // Couldn't parse - return the original as day 1
    return [reading, '', '', '', '', '', ''];
  }

  return distributeAcrossDays(chapters);
}

/**
 * Export book chapter counts for validation
 */
export function getBookChapterCount(bookName: string): number | undefined {
  return bookChapterCounts[bookName];
}

/**
 * Get all book names
 */
export function getAllBookNames(): string[] {
  return Object.keys(bookChapterCounts);
}
