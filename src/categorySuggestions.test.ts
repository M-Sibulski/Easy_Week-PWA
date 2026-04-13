import { describe, expect, it, vi } from 'vitest';
import type { CategorySuggestion } from '../types';
import {
  buildCategorySuggestionUpdates,
  learnCategorySuggestion,
  recommendCategoryFromName,
  tokenizeTransactionName,
} from './categorySuggestions';

describe('categorySuggestions', () => {
  it('tokenizes long lowercase words once and skips short or numeric tokens', () => {
    expect(tokenizeTransactionName('UBER uber 1234 to NZ CBD')).toEqual(['uber']);
  });

  it('prefers exact previous transaction names when shared tokens are ambiguous', () => {
    const suggestions: CategorySuggestion[] = [
      buildSuggestionRow({ token: '__exact_name__:uber', category: 'Transport', score: 1 }),
      buildSuggestionRow({ token: '__exact_name__:uber eats', category: 'Food', score: 1 }),
      buildSuggestionRow({ token: 'uber', category: 'Transport', score: 0 }),
      buildSuggestionRow({ token: 'uber', category: 'Food', score: 1 }),
      buildSuggestionRow({ token: 'eats', category: 'Food', score: 1 }),
    ];

    expect(recommendCategoryFromName('Uber', suggestions)).toBe('Transport');
    expect(recommendCategoryFromName('Uber Eats', suggestions)).toBe('Food');
  });

  it('recommends the strongest category when it clears the confidence threshold', () => {
    const suggestions: CategorySuggestion[] = [
      buildSuggestionRow({ token: 'uber', category: 'Transport', score: 2 }),
      buildSuggestionRow({ token: 'eats', category: 'Food', score: 1 }),
      buildSuggestionRow({ token: 'uber', category: 'Food', score: 0 }),
    ];

    expect(recommendCategoryFromName('Uber Ride', suggestions)).toBe('Transport');
  });

  it('leaves the category blank when support is too weak', () => {
    const suggestions: CategorySuggestion[] = [
      buildSuggestionRow({ token: 'uber', category: 'Transport', score: 1 }),
      buildSuggestionRow({ token: 'uber', category: 'Food', score: 0 }),
    ];

    expect(recommendCategoryFromName('Uber Ride', suggestions)).toBeUndefined();
  });

  it('increments matching rows, decrements competing rows, and creates missing rows', () => {
    const existing: CategorySuggestion[] = [
      buildSuggestionRow({ id: 1, syncId: 'cat-1', token: 'uber', category: 'Transport', score: 2 }),
      buildSuggestionRow({ id: 2, syncId: 'cat-2', token: 'uber', category: 'Food', score: 1 }),
      buildSuggestionRow({ id: 3, syncId: 'cat-3', token: 'eats', category: 'Food', score: 3 }),
      buildSuggestionRow({ id: 4, syncId: 'cat-4', token: 'eats', category: 'Transport', score: 0 }),
    ];

    expect(buildCategorySuggestionUpdates('Uber Eats', 'Transport', existing)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: '__exact_name__:uber eats', category: 'Transport', score: 1 }),
        expect.objectContaining({ id: 1, token: 'uber', category: 'Transport', score: 3 }),
        expect.objectContaining({ id: 2, token: 'uber', category: 'Food', score: 0 }),
        expect.objectContaining({ id: 4, token: 'eats', category: 'Transport', score: 1 }),
        expect.objectContaining({ id: 3, token: 'eats', category: 'Food', score: 2 }),
      ]),
    );
  });

  it('learns an exact-name key alongside the word keys', () => {
    expect(buildCategorySuggestionUpdates('Uber Eats', 'Food', [])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: '__exact_name__:uber eats', category: 'Food', score: 1 }),
        expect.objectContaining({ token: 'uber', category: 'Food', score: 1 }),
        expect.objectContaining({ token: 'eats', category: 'Food', score: 1 }),
      ]),
    );
  });

  it('hard-deletes previous exact-name rows when the same exact name is relearned with a different category', async () => {
    const repository = {
      getCategorySuggestionsByTokens: vi.fn().mockResolvedValue([
        buildSuggestionRow({
          id: 1,
          syncId: 'exact-transport',
          token: '__exact_name__:uber',
          category: 'Transport',
          score: 1,
        }),
        buildSuggestionRow({
          id: 2,
          syncId: 'token-transport',
          token: 'uber',
          category: 'Transport',
          score: 2,
        }),
      ]),
      addCategorySuggestion: vi.fn().mockResolvedValue(1),
      putCategorySuggestion: vi.fn().mockResolvedValue(1),
      deleteCategorySuggestionsBySyncIds: vi.fn().mockResolvedValue(undefined),
    };

    await learnCategorySuggestion('Uber', 'Food', repository);

    expect(repository.deleteCategorySuggestionsBySyncIds).toHaveBeenCalledWith(['exact-transport']);
    expect(repository.addCategorySuggestion).toHaveBeenCalledWith(expect.objectContaining({
      token: '__exact_name__:uber',
      category: 'Food',
      score: 1,
    }));
  });
});

function buildSuggestionRow({
  id = 10,
  syncId = 'cat-default',
  token,
  category,
  score,
}: {
  id?: number;
  syncId?: string;
  token: string;
  category: string;
  score: number;
}): CategorySuggestion {
  return {
    id,
    syncId,
    token,
    category,
    score,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
}
