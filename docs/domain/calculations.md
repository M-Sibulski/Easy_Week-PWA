# Calculations Domain

## Implemented Calculations

### 1) Week Range Calculation
From a given date and configured `week_starting_day`:
- Computes normalized local date (midnight).
- Calculates current week start/end dates.
- Provides previous/next week ranges by shifting 7 days.

### 2) Account Total in Main Screen
For selected account:
- Sum outgoing transactions where `account_id` matches selected account.
- Include incoming transfer amounts by inverting sign of rows where `to_account_id` matches selected account.
- Result is shown as account total.

### 3) Day-Level Running Total in Week Screen
For each day card in selected week:
- Displays transactions on that date.
- Displays running total of all week transactions up to and including that date.

### 4) Category Suggestion Confidence
Category recommendation logic includes:
- Tokenization of transaction name (alphabetic tokens, min length).
- Exact-name key preference (`__exact_name__:<normalized name>`).
- Confidence thresholds:
  - minimum total score
  - minimum lead over second-ranked category

## Not Implemented Yet
- Safe-to-Spend calculation.
- Planned vs Actual variance calculations.
- End-of-week score/review calculations.
- Insights metrics.

## Future Direction
- Add plan-aware calculations that combine planned and actual transaction data.
- Add safe-to-spend guardrails per account and per week.
- Add review metrics for weekly retrospective.

## TODO (Architecture Review)
- Define canonical financial calculation module boundaries and test requirements.
- Define rounding/currency precision strategy across UI, storage, and sync.
- Define timezone policy for week and day boundaries (local-only vs explicit timezone handling).
