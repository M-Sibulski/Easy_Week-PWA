# Weekly Plans Domain

## Current State
No dedicated weekly plan domain model is implemented in current source code.

Evidence in code:
- Bottom navigation includes a `planner` tab.
- Planner tab currently renders a "Coming soon" placeholder.
- No `weekly plan` entities/tables/repository methods were found in active source modules.

## What Is Implemented Today (Related)
- Weekly time window calculations (`getWeek`, previous/next week range helpers).
- Week-screen transaction grouping by date within selected week.
- Running totals across days in selected week.
- Week start day setting stored in settings and applied to week range calculation.

## Future Direction
- Introduce weekly plan entities (planned categories/amounts per week).
- Connect plan data to existing weekly range selection and account context.
- Build Plan -> Spend -> Compare -> Learn flow with explicit compare artifacts.

## TODO (Architecture Review)
- Define weekly plan schema (plan header/items, carryover rules, category mapping).
- Define how planned values interact with transfers and savings goals.
- Define week-close behavior and whether historical plans become immutable snapshots.
