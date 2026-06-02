# UI MVP

## Purpose

The UI MVP makes the job tracker usable daily.

The goal is not to create a full CRM or analytics dashboard. The goal is to help the user quickly decide which freelance opportunities deserve attention.

## Phase 3 scope

This phase includes:

1. Opportunities list
2. Opportunity detail
3. Basic filters and sorting
4. Status update
5. Notes update
6. Missing information display
7. Score explanation display
8. Outreach and follow-up basics
9. Reports view

## Non-goals

This phase does not include:

- advanced dashboard analytics
- automated web scraping
- LinkedIn automation
- multi-user permissions
- public deployment
- complex CRM pipelines
- calendar integration
- email sending automation
- advanced charts

## MVP screens

### 1. Dashboard

Purpose:

- show immediate priorities
- show hot opportunities
- show follow-ups due
- show latest imports
- show latest report

Useful cards:

- hot opportunities
- interesting opportunities
- follow-ups due
- newly imported opportunities
- best source
- latest report

### 2. Opportunities list

Purpose:

- review and triage opportunities

Display:

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
- next action

Filters:

- status
- class
- source
- remote policy
- contract type
- minimum score
- text search

Sorting:

- score descending
- collected date descending
- updated date descending
- follow-up date ascending

### 3. Opportunity detail

Purpose:

- understand and act on one opportunity

Display:

- full description
- source and source URL
- company
- recruiter
- location
- remote policy
- contract type
- duration
- start date
- rate range
- skills
- score
- classification
- positive signals
- negative signals
- missing information
- notes
- outreach history

Actions:

- update status
- edit notes
- archive
- mark contacted
- create outreach draft
- copy outreach message

### 4. Add / edit opportunity

Purpose:

- manually add or correct opportunities

Fields:

- source
- source URL
- title
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
- description
- notes

### 5. Sources

Purpose:

- understand where opportunities come from

Display:

- source name
- type
- collection method
- priority
- compliance risk
- number of opportunities
- number of relevant opportunities
- recommendation if available

### 6. Outreach / follow-ups

Purpose:

- track commercial actions

Display:

- recruiter
- opportunity
- status
- last contact
- follow-up date
- suggested action

Actions:

- create draft
- mark sent
- mark replied
- set follow-up date
- close

### 7. Reports

Purpose:

- view generated weekly reports

Display:

- report list
- report date
- report content
- key metrics if available

## UX principles

- Prioritize action.
- Make missing information visible.
- Keep scoring explainable.
- Make archiving easy.
- Make follow-ups obvious.
- Avoid excessive visual complexity.
- Prefer readable tables and detail pages.

## Technical principles

- UI should not duplicate domain rules.
- UI should consume view models or application services.
- Components should stay small.
- Formatting should be centralized.
- Filters and sorting should be testable.
- Status transitions should be explicit.

## Phase 3 done when

The user can:

1. Open the app.
2. See imported opportunities.
3. Filter and sort opportunities.
4. Open an opportunity detail.
5. Understand its score.
6. Update its status.
7. Add or edit notes.
8. See missing information.
9. Track follow-ups.
10. View generated reports.
