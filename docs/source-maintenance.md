# Source Maintenance

## Purpose

This document defines how job opportunity sources should be reviewed and maintained.

The goal is to keep the job tracker focused, useful, and compliant.

A job tracker becomes less useful when it collects too much noise. Source maintenance prevents this by regularly reviewing source quality.

## Review cadence

Recommended cadence:

| Review type                  | Frequency                |
| ---------------------------- | ------------------------ |
| Quick source check           | weekly                   |
| Full source review           | monthly                  |
| Compliance review            | when adding a new source |
| Collector reliability review | after parser failures    |
| Scoring relevance review     | monthly                  |

## Source recommendation values

Each source should receive one of these recommendations:

| Recommendation | Meaning                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| keep           | Source is useful and should remain active                                         |
| improve        | Source has potential but needs better filters, parser, deduplication, or metadata |
| downgrade      | Source has limited value and should be checked less often                         |
| remove         | Source is too noisy, stale, risky, or not useful                                  |
| manual-only    | Source is useful but should not be automated                                      |

## Evaluation criteria

### 1. Relevance

Does the source provide opportunities aligned with the target profile?

Target profile:

* senior frontend
* Vue.js
* TypeScript
* JavaScript
* frontend architecture
* testing
* design systems
* freelance
* Lille / Paris / France / remote / hybrid

### 2. Signal-to-noise ratio

| Signal quality | Meaning                                                        |
| -------------- | -------------------------------------------------------------- |
| high           | Many relevant opportunities, little noise                      |
| medium         | Some relevant opportunities, acceptable noise                  |
| low            | Mostly irrelevant, duplicated, stale, or unclear opportunities |

### 3. Freshness

Check whether opportunities are recent and still open.

### 4. Volume

Volume is useful only when relevance is good.

A high-volume source with poor relevance should not be prioritized.

### 5. Data quality

Useful fields:

* title
* company or client
* recruiter
* contract type
* location
* remote policy
* technical stack
* seniority
* rate or TJM
* duration
* publication date
* contact path
* source URL

### 6. Actionability

A source is actionable if the user can:

* apply directly
* contact a recruiter
* identify the platform message path
* save the lead
* ask for missing information
* track status and follow-up

### 7. Compliance risk

| Risk   | Examples                                                                          |
| ------ | --------------------------------------------------------------------------------- |
| low    | official API, RSS, email alert, CSV export, manual import                         |
| medium | public pages with unclear terms or fragile parsing                                |
| high   | logged-in scraping, account automation, anti-bot bypass, personal data collection |

High-risk sources should usually become `manual-only` or be removed.

### 8. Collection reliability

Review:

* fetch success rate
* parser error rate
* duplicate rate
* missing field rate
* broken links
* stale data
* layout changes
* blocked requests

### 9. Maintenance cost

| Cost   | Meaning                                               |
| ------ | ----------------------------------------------------- |
| low    | Stable API, RSS, email, CSV                           |
| medium | Public page parser with occasional changes            |
| high   | Fragile HTML, frequent layout changes, manual cleanup |

## Decision rules

| Condition                                   | Recommendation                 |
| ------------------------------------------- | ------------------------------ |
| High relevance, low risk, good data quality | keep                           |
| Good relevance, parser issues               | improve                        |
| Good relevance, too much noise              | improve                        |
| Medium relevance, low volume                | downgrade                      |
| Low relevance, high noise                   | remove                         |
| Useful but risky to automate                | manual-only                    |
| High maintenance cost and low signal        | remove                         |
| Insufficient data                           | monitor one more review period |

## Monthly review questions

Ask:

1. Which source produced the best opportunities?
2. Which source produced the most noise?
3. Which source required the most cleanup?
4. Which collector broke or became unstable?
5. Which source has compliance concerns?
6. Which source should be checked manually only?
7. Which source should be removed?
8. Which new source should be tested next?

## Source review table

Use this table during reviews:

| Source | Collected | Relevant | Hot/Interesting | Signal | Risk | Cost | Recommendation |
| ------ | --------: | -------: | --------------: | ------ | ---- | ---- | -------------- |

## Maintenance principles

* Fewer good sources are better than many noisy sources.
* Prefer maintainable collection over fragile automation.
* Prefer compliance over volume.
* Do not automate sources that require unsafe behavior.
* Review deduplication rules regularly.
* Keep source attribution.
* Remove stale sources quickly.
