import { describe, expect, it } from 'vitest';
import { dateToInputType, parseInputDate } from './dateConversions';

describe('parseInputDate', () => {
  it('preserves a date input string as the same calendar day', () => {
    expect(dateToInputType(parseInputDate('2024-01-03'))).toBe('2024-01-03');
  });

  it('creates a local midnight date for date input values', () => {
    const parsed = parseInputDate('2024-07-20');

    expect(parsed.getHours()).toBe(0);
    expect(parsed.getMinutes()).toBe(0);
    expect(parsed.getSeconds()).toBe(0);
    expect(parsed.getMilliseconds()).toBe(0);
  });
});
