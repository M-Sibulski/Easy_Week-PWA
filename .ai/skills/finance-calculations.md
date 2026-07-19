# Skill: Finance Calculations

## Purpose
Implement and protect financial calculations as pure, testable functions with deterministic outputs.

## When to use
- Changing totals, balance logic, date grouping, planned-vs-actual math.
- Adding Safe to Spend, Insights, End-of-week Review scoring.
- Updating category suggestion scoring logic.

## Rules
- Keep calculations pure: same input must produce same output.
- Do not read storage or network inside calculation functions.
- Normalize transaction sign conventions consistently.
- Keep date boundary handling explicit and testable.
- Every finance calculation change requires unit tests.

## Step-by-step workflow
1. Define calculation input and output types.
2. Implement as standalone function module.
3. Cover edge cases: empty data, transfers, week boundaries, ties.
4. Add unit tests for nominal and boundary scenarios.
5. Integrate calculation from service or component orchestration layer.
6. Validate no regression in weekly totals and account totals.

## Checklist
- [ ] No side effects in calculation functions.
- [ ] Transfer handling is explicitly covered.
- [ ] Week boundary behavior is tested.
- [ ] Rounding and precision decisions are explicit.
- [ ] Tests include negative, zero, and mixed datasets.

## Common mistakes
- Embedding math directly in JSX maps and reducers.
- Inconsistent sign handling between create and edit flows.
- Hidden timezone assumptions in date parsing.
- Shipping finance logic changes without unit tests.

## Related documentation
- [Calculations Domain](../../docs/domain/calculations.md)
- [Weekly Plans Domain](../../docs/domain/weekly-plans.md)
- [Testing Strategy](../../docs/coding/testing.md)
- [Date Conversions](../../src/dateConversions.ts)
- [Category Suggestions](../../src/categorySuggestions.ts)
