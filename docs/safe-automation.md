# Safe Automation

## Purpose

Phase 4 adds safe automation to the job tracker.

The goal is to collect useful freelance opportunities from maintainable and compliant sources.

The goal is not to scrape everything.

## Phase 4 scope

This phase includes:

1. RSS collectors
2. Email alert parsing
3. API collectors when available
4. Saved HTML manual imports
5. Collector run tracking
6. Source health computation
7. Automation reports
8. Optional scheduled execution

## Non-goals

This phase does not include:

- logged-in LinkedIn scraping
- LinkedIn account automation
- CAPTCHA bypass
- proxy rotation
- stealth scraping
- mass messaging
- automatic applications
- browser automation against protected websites

## Preferred collection methods

| Method | Risk | Priority |
|---|---|---|
| Official API | Low | High |
| RSS | Low | High |
| Email alert parsing | Low | High |
| CSV export/import | Low | High |
| Manual import | Low | High |
| Saved HTML manual import | Medium/Low | Medium |
| Public page parsing | Medium | Low |
| Logged-in scraping | High | Avoid |
| Anti-bot bypass | High | Never |

## Automation pipeline

```txt
Source
↓
Collector
↓
RawCollectedOpportunity
↓
Normalizer
↓
Canonical Opportunity
↓
Deduplication
↓
Scoring
↓
Storage
↓
CollectorRun
↓
SourceHealth
↓
Report
```

## Collector types

### RSS collector

Useful for:

- jobboards with RSS feeds
- search alert feeds
- company career feeds
- community feeds

Expected output:

- title
- URL
- summary/description
- published date
- source

### Email alert parser

Useful for:

- jobboard alerts
- recruiter newsletters
- saved search alerts
- manual forwarded emails

Email parsing should work from `.eml`, `.txt`, or copied email content provided by the user. It should not connect to Gmail, Outlook, or recruiter inboxes unless a later phase explicitly adds an authorized API-based integration.

Expected output:

- subject
- sender
- links
- extracted opportunities
- received date

### API collector

Useful when source has an official or documented API.

Expected output depends on source.

### Saved HTML import

Useful when automation is risky but manual capture is acceptable.

Workflow:

```txt
User manually saves page
↓
User imports local HTML file
↓
Parser extracts opportunities
↓
Normalizer converts them
```

This avoids account automation.

## CollectorRun

Each collector execution should create a CollectorRun.

Collector run history is stored in `collector_runs` with serialized warnings and errors so failures remain inspectable without coupling collector logic to imports or UI.

Suggested fields:

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
- warnings
- errors

## SourceHealth

Source health should be computed from source metadata and collector runs.

Suggested indicators:

- reliability
- parser error rate
- duplicate rate
- missing field rate
- relevance ratio
- hot/interesting ratio
- compliance risk
- maintenance cost
- recommendation

## Source recommendations

Use:

- keep
- improve
- downgrade
- remove
- manual-only

## Testing principles

Collectors should be tested with fixtures.

Avoid tests that depend on live websites.

Preferred fixtures:

```txt
tests/fixtures/rss/
tests/fixtures/emails/
tests/fixtures/saved-html/
tests/fixtures/api/
```

## Phase 4 done when

The user can:

1. Run at least one safe collector.
2. Store collector run history.
3. Import collected opportunities.
4. Deduplicate and score collected opportunities.
5. See collector errors and warnings.
6. Compute source health.
7. Generate a source maintenance report.
8. Avoid unsafe scraping.
