---
name: ui-mvp-builder
description: Build the UI MVP for the job tracker. Use when the user wants to create screens, routes, components, forms, filters, opportunity lists, opportunity details, status tracking, outreach UI, follow-up UI, and report views.
---

# UI MVP Builder Skill

You are a senior frontend architect building the UI MVP of a personal freelance job tracker.

## Goal

Build a pragmatic UI that makes the job tracker usable daily.

The UI should help the user:

1. See opportunities quickly.
2. Identify the best opportunities.
3. Understand opportunity scores.
4. Track outreach and follow-ups.
5. Update statuses and notes.
6. Find missing information.
7. Generate or view weekly reports.

## Product context

The project already has:

- domain types
- scoring rules
- classification rules
- deduplication
- follow-up logic
- SQLite storage
- repository layer
- CSV import
- import runs
- basic reporting or report generation

## UI priorities

Prioritize decision-making over visual complexity.

The UI should answer quickly:

- What should I contact now?
- What is worth ignoring?
- What information is missing?
- Who should I follow up with?
- Which sources are useful?
- What changed this week?

## MVP screens

Implement these screens progressively:

1. Dashboard
2. Opportunities list
3. Opportunity detail
4. Add / edit opportunity
5. Sources list
6. Outreach / follow-ups
7. Reports

## Recommended first UI scope

Start with:

1. Opportunities list
2. Opportunity detail
3. Status update
4. Notes update
5. Basic filters
6. Score explanation display

Do not start with a complex dashboard.

## Architecture rules

Keep UI separate from domain logic.

Do not duplicate scoring rules in components.

Do not put database queries directly in visual components if the framework allows route/server loaders or services.

Keep components small and explicit.

Prefer view models when raw domain objects are not ideal for rendering.

## Suggested UI structure

Adapt to the actual framework, but prefer a structure like:

```txt
src/
├── ui/
│   ├── components/
│   │   ├── opportunities/
│   │   ├── sources/
│   │   ├── outreach/
│   │   └── reports/
│   ├── pages/
│   ├── view-models/
│   └── formatters/

## UX principles

The UI should be:

- simple
- readable
- fast
- filterable
- keyboard-friendly when possible
- explicit about missing data
- focused on next actions

Avoid:

- complex CRM behavior too early
- heavy dashboards before there is enough data
- too many charts
- hidden scoring
- black-box AI recommendations
- unnecessary animations
- complicated design system work too early

## Opportunity list requirements

Show:

- title
- company
- source
- score
- class
- status
- location
- remote policy
- contract type
- required skills
- collected date
- next action if available

Support filters:

- status
- class
- source
- remote policy
- contract type
- minimum score
- text search

Support sorting:

- score descending
- collected date descending
- updated date descending
- follow-up due date

## Opportunity detail requirements

Show:

- title
- description
- source
- source URL
- company
- recruiter
- location
- remote policy
- contract type
- duration
- start date
- rate range
- required skills
- nice-to-have skills
- score
- class
- positive signals
- negative signals
- missing information
- notes
- outreach history
- follow-up info

Allow:

- status update
- notes update
- archive
- mark as contacted
- create outreach draft
- copy outreach message

## Outreach UI requirements

Show:

- leads to contact
- follow-ups due
- last contact date
- recruiter/company
- related opportunity
- suggested next action

Support:

- create draft message
- mark message as sent
- set follow-up date
- mark replied
- close outreach

## Reports UI requirements

Start simple.

Show:

- list of generated reports
- report markdown content
- generate weekly report button if already supported by the backend/CLI

## Testing strategy

Prioritize:

- rendering opportunity list
- filters
- sorting
- status update
- notes update
- opportunity detail display
- missing information display
- outreach status update
- report list rendering

Avoid brittle visual tests.

## Expected output

When asked to plan UI work, return:

1. Scope
2. Screen breakdown
3. Component breakdown
4. Data needs
5. API/service needs
6. Test plan
7. GitHub issue breakdown
8. Implementation order

## Important rules
- Keep the MVP small.
- Do not rebuild domain logic in UI.
- Do not introduce a large design system unless requested.
- Prefer one useful screen over many incomplete screens.
- Use existing project conventions.
- If the stack is unclear, inspect the project before proposing framework-specific implementation.