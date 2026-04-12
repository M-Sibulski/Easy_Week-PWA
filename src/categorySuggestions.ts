import type { CategorySuggestion } from '../types';
import type { IRepository } from './repository/IRepository';

const MIN_TOKEN_LENGTH = 4;
const MIN_CONFIDENCE_SCORE = 2;
const MIN_SCORE_GAP = 2;

const tokenizePattern = /[a-zA-Z]+/g;

export function tokenizeTransactionName(name: string): string[] {
  const matches = name.toLowerCase().match(tokenizePattern) ?? [];
  return [...new Set(matches.filter((token) => token.length >= MIN_TOKEN_LENGTH))];
}

export function recommendCategoryFromName(
  name: string,
  suggestions: CategorySuggestion[],
): string | undefined {
  const tokens = tokenizeTransactionName(name);
  if (tokens.length === 0) {
    return undefined;
  }

  const scoreByCategory = new Map<string, number>();
  const tokenSet = new Set(tokens);

  suggestions.forEach((suggestion) => {
    if (!tokenSet.has(suggestion.token) || suggestion.deletedAt || suggestion.score <= 0) {
      return;
    }

    scoreByCategory.set(
      suggestion.category,
      (scoreByCategory.get(suggestion.category) ?? 0) + suggestion.score,
    );
  });

  const rankedCategories = [...scoreByCategory.entries()].sort((left, right) => right[1] - left[1]);
  const [topCategory, topScore] = rankedCategories[0] ?? [];
  const secondScore = rankedCategories[1]?.[1] ?? 0;

  if (!topCategory || topScore < MIN_CONFIDENCE_SCORE || topScore < secondScore + MIN_SCORE_GAP) {
    return undefined;
  }

  return topCategory;
}

export function buildCategorySuggestionUpdates(
  name: string,
  category: string,
  existingSuggestions: CategorySuggestion[],
): CategorySuggestion[] {
  const tokens = tokenizeTransactionName(name);
  const normalizedCategory = category.trim();

  if (tokens.length === 0 || normalizedCategory === '') {
    return [];
  }

  const updates: CategorySuggestion[] = [];

  tokens.forEach((token) => {
    const tokenSuggestions = existingSuggestions.filter((suggestion) => suggestion.token === token && !suggestion.deletedAt);
    const matchingSuggestion = tokenSuggestions.find((suggestion) => suggestion.category === normalizedCategory);

    if (matchingSuggestion) {
      updates.push({
        ...matchingSuggestion,
        score: matchingSuggestion.score + 1,
      });
    } else {
      updates.push({
        id: 0,
        syncId: '',
        token,
        category: normalizedCategory,
        score: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    tokenSuggestions
      .filter((suggestion) => suggestion.category !== normalizedCategory)
      .forEach((suggestion) => {
        updates.push({
          ...suggestion,
          score: Math.max(0, suggestion.score - 1),
        });
      });
  });

  return updates;
}

export async function getSuggestedCategory(
  name: string,
  categorySuggestionRepository: Pick<IRepository, 'getCategorySuggestionsByTokens'>,
): Promise<string | undefined> {
  const tokens = tokenizeTransactionName(name);
  if (tokens.length === 0) {
    return undefined;
  }

  const suggestions = await categorySuggestionRepository.getCategorySuggestionsByTokens(tokens);
  return recommendCategoryFromName(name, suggestions);
}

export async function learnCategorySuggestion(
  name: string,
  category: string,
  categorySuggestionRepository: Pick<
    IRepository,
    'getCategorySuggestionsByTokens' | 'addCategorySuggestion' | 'putCategorySuggestion'
  >,
): Promise<void> {
  const tokens = tokenizeTransactionName(name);
  if (tokens.length === 0 || category.trim() === '') {
    return;
  }

  const existingSuggestions = await categorySuggestionRepository.getCategorySuggestionsByTokens(tokens);
  const updates = buildCategorySuggestionUpdates(name, category, existingSuggestions);

  for (const suggestion of updates) {
    if (suggestion.id === 0) {
      await categorySuggestionRepository.addCategorySuggestion({
        token: suggestion.token,
        category: suggestion.category,
        score: suggestion.score,
      });
      continue;
    }

    await categorySuggestionRepository.putCategorySuggestion(suggestion);
  }
}
