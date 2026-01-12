/**
 * Script to generate cfmDaily arrays for all weeks in weeks.json
 *
 * Run with: npx tsx scripts/generateCfmDaily.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the books data directly since we can't use the module import in a script context
const booksDataPath = path.join(__dirname, '../src/data/books.json');
const weeksDataPath = path.join(__dirname, '../src/data/weeks.json');

interface BookEntry {
  '@type': string;
  '@id': string;
  name: string;
  chapterCount: number;
}

interface BooksData {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  itemListElement: BookEntry[];
}

interface CfmLesson {
  title: string;
  link: string;
  reading: string;
  excerpt?: string;
  image?: string;
}

interface Week {
  week: number;
  startDate: string;
  endDate: string;
  dateLabel: string;
  cfm: CfmLesson;
  chronological: string[];
  cfmDaily?: string[];
}

// Load books data
const booksData: BooksData = JSON.parse(fs.readFileSync(booksDataPath, 'utf-8'));

// Build book chapter count lookup
const bookChapterCounts: Record<string, number> = {};
for (const book of booksData.itemListElement) {
  bookChapterCounts[book.name] = book.chapterCount;
}

// Special readings that shouldn't be parsed
const SPECIAL_READINGS = ['Introduction to the Old Testament', 'Easter', 'Christmas'];

interface ChapterRef {
  book: string;
  chapter: number;
}

function normalizeDashes(text: string): string {
  return text.replace(/[–—−]/g, '-');
}

function parseBookSegment(segment: string): ChapterRef[] {
  const chapters: ChapterRef[] = [];
  const normalized = normalizeDashes(segment.trim());

  // Match book name (may include numbers like "1 Samuel")
  const bookMatch = normalized.match(/^(\d?\s*[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s*(.*)/);
  if (!bookMatch) return chapters;

  const bookName = bookMatch[1].trim();
  const chapterPart = bookMatch[2].trim();

  if (!chapterPart) {
    if (bookChapterCounts[bookName]) {
      const count = bookChapterCounts[bookName];
      for (let i = 1; i <= count; i++) {
        chapters.push({ book: bookName, chapter: i });
      }
    }
    return chapters;
  }

  const chapterSegments = chapterPart.split(/[,;]/).map((s) => s.trim());

  for (const seg of chapterSegments) {
    if (!seg) continue;

    const rangeMatch = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        chapters.push({ book: bookName, chapter: i });
      }
    } else {
      const chapterNum = parseInt(seg, 10);
      if (!isNaN(chapterNum)) {
        chapters.push({ book: bookName, chapter: chapterNum });
      }
    }
  }

  return chapters;
}

function splitByBookBoundaries(reading: string): string[] {
  const segments: string[] = [];
  const parts = reading.split(';').map((p) => p.trim());

  let currentSegment = '';

  for (const part of parts) {
    const startsWithBook = /^\d?\s*[A-Za-z]/.test(part);
    const isChapterOnly = /^\d+(-\d+)?$/.test(part);

    if (startsWithBook && !isChapterOnly) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = part;
    } else if (currentSegment) {
      currentSegment += '; ' + part;
    } else {
      currentSegment = part;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
}

function parseReadingString(reading: string): ChapterRef[] {
  if (SPECIAL_READINGS.includes(reading)) {
    return [];
  }

  const chapters: ChapterRef[] = [];
  const normalized = normalizeDashes(reading);
  const segments = splitByBookBoundaries(normalized);

  for (const segment of segments) {
    const parsed = parseBookSegment(segment);
    chapters.push(...parsed);
  }

  return chapters;
}

function formatChapterRef(ref: ChapterRef): string {
  return `${ref.book} ${ref.chapter}`;
}

function groupConsecutiveChapters(chapters: ChapterRef[]): string[] {
  if (chapters.length === 0) return [];

  const result: string[] = [];
  let rangeStart = chapters[0];
  let rangeEnd = chapters[0];

  for (let i = 1; i < chapters.length; i++) {
    const current = chapters[i];

    if (current.book === rangeEnd.book && current.chapter === rangeEnd.chapter + 1) {
      rangeEnd = current;
    } else {
      if (rangeStart.book === rangeEnd.book && rangeStart.chapter === rangeEnd.chapter) {
        result.push(formatChapterRef(rangeStart));
      } else {
        result.push(`${rangeStart.book} ${rangeStart.chapter}-${rangeEnd.chapter}`);
      }
      rangeStart = current;
      rangeEnd = current;
    }
  }

  if (rangeStart.book === rangeEnd.book && rangeStart.chapter === rangeEnd.chapter) {
    result.push(formatChapterRef(rangeStart));
  } else {
    result.push(`${rangeStart.book} ${rangeStart.chapter}-${rangeEnd.chapter}`);
  }

  return result;
}

function distributeAcrossDays(chapters: ChapterRef[]): string[] {
  const days: string[] = ['', '', '', '', '', '', ''];

  if (chapters.length === 0) {
    return days;
  }

  const chaptersPerDay = Math.ceil(chapters.length / 7);

  let chapterIndex = 0;
  for (let day = 0; day < 7 && chapterIndex < chapters.length; day++) {
    const dayChapters: ChapterRef[] = [];

    for (let i = 0; i < chaptersPerDay && chapterIndex < chapters.length; i++) {
      dayChapters.push(chapters[chapterIndex]);
      chapterIndex++;
    }

    const grouped = groupConsecutiveChapters(dayChapters);
    days[day] = grouped.join('; ');
  }

  return days;
}

function parseCfmReadingToDaily(reading: string): string[] {
  if (SPECIAL_READINGS.includes(reading)) {
    return [reading, '', '', '', '', '', ''];
  }

  const chapters = parseReadingString(reading);

  if (chapters.length === 0) {
    return [reading, '', '', '', '', '', ''];
  }

  return distributeAcrossDays(chapters);
}

// Main script
function main() {
  console.log('Loading weeks data...');
  const weeks: Week[] = JSON.parse(fs.readFileSync(weeksDataPath, 'utf-8'));

  console.log(`Processing ${weeks.length} weeks...`);

  for (const week of weeks) {
    const reading = week.cfm.reading;
    const cfmDaily = parseCfmReadingToDaily(reading);
    week.cfmDaily = cfmDaily;

    console.log(`Week ${week.week}: "${reading}"`);
    console.log(`  Daily: ${JSON.stringify(cfmDaily)}`);
  }

  console.log('\nWriting updated weeks.json...');
  fs.writeFileSync(weeksDataPath, JSON.stringify(weeks, null, 2) + '\n');

  console.log('Done!');
}

main();
