# Job Tracker Roadmap

## Phase 0 — Codex setup

Goal: define the agentic development framework.

Tasks:

* Create `AGENTS.md`
* Create core Codex skills
* Define data model
* Define scoring rules
* Define outreach templates
* Define reporting strategy
* Define source maintenance rules

Status: in progress

## Phase 1 — Local domain MVP

Goal: implement the core business logic without UI complexity.

Features:

* Opportunity model
* Source model
* Outreach model
* Scoring engine
* Classification
* Deduplication basics
* Follow-up calculation
* Weekly report generation

Suggested tasks:

1. Create TypeScript domain types.
2. Implement scoring function.
3. Implement opportunity classification.
4. Implement missing information detection.
5. Implement basic deduplication.
6. Implement follow-up due calculation.
7. Implement weekly metrics generation.
8. Add unit tests.

Definition of done:

* Domain logic is tested.
* No external source integration yet.
* Reports can be generated from sample data.

## Phase 2 — Import and storage MVP

Goal: persist opportunities and import data manually.

Features:

* SQLite database
* Storage layer
* Manual opportunity creation
* CSV import
* JSON import/export
* Source registry
* Import run tracking

Suggested tasks:

1. Choose ORM or query builder.
2. Create schema.
3. Add migrations.
4. Implement repository layer.
5. Implement CSV import.
6. Add fixtures.
7. Add integration tests.

Definition of done:

* Opportunities can be stored.
* Opportunities can be imported from CSV.
* Opportunities can be scored after import.
* Duplicate opportunities can be detected.

## Phase 3 — UI MVP

Goal: make the tracker usable daily.

Screens:

1. Opportunities list
2. Opportunity detail
3. Add opportunity
4. Sources
5. Outreach and follow-ups
6. Reports

Important UI features:

* filters by score, status, source, remote policy
* visible missing information
* status changes
* notes
* copy outreach message
* follow-up due indicators

Definition of done:

* User can manage opportunities from the UI.
* User can see top opportunities quickly.
* User can track outreach status.
* User can generate or view reports.

## Phase 4 — Safe automation

Goal: add maintainable collection methods.

Preferred integrations:

* RSS feeds
* email alerts
* CSV exports
* public APIs
* manually saved HTML imports

Avoid:

* logged-in scraping
* LinkedIn automation
* anti-bot bypass
* mass messaging

Suggested tasks:

1. Add RSS collector interface.
2. Add email alert parser.
3. Add source-specific normalizers.
4. Add collector run tracking.
5. Add parser fixtures.
6. Add collector reliability metrics.

Definition of done:

* Collectors are source-specific and isolated.
* Collection failures are visible.
* Source health can be reviewed.

## Phase 5 — Reporting and optimization

Goal: improve search strategy over time.

Features:

* weekly market reports
* monthly source maintenance reports
* source performance trends
* technology signal summaries
* rate and remote policy summaries
* recruiter follow-up dashboard

Definition of done:

* The tracker recommends concrete actions.
* Poor sources are downgraded or removed.
* The user can see where time should be spent.

## Later ideas

Possible later improvements:

* browser extension for manual imports
* Gmail integration for recruiter emails
* Notion export
* calendar reminders for follow-ups
* AI-assisted opportunity summarization
* AI-assisted outreach variants
* dashboard charts
* source freshness monitoring
* recruiter relationship tracking
* company relationship tracking
