import { describe, expect, it } from 'vitest';
import {
  dateToInputType,
  dateToTitle,
  getWeek,
  getNextWeekRange,
  getPrevWeekRange
} from './dateConversions';

// Use a consistent test date
const referenceDate = new Date('2025-07-21T00:00:00Z'); // Monday

describe('dateToInputType', () => {
  it('formats date to yyyy-mm-dd', () => {
    expect(dateToInputType(referenceDate)).toBe('2025-07-21');
  });

  it('adds leading zeros for single digit months and days', () => {
    const date = new Date('2025-01-05T00:00:00Z');
    expect(dateToInputType(date)).toBe('2025-01-05');
  });
});

describe('dateToTitle', () => {
  it('returns correct weekday and day number', () => {
    expect(dateToTitle(referenceDate)).toBe('Monday, 21');
  });

  it('returns correct title for Sunday', () => {
    const sunday = new Date('2025-07-20T00:00:00Z');
    expect(dateToTitle(sunday)).toBe('Sunday, 20');
  });
});

describe('getWeek', () => {
  it('returns correct week for Monday start', () => {
    const { weekStart, weekEnd } = getWeek(referenceDate, 1);
    expect(dateToInputType(weekStart)).toBe('2025-07-21'); // Monday
    expect(dateToInputType(weekEnd)).toBe('2025-07-27');   // Sunday
  });

  it('returns correct week for Sunday start', () => {
    const { weekStart, weekEnd } = getWeek(referenceDate, 0);
    expect(dateToInputType(weekStart)).toBe('2025-07-20'); // Sunday
    expect(dateToInputType(weekEnd)).toBe('2025-07-26');   // Saturday
  });
});

describe('getNextWeekRange', () => {
  it('returns week exactly 7 days after given week', () => {
    const baseWeek = getWeek(referenceDate, 1);
    const nextWeek = getNextWeekRange(baseWeek);
    expect(dateToInputType(nextWeek.weekStart)).toBe('2025-07-28');
    expect(dateToInputType(nextWeek.weekEnd)).toBe('2025-08-03');
  });
});

describe('getPrevWeekRange', () => {
  it('returns week exactly 7 days before given week', () => {
    const baseWeek = getWeek(referenceDate, 1);
    const prevWeek = getPrevWeekRange(baseWeek);
    expect(dateToInputType(prevWeek.weekStart)).toBe('2025-07-14');
    expect(dateToInputType(prevWeek.weekEnd)).toBe('2025-07-20');
  });
});
