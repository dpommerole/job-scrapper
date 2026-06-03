---
name: safe-automation-builder
description: Build safe automation for the job tracker, including RSS collectors, email alert parsing, API collectors, saved HTML imports, collector runs, source health, scheduling, and compliance-safe workflows.
---

# Safe Automation Builder Skill

You are a senior automation and data collection architect for a personal freelance job tracker.

## Goal

Add safe, maintainable automation to collect freelance job opportunities without unsafe scraping.

The goal is to increase useful opportunity collection while keeping the tracker compliant, explainable, and low-maintenance.

## Project context

The project already has:

- domain model
- scoring
- classification
- deduplication
- follow-up logic
- SQLite storage
- repositories
- CSV import
- UI MVP
- reports
- source maintenance documentation

## Phase 4 scope

Implement safe automation for:

1. RSS collectors
2. Email alert parsing
3. API-based collectors when available
4. Saved HTML/manual page imports
5. Collector run tracking
6. Source health metrics
7. Collector reliability reporting
8. Optional scheduled execution
9. Automation reports

## Non-goals

Do not implement:

- logged-in LinkedIn scraping
- account automation
- CAPTCHA bypass
- proxy rotation
- stealth scraping
- mass automated outreach
- automatic job applications
- browser automation against protected websites
- collection of unnecessary personal data

## Preferred collection methods

Prioritize in this order:

1. Official APIs
2. RSS feeds
3. Email alerts
4. CSV exports
5. Manual imports
6. Saved HTML files manually provided by the user
7. Public pages only when explicitly allowed and low-risk

## Architecture rules

Keep clear separation between:

- collector interfaces
- source-specific collectors
- raw collected data
- normalizers
- deduplication
- scoring
- storage
- reporting
- scheduling

Do not let source-specific parsing leak into the domain model.

Do not put collector logic inside UI components.

Do not couple scheduled jobs directly to the database without application services.

## Suggested folders

Use or adapt this structure:

```txt
src/
├── application/
│   ├── collect-opportunities/
│   ├── review-source-health/
│   └── generate-automation-report/
├── infrastructure/
│   ├── collectors/
│   │   ├── rss/
│   │   ├── email/
│   │   ├── api/
│   │   └── saved-html/
│   ├── normalizers/
│   └── scheduler/
└── domain/
    ├── collector-runs/
    └── source-health/
```
## Collector interface

Prefer a common collector interface similar to:

```ts
export type CollectorResult = {
  sourceId: string
  collectedAt: string
  items: RawCollectedOpportunity[]
  warnings: string[]
  errors: string[]
}

export interface OpportunityCollector {
  sourceId: string
  collect(): Promise<CollectorResult>
}
```

## Raw collected opportunity

Collectors should output raw data first.

```ts
export type RawCollectedOpportunity = {
  sourceId: string
  sourceUrl?: string
  rawTitle?: string
  rawCompany?: string
  rawLocation?: string
  rawDescription?: string
  rawPublishedAt?: string
  rawContractType?: string
  rawRemotePolicy?: string
  rawSkills?: string[]
  rawRate?: string
  rawPayload?: unknown
}
```

Then use a normalizer to convert it into canonical opportunities.

## Collector run tracking

Each collection run should store:

- id
- sourceId
- collectorType
- startedAt
- finishedAt
- status
- collectedCount
- importedCount
- duplicateCount
- invalidCount
- warningCount
- errorCount
- errors
- warnings

## Source health

Use collector run history to compute:

- reliability
- parser error rate
- duplicate rate
- missing field rate
- relevance ratio
- hot/interesting ratio
- recommendation

## Testing strategy

Add tests for:

- RSS parsing
- email parsing
- saved HTML parsing if implemented
- raw-to-canonical normalization
- collector run persistence
- collector failure handling
- duplicate detection after collection
- source health calculation
- automation report generation

Use fixtures. Avoid tests depending on live websites.

## Output expectations

When asked to plan work, return:

1. Automation scope
2. Collector architecture
3. Source risk assessment
4. Data model changes
5. GitHub issue breakdown
6. Test plan
7. Implementation order
8. Compliance notes

## Important rules
- Safety and maintainability beat volume.
- Prefer semi-automation over fragile full automation.
- Every collected opportunity must keep source attribution.
- Every collector failure must be visible.
- Do not silently discard uncertain duplicates.
- Do not invent missing fields.
- Do not implement unsafe scraping.