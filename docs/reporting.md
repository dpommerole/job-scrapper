# Job Tracker Reporting

## Purpose

The reporting layer turns collected opportunities into weekly decisions.

The goal is not to produce a long report. The goal is to help decide:

* which opportunities to contact
* which recruiters to follow up with
* which sources are worth keeping
* which sources should be removed
* which skills or technologies appear frequently
* how the search strategy should change

## Weekly report cadence

Recommended cadence:

* one short report every week
* one source review every month
* one scoring rules review every month

## Weekly report sections

Each weekly report should include:

1. Executive summary
2. Weekly numbers
3. Best opportunities
4. Source performance
5. Technology and mission signals
6. Contract, rate, and remote signals
7. Outreach and follow-ups
8. Risks and weak signals
9. Recommended actions
10. Next week focus

## Key metrics

Track these metrics weekly:

| Metric                    | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| collected_opportunities   | Total opportunities collected during the period      |
| relevant_opportunities    | Opportunities with at least a `maybe` classification |
| hot_opportunities         | Opportunities scored 80 or above                     |
| interesting_opportunities | Opportunities scored between 65 and 79               |
| contacted_leads           | Leads contacted during the period                    |
| replies                   | Replies received during the period                   |
| interviews                | Interviews scheduled or completed                    |
| followups_due             | Follow-ups that should be sent                       |
| average_score             | Average score of collected opportunities             |
| best_source               | Source with the best useful signal                   |

## Source quality

Each source should be reviewed using:

| Criterion        | Meaning                                                  |
| ---------------- | -------------------------------------------------------- |
| Volume           | Does the source produce enough opportunities?            |
| Relevance        | Are the opportunities aligned with the target profile?   |
| Freshness        | Are the opportunities recent?                            |
| Actionability    | Can the user contact someone or apply easily?            |
| Data quality     | Are title, stack, location, contract and rate available? |
| Compliance       | Can the source be monitored safely?                      |
| Maintenance cost | Is the collector stable and easy to maintain?            |

## Source recommendation

A source can receive one of these recommendations:

| Recommendation | Meaning                                                    |
| -------------- | ---------------------------------------------------------- |
| keep           | Useful source with acceptable quality                      |
| improve        | Useful but collector, filters, or parsing need improvement |
| downgrade      | Low signal, monitor less frequently                        |
| remove         | Too noisy, risky, stale, or useless                        |
| manual-only    | Keep as a manual source, but do not automate               |

## Opportunity action rules

Default actions:

| Condition                                           | Action                                      |
| --------------------------------------------------- | ------------------------------------------- |
| hot opportunity with clear contact path             | contact immediately                         |
| hot opportunity with missing TJM                    | ask for TJM                                 |
| hot opportunity with missing remote policy          | ask for remote policy                       |
| interesting opportunity                             | save or contact depending on available time |
| maybe opportunity                                   | monitor or ask one clarifying question      |
| weak opportunity                                    | archive unless strategically useful         |
| reject opportunity                                  | archive                                     |
| no response after 3-5 business days                 | follow up                                   |
| no feedback after interview after 3-5 business days | follow up                                   |

## Report file naming

Suggested file naming:

```txt
reports/YYYY-MM-DD-weekly-market-report.md
```

Example:

```txt
reports/2026-06-08-weekly-market-report.md
```

## Report principles

* Short is better than exhaustive.
* Prioritize decisions and next actions.
* Show only the most useful tables.
* Explain uncertainty.
* Do not over-interpret small samples.
* Keep track of missing data.
* Compare with previous weeks only when data is available.
