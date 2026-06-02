# AGENTS.md

## Project

This repository is a personal job tracker for finding, collecting, scoring, and following freelance tech missions.

The main target profile is:

* Senior / expert frontend developer
* Vue.js / TypeScript / JavaScript
* Open to React, Svelte, frontend architecture, testing, and design systems
* Freelance missions preferred
* France, Lille, Paris, remote, hybrid
* End-client-facing missions preferred when possible

## Product goals

The application should help the user:

1. Discover relevant freelance mission sources.
2. Collect job listings and recruiter leads from authorized sources.
3. Normalize all opportunities into a common data model.
4. Score each opportunity against the user's profile.
5. Track outreach, follow-ups, interviews, and status.
6. Generate weekly reports about market activity.

## Compliance and safety rules

* Do not implement scraping that violates a website's terms of service.
* Do not automate logged-in LinkedIn browsing.
* Do not bypass anti-bot protections.
* Prefer official APIs, RSS feeds, public pages, email alerts, CSV exports, and manual imports.
* Respect robots.txt and rate limits when designing collectors.
* Avoid collecting unnecessary personal data.
* Store only useful professional information.
* Make data deletion and source attribution easy.

## Engineering principles

* Prefer simple, maintainable code.
* Prefer TypeScript.
* Prefer small modules with clear responsibilities.
* Separate collection, normalization, scoring, and reporting logic.
* Do not couple source-specific scraping code to the domain model.
* Make collectors replaceable.
* Make scoring rules explicit and testable.
* Keep business logic outside UI components.
* Use tests for parsers, normalizers, scoring rules, and data import/export.

## Suggested architecture

Use this separation of concerns:

* `sources`: source definitions and collection strategies
* `collectors`: source-specific data collection
* `normalizers`: convert raw data into canonical job opportunities
* `scoring`: match opportunities against the target profile
* `storage`: persistence layer
* `reporting`: summaries, dashboards, and exports
* `outreach`: message drafting and follow-up tracking

## Completion criteria

Before considering a coding task complete:

* Run typecheck.
* Run tests.
* Run lint if configured.
* Explain what was changed.
* Mention limitations and assumptions.
* Mention any source-specific compliance concern.

## Restrictions

* Do not add a new production dependency without explaining why.
* Do not store API keys or secrets in the repository.
* Do not modify environment files containing secrets.
* Do not implement stealth scraping, CAPTCHA bypassing, proxy rotation, or account automation.
