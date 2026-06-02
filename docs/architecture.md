# Job Tracker Architecture

## Product goal

The job tracker helps collect, evaluate, prioritize, and follow freelance mission opportunities.

The goal is not to replace human judgment. The goal is to reduce noise, save time, and focus attention on the best opportunities.

## Core workflow

```txt
Source
↓
Collector or manual import
↓
Raw opportunity
↓
Normalizer
↓
Canonical opportunity
↓
Deduplication
↓
Scoring
↓
Status tracking
↓
Outreach
↓
Follow-up
↓
Weekly report
```

## MVP strategy

The first version should avoid complex scraping.

The MVP should focus on:

1. Manual opportunity creation
2. CSV import
3. Source registry
4. Scoring engine
5. Opportunity list
6. Status tracking
7. Outreach tracking
8. Weekly markdown report generation

## Non-goals for MVP

The MVP should not include:

* logged-in scraping
* LinkedIn automation
* CAPTCHA bypass
* proxy rotation
* advanced CRM features
* multi-user permissions
* complex analytics
* AI auto-application
* automated mass messaging

## Recommended architecture

```txt
src/
├── domain/
│   ├── opportunities/
│   ├── sources/
│   ├── outreach/
│   ├── scoring/
│   └── reporting/
├── application/
│   ├── import-opportunities/
│   ├── score-opportunities/
│   ├── generate-weekly-report/
│   └── review-source-health/
├── infrastructure/
│   ├── storage/
│   ├── csv/
│   ├── email/
│   ├── rss/
│   └── collectors/
├── ui/
│   ├── pages/
│   ├── components/
│   └── view-models/
└── tests/
```

## Domain layer

The domain layer contains pure business logic.

Examples:

* opportunity classification
* scoring
* deduplication rules
* source health calculation
* follow-up rules
* report metrics

The domain layer should not know about:

* HTTP
* databases
* UI frameworks
* CSV parsing libraries
* external APIs

## Application layer

The application layer coordinates workflows.

Examples:

* import opportunities from CSV
* score all new opportunities
* generate a weekly report
* archive weak opportunities
* detect follow-ups due
* review source health

## Infrastructure layer

The infrastructure layer handles external systems.

Examples:

* database
* file system
* CSV parser
* RSS reader
* email parser
* public API clients
* source-specific collectors

## UI layer

The UI should help the user make decisions quickly.

Recommended MVP screens:

1. Opportunities list
2. Opportunity detail
3. Add opportunity
4. Sources
5. Outreach / follow-ups
6. Weekly report

## Opportunity lifecycle

```txt
new
↓
interesting
↓
contacted
↓
replied
↓
interview
↓
offer
```

Alternative terminal states:

```txt
rejected
archived
```

## Source lifecycle

```txt
candidate
↓
active
↓
keep / improve / downgrade
↓
manual-only / removed
```

## Scoring

Scoring should be explainable.

Each opportunity should keep:

* final score
* classification
* positive signals
* negative signals
* missing information

The score should not be a black box.

## Reporting

Reports should be generated as Markdown first.

Suggested location:

```txt
reports/YYYY-MM-DD-weekly-market-report.md
```

This keeps the first implementation simple and versionable.

## Automation strategy

### Now

* manual import
* CSV import
* scoring
* weekly report generation

### Next

* RSS collectors
* email alert parsing
* scheduled report generation
* source health checks

### Later

* APIs
* dashboards
* browser-assisted manual imports
* recruiter CRM features
* trend analysis

## Testing strategy

Prioritize unit tests for:

* scoring
* classification
* deduplication
* CSV normalization
* source health
* follow-up calculation
* report metric generation

Use integration tests for:

* CSV import flow
* storage operations
* report generation

Use E2E tests for:

* adding an opportunity
* scoring an opportunity
* changing status
* generating a report

## Architectural principles

* Keep business rules pure and testable.
* Keep collectors isolated.
* Keep source attribution.
* Prefer simple persistence first.
* Prefer manual-safe workflows before automation.
* Make missing information visible.
* Make the tracker useful even with partial data.
