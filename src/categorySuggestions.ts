import type { CategorySuggestion } from '../types';
import type { IRepository } from './repository/IRepository';

const MIN_TOKEN_LENGTH = 4;
const MIN_CONFIDENCE_SCORE = 2;
const MIN_SCORE_GAP = 2;
const EXACT_NAME_PREFIX = '__exact_name__:';

const tokenizePattern = /[a-zA-Z]+/g;

const logCategorySuggestionDebug = (message: string, details?: unknown) => {
  if (!import.meta.env.DEV) {
    return;
  }

  if (details === undefined) {
    console.log(`[category-suggestions] ${message}`);
    return;
  }

  console.log(`[category-suggestions] ${message}`, details);
};

export function tokenizeTransactionName(name: string): string[] {
  const matches = name.toLowerCase().match(tokenizePattern) ?? [];
  return [...new Set(matches.filter((token) => token.length >= MIN_TOKEN_LENGTH))];
}

function normalizeTransactionName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function getExactNameKey(name: string): string | undefined {
  const normalizedName = normalizeTransactionName(name);
  return normalizedName ? `${EXACT_NAME_PREFIX}${normalizedName}` : undefined;
}

function getSuggestionLookupKeys(name: string): string[] {
  const exactNameKey = getExactNameKey(name);
  const tokens = tokenizeTransactionName(name);

  return exactNameKey ? [exactNameKey, ...tokens] : tokens;
}

function rankCategoriesForKey(
  suggestions: CategorySuggestion[],
  matchingKey: string,
): Array<[string, number]> {
  const scoreByCategory = new Map<string, number>();

  suggestions.forEach((suggestion) => {
    if (suggestion.token !== matchingKey || suggestion.deletedAt || suggestion.score <= 0) {
      return;
    }

    scoreByCategory.set(
      suggestion.category,
      (scoreByCategory.get(suggestion.category) ?? 0) + suggestion.score,
    );
  });

  return [...scoreByCategory.entries()].sort((left, right) => right[1] - left[1]);
}

export function recommendCategoryFromName(
  name: string,
  suggestions: CategorySuggestion[],
): string | undefined {
  const tokens = tokenizeTransactionName(name);
  const exactNameKey = getExactNameKey(name);

  if (exactNameKey) {
    const exactRankedCategories = rankCategoriesForKey(suggestions, exactNameKey);
    const [exactTopCategory, exactTopScore] = exactRankedCategories[0] ?? [];
    const exactSecondScore = exactRankedCategories[1]?.[1] ?? 0;

    if (exactTopCategory && exactTopScore > exactSecondScore) {
      logCategorySuggestionDebug('Recommendation selected from exact-name history.', {
        name,
        exactNameKey,
        rankedCategories: exactRankedCategories,
        recommendedCategory: exactTopCategory,
      });
      return exactTopCategory;
    }
  }

  if (tokens.length === 0) {
    logCategorySuggestionDebug('Skipping recommendation because no valid tokens were found.', {
      name,
    });
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
    logCategorySuggestionDebug('Recommendation confidence too low, leaving category blank.', {
      name,
      tokens,
      rankedCategories,
      thresholds: {
        minConfidenceScore: MIN_CONFIDENCE_SCORE,
        minScoreGap: MIN_SCORE_GAP,
      },
    });
    return undefined;
  }

  logCategorySuggestionDebug('Recommendation selected.', {
    name,
    tokens,
    rankedCategories,
    recommendedCategory: topCategory,
  });
  return topCategory;
}

export function buildCategorySuggestionUpdates(
  name: string,
  category: string,
  existingSuggestions: CategorySuggestion[],
): CategorySuggestion[] {
  const suggestionKeys = getSuggestionLookupKeys(name);
  const normalizedCategory = category.trim();

  if (suggestionKeys.length === 0 || normalizedCategory === '') {
    return [];
  }

  const updates: CategorySuggestion[] = [];

  suggestionKeys.forEach((token) => {
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
  const lookupKeys = getSuggestionLookupKeys(name);
  if (lookupKeys.length === 0) {
    logCategorySuggestionDebug('Skipping suggestion lookup because no valid tokens were found.', {
      name,
    });
    return undefined;
  }

  const suggestions = await categorySuggestionRepository.getCategorySuggestionsByTokens(lookupKeys);
  logCategorySuggestionDebug('Fetched suggestion candidates for transaction name.', {
    name,
    lookupKeys,
    suggestions: suggestions.map((suggestion) => ({
      token: suggestion.token,
      category: suggestion.category,
      score: suggestion.score,
      deletedAt: suggestion.deletedAt,
    })),
  });
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
  const lookupKeys = getSuggestionLookupKeys(name);
  if (lookupKeys.length === 0 || category.trim() === '') {
    logCategorySuggestionDebug('Skipping learning because the name tokens or category are empty.', {
      name,
      category,
      lookupKeys,
    });
    return;
  }

  const existingSuggestions = await categorySuggestionRepository.getCategorySuggestionsByTokens(lookupKeys);
  const updates = buildCategorySuggestionUpdates(name, category, existingSuggestions);
  logCategorySuggestionDebug('Learning category suggestion updates from submitted transaction.', {
    name,
    category,
    lookupKeys,
    updates: updates.map((suggestion) => ({
      id: suggestion.id,
      token: suggestion.token,
      category: suggestion.category,
      score: suggestion.score,
    })),
  });

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
