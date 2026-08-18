# ChemE Toolkit — Scientific Notebook v2

Scientific Notebook v2 completes the notebook-to-project engineering workflow in ChemE Toolkit.

## Release scope

The Scientific Notebook now supports:

- centralized notebook library
- search, filtering, favorites and sorting
- notebook backup and restore
- single-notebook engineering reports
- multi-notebook project reports
- reusable project report sets
- project descriptions and tags
- project status and progress
- deadlines and overdue tracking
- project priorities
- smart attention scoring
- quick project updates
- next-action planning
- portfolio overview
- Markdown portfolio export
- CSV portfolio export
- Print / PDF portfolio reports
- project staleness tracking
- review check-ins
- configurable 7 / 14 / 30 / 60 day review cadence
- dedicated review metadata
- next-review scheduling
- review-aware workspace merge behavior
- review-aware portfolio reports
- iCalendar review export
- compact portfolio health dashboard
- behavioral regression coverage
- release-contract protection

## Project review model

Project edits and project reviews are tracked independently.

`updatedAt` represents project modification activity.

`lastReviewedAt` represents an explicit project review.

Project activity uses the newest relevant timestamp when calculating review schedules and recent-touch ordering.

Existing project sets remain compatible and default to a 14-day review cadence.

## Workspace integrity

Workspace backup and restore preserves:

- scientific notebooks
- reusable project sets
- project metadata
- review cadence
- review timestamps

Merge behavior preserves the newest project edit and newest review independently.

## Reporting

Portfolio information can be exported as:

- Markdown
- CSV
- Print / PDF
- iCalendar review schedule

Review cadence, review status, last-reviewed timestamps and next-review dates are represented in the reporting workflow.

## Performance architecture

Scientific Notebook Project Sets remain lazy-loaded.

Portfolio report generation remains dynamically loaded.

Review calendar generation remains dynamically loaded.

These boundaries are protected by release verification.

## Compatibility

The existing Project Set storage key remains:

`cheme-toolkit.notebook-project-sets.v1`

Existing stored projects remain backward compatible.

Legacy calculator runtime remains removed.

## Release quality

Scientific Notebook v2 is protected by:

- verifier generations v1 through v30
- behavioral Project Set regression tests
- workspace backup verification
- calculator routing verification
- calculator test-coverage verification
- native-calculator verification
- production readiness checks
- accessibility checks
- smoke checks
- lint
- TypeScript build
- bundle regression budget
- release-order contracts

`verify:verified-calculator-copy` remains the final step of the full release chain.

## Status

Scientific Notebook v2 feature series is complete.

Future Scientific Notebook work should be developed as separately scoped features rather than continuing the numbered v2 implementation phase sequence.
