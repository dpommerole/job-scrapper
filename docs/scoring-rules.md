# Job Tracker Scoring Rules

## Purpose

This document defines how freelance opportunities should be scored and prioritized.

The goal is to help identify the best opportunities quickly, not to produce a perfect objective truth.

## Target profile

The ideal opportunity is a freelance mission for a senior frontend developer with strong Vue.js, TypeScript, frontend architecture, testing, and product collaboration responsibilities.

## Score scale

Each opportunity is scored from 0 to 100.

Classification:

|  Score | Class       |
| -----: | ----------- |
| 80-100 | hot         |
|  65-79 | interesting |
|  50-64 | maybe       |
|  35-49 | weak        |
|   0-34 | reject      |

## Weighted dimensions

| Dimension                   | Max points |
| --------------------------- | ---------: |
| Technical fit               |         30 |
| Seniority and ownership fit |         20 |
| Contract and business fit   |         20 |
| Location and remote fit     |         15 |
| Strategic value             |         10 |
| Clarity and credibility     |          5 |
| Total                       |        100 |

## Technical fit — 30 points

High value signals:

* Vue.js
* TypeScript
* JavaScript
* Frontend architecture
* SPA architecture
* Vite
* Testing strategy
* Vitest
* Playwright
* Design system
* Component library
* API integration
* Performance
* Accessibility
* E-commerce
* Complex business UI
* Data-heavy frontend

Suggested scoring:

| Signal                               | Points |
| ------------------------------------ | -----: |
| Vue.js required                      |     +8 |
| TypeScript required                  |     +6 |
| Frontend architecture responsibility |     +6 |
| Testing responsibility               |     +4 |
| Design system or component library   |     +3 |
| Performance/accessibility concern    |     +2 |
| Complex frontend domain              |     +1 |

## Seniority and ownership fit — 20 points

High value signals:

* senior
* lead
* expert
* architect
* référent frontend
* autonomy
* mentoring
* technical decisions
* roadmap contribution
* cross-functional collaboration

Suggested scoring:

| Signal                         | Points |
| ------------------------------ | -----: |
| Senior/lead/expert role        |     +6 |
| Technical ownership            |     +5 |
| Autonomy expected              |     +3 |
| Mentoring or team support      |     +2 |
| Product/business collaboration |     +2 |
| Architecture decisions         |     +2 |

## Contract and business fit — 20 points

High value signals:

* freelance contract
* clear duration
* clear rate or acceptable rate range
* direct client or credible intermediary
* start date available
* mission long enough to be valuable

Suggested scoring:

| Signal                                 | Points |
| -------------------------------------- | -----: |
| Freelance explicitly stated            |     +6 |
| TJM/rate visible and acceptable        |     +5 |
| Mission duration clear                 |     +3 |
| Start date clear                       |     +2 |
| Direct client or credible intermediary |     +2 |
| Scope commercially attractive          |     +2 |

Penalties:

| Negative signal            | Penalty |
| -------------------------- | ------: |
| CDI-only                   |     -10 |
| No contract type           |      -4 |
| No rate information        |      -3 |
| Very low rate              |      -8 |
| Unclear intermediary chain |      -2 |

## Location and remote fit — 15 points

High value signals:

* remote
* France remote
* hybrid Lille
* hybrid Paris
* occasional onsite only

Suggested scoring:

| Signal                | Points |
| --------------------- | -----: |
| Full remote           |     +7 |
| France remote         |     +6 |
| Hybrid Lille          |     +6 |
| Hybrid Paris          |     +5 |
| Occasional travel     |     +3 |
| Clear location policy |     +2 |

Penalties:

| Negative signal                  | Penalty |
| -------------------------------- | ------: |
| Full onsite far from Lille/Paris |      -8 |
| Relocation required              |     -10 |
| Location unclear                 |      -2 |

## Strategic value — 10 points

High value signals:

* frontend architecture
* migration
* testing strategy
* design system
* e-commerce scale
* platform engineering
* accessibility
* performance
* technical leadership
* product-facing responsibilities

Suggested scoring:

| Signal                                 | Points |
| -------------------------------------- | -----: |
| Improves senior positioning            |     +3 |
| Architecture or platform impact        |     +3 |
| Testing or quality improvement         |     +2 |
| Product/client-facing exposure         |     +1 |
| Domain is valuable for future missions |     +1 |

## Clarity and credibility — 5 points

High value signals:

* clear title
* clear stack
* clear company or client context
* clear responsibilities
* credible source
* recent posting

Suggested scoring:

| Signal                       | Points |
| ---------------------------- | -----: |
| Clear technical stack        |     +1 |
| Clear responsibilities       |     +1 |
| Clear client/company context |     +1 |
| Clear contract details       |     +1 |
| Credible/recent source       |     +1 |

## Final recommendation

Use the final score to recommend one of:

* contact immediately
* save for later
* ask for missing details
* monitor
* reject
* archive

## Important rules

* Missing information should reduce confidence.
* Do not invent missing details.
* A vague offer should not score above 70 unless it has strong known signals.
* A non-freelance offer should not score above 60 unless the user explicitly wants CDI options.
* A full-onsite mission far from Lille or Paris should not score above 65 unless the mission is exceptional.
