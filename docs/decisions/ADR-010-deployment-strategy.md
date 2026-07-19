# ADR-010 Deployment Strategy

## Status
Needs Review

## Context
The project includes production build scripts, Netlify routing for SPA and PWA behavior, and CI quality checks. Deploy jobs are currently present but commented out in workflow configuration.

## Decision
Use Vite production builds and host-level SPA/PWA-safe routing rules, with CI enforcing dependency, lint, and test checks before deployment.

## Consequences
- Build and quality validation are automated.
- Deployment automation is only partially active.
- Release execution ownership and final automation policy are not yet finalized.

## Current Implementation
- Build and release scripts are in [package.json](../../package.json).
- Netlify build and redirect rules are in [netlify.toml](../../netlify.toml).
- CI jobs for install, lint, and tests are in [.github/workflows/production.yml](../../.github/workflows/production.yml).
- PWA build/runtime configuration is in [vite.config.ts](../../vite.config.ts).

## Future Direction
- Finalize and enable deployment automation when release policy is confirmed, aligned with [docs/product/roadmap.md](../product/roadmap.md).

## Standards Added After Initial Adoption
- Merge readiness depends on CI quality gates: all tests passing, coverage floor maintained, and required sync/finance/UI suites green.
- Release gating must distinguish local-only complete from cloud-sync optional milestones.
- Any deployment automation must preserve the non-blocking local-first product contract rather than assuming cloud readiness.
