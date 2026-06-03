# Collector architecture

## Goal

Collectors retrieve raw opportunity data from authorized sources and return a neutral `CollectorResult`.

They do not create domain `Opportunity` objects, do not score opportunities, do not deduplicate records, and do not write to storage. This keeps source-specific collection replaceable and avoids coupling collection logic to the domain model or UI.

## Pipeline

1. A configured source selects a collector implementation.
2. The collector reads an authorized channel such as RSS, official API, email alert, CSV export, manual import, or saved HTML provided by the user.
3. The collector returns a `CollectorResult` with raw items, warnings, and errors.
4. Future pipeline steps normalize raw items into domain opportunities.
5. Domain services handle deduplication, scoring, persistence, reporting, and UI presentation.

## Interfaces

Collectors implement `OpportunityCollector` from `src/collectors`.

Key types:

- `RawCollectedOpportunity`: source-level data captured before domain normalization.
- `CollectorResult`: one collector run result with raw opportunities, warnings, errors, status, source id, collector name, and collection date.
- `CollectorWarning`: non-blocking issue such as missing fields, partial parsing, rate-limit notice, or compliance warning.
- `CollectorError`: blocking or item-level issue such as invalid source, network error, parse error, or compliance block.
- `collectOpportunities`: application service that executes one collector and returns a safe `CollectorResult`.

## Safe source strategy

Allowed first-class strategies:

- RSS feeds
- Official APIs
- Email alerts
- CSV exports
- Manual imports
- Saved HTML files explicitly provided by the user

Disallowed strategies:

- Logged-in LinkedIn browsing automation
- CAPTCHA bypassing
- Proxy rotation or stealth scraping
- Anti-bot bypassing
- Collection that violates terms of service or robots.txt

When a source is uncertain, the collector should return a `compliance-blocked` error instead of collecting.

## Status model

The default status is inferred from raw item and error counts:

- `success`: no collector errors
- `partial`: at least one raw item and at least one error
- `failed`: errors prevented all collection

Warnings do not fail a collector run. They are retained for observability and future source health reporting.

## Extension point

A new source-specific collector should live outside the domain and UI layers, implement `OpportunityCollector`, and return only raw source data. Any source-specific parsing should be isolated in the collector or a collector-local parser, then passed to the normalization layer in a later step.
