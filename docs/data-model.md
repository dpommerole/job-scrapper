# Job Tracker Data Model

## Opportunity

An opportunity represents a freelance mission, job listing, recruiter lead, or manually imported lead.

```ts
export type OpportunityStatus =
  | 'new'
  | 'interesting'
  | 'contacted'
  | 'replied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'archived'

export type OpportunityClass =
  | 'hot'
  | 'interesting'
  | 'maybe'
  | 'weak'
  | 'reject'

export type RemotePolicy =
  | 'remote'
  | 'hybrid'
  | 'onsite'
  | 'unknown'

export type ContractType =
  | 'freelance'
  | 'cdi'
  | 'cdd'
  | 'internship'
  | 'unknown'

export type Opportunity = {
  id: string
  source: string
  sourceUrl?: string

  title: string
  company?: string

  recruiterName?: string
  recruiterCompany?: string
  recruiterContactUrl?: string
  recruiterEmail?: string

  location?: string
  remotePolicy: RemotePolicy
  contractType: ContractType

  seniority?: string
  duration?: string
  startDate?: string

  rateMin?: number
  rateMax?: number
  currency?: 'EUR'

  requiredSkills: string[]
  niceToHaveSkills: string[]

  description: string

  publishedAt?: string
  collectedAt: string
  updatedAt?: string

  status: OpportunityStatus
  score?: number
  opportunityClass?: OpportunityClass

  positiveSignals?: string[]
  negativeSignals?: string[]
  missingInformation?: string[]

  notes?: string
}
```

## Source

A source represents a place where opportunities can be found.

```ts
export type SourceType =
  | 'jobboard'
  | 'freelance-platform'
  | 'recruiter-website'
  | 'company-careers'
  | 'newsletter'
  | 'email-alert'
  | 'rss'
  | 'manual-import'
  | 'csv'
  | 'social-public-post'
  | 'community'

export type CollectionMethod =
  | 'api'
  | 'rss'
  | 'email'
  | 'csv'
  | 'manual'
  | 'public-page'
  | 'saved-html'
  | 'not-recommended'

export type Source = {
  id: string
  name: string
  url?: string
  type: SourceType
  collectionMethod: CollectionMethod
  priority: 'high' | 'medium' | 'low'
  complianceRisk: 'low' | 'medium' | 'high'
  notes?: string
}
```

## Application pipeline

```txt
Source
↓
Collector
↓
RawOpportunity
↓
Normalizer
↓
Opportunity
↓
Deduplication
↓
Scoring
↓
Storage
↓
Dashboard / Report
↓
Outreach / Follow-up
```

## Deduplication keys

Potential duplicate signals:

* same source URL
* same title and same company
* same title and same recruiter
* same normalized description hash
* same recruiter message with similar content
* same company, stack, location, and start date

## Minimal MVP fields

For the MVP, an opportunity only needs:

```ts
type MinimalOpportunity = {
  id: string
  source: string
  title: string
  company?: string
  location?: string
  remotePolicy: RemotePolicy
  contractType: ContractType
  description: string
  requiredSkills: string[]
  collectedAt: string
  status: OpportunityStatus
  score?: number
}
```

## Outreach

An outreach item represents a message sent or planned for a given opportunity or recruiter lead.

```ts
export type OutreachStatus =
  | 'draft'
  | 'sent'
  | 'replied'
  | 'follow_up_needed'
  | 'closed'

export type OutreachChannel =
  | 'email'
  | 'linkedin'
  | 'platform-message'
  | 'phone'
  | 'other'

export type Outreach = {
  id: string
  opportunityId?: string
  recruiterName?: string
  recruiterCompany?: string
  channel: OutreachChannel
  status: OutreachStatus
  subject?: string
  message: string
  sentAt?: string
  followUpAt?: string
  repliedAt?: string
  notes?: string
}
```

## Follow-up rules

Default follow-up suggestions:

| Situation                                | Suggested follow-up delay |
| ---------------------------------------- | ------------------------: |
| First message sent, no reply             |      3 to 5 business days |
| Recruiter replied but no client feedback |      5 to 7 business days |
| Interview done, no feedback              |      3 to 5 business days |
| Weak or low-priority opportunity         |    no automatic follow-up |

## Outreach principles

* Keep messages short.
* Personalize using real opportunity details.
* Ask one clear question at a time.
* Do not over-invest in vague opportunities.
* Track missing information explicitly.
* Prefer quality conversations over mass outreach.

```
```
## WeeklyReport

A weekly report summarizes collected opportunities, source quality, market signals, and recommended actions.

```ts
export type SourceRecommendation =
  | 'keep'
  | 'improve'
  | 'downgrade'
  | 'remove'
  | 'manual-only'

export type RecommendedActionType =
  | 'contact'
  | 'ask_rate'
  | 'ask_remote_policy'
  | 'ask_client_name'
  | 'ask_scope'
  | 'follow_up'
  | 'archive'
  | 'monitor'
  | 'improve_source'
  | 'remove_source'
  | 'review_scoring'

export type WeeklyReportMetric = {
  collectedOpportunities: number
  relevantOpportunities: number
  hotOpportunities: number
  interestingOpportunities: number
  contactedLeads: number
  replies: number
  interviews: number
  followupsDue: number
  averageScore?: number
  bestSource?: string
}

export type SourceWeeklySummary = {
  sourceId: string
  sourceName: string
  collected: number
  relevant: number
  hotOrInteresting: number
  signalQuality: 'high' | 'medium' | 'low'
  recommendation: SourceRecommendation
  notes?: string
}

export type WeeklyRecommendedAction = {
  id: string
  type: RecommendedActionType
  opportunityId?: string
  sourceId?: string
  recruiterName?: string
  priority: 'high' | 'medium' | 'low'
  title: string
  reason: string
  dueDate?: string
}

export type WeeklyReport = {
  id: string
  periodStart: string
  periodEnd: string
  generatedAt: string

  metrics: WeeklyReportMetric
  sourceSummaries: SourceWeeklySummary[]
  topOpportunityIds: string[]
  recommendedActions: WeeklyRecommendedAction[]

  executiveSummary: string
  technologySignals?: string[]
  contractSignals?: string[]
  risks?: string[]
  nextWeekFocus?: string[]
}
```
## SourceHealth

A source health record summarizes the quality, reliability, and compliance status of a source.

```ts
export type SourceSignalQuality =
  | 'high'
  | 'medium'
  | 'low'

export type SourceComplianceRisk =
  | 'low'
  | 'medium'
  | 'high'

export type SourceMaintenanceCost =
  | 'low'
  | 'medium'
  | 'high'

export type SourceReliability =
  | 'stable'
  | 'unstable'
  | 'broken'
  | 'unknown'

export type SourceHealth = {
  sourceId: string
  reviewedAt: string

  collectedCount: number
  relevantCount: number
  hotOrInterestingCount: number
  duplicateCount?: number
  parserErrorCount?: number
  missingFieldRate?: number

  signalQuality: SourceSignalQuality
  complianceRisk: SourceComplianceRisk
  maintenanceCost: SourceMaintenanceCost
  reliability: SourceReliability

  recommendation: SourceRecommendation
  reasons: string[]
  recommendedActions: string[]
  nextReviewAt?: string
}
```
# Import and Storage

## Purpose

The import and storage layer makes the job tracker usable with real data.

The goal is to import opportunities from safe sources, persist them, score them, and make them available for reporting and follow-up tracking.

## Phase 2 scope

This phase includes:

1. SQLite storage
2. Database schema
3. Repository layer
4. CSV import
5. Import run tracking
6. Deduplication before insert
7. Scoring after import
8. Import summary
9. Integration tests

## Non-goals

This phase does not include:

- web scraping
- LinkedIn automation
- browser automation
- Gmail integration
- dashboard UI
- multi-user accounts
- production deployment

## Recommended stack

Use:

- SQLite
- Drizzle
- TypeScript
- Vitest

## Core tables

### opportunities

Stores normalized job opportunities.

Main fields:

- id
- source
- sourceUrl
- title
- company
- recruiterName
- recruiterCompany
- location
- remotePolicy
- contractType
- seniority
- duration
- startDate
- rateMin
- rateMax
- currency
- requiredSkills
- niceToHaveSkills
- description
- publishedAt
- collectedAt
- updatedAt
- status
- score
- opportunityClass
- positiveSignals
- negativeSignals
- missingInformation
- notes

### sources

Stores known opportunity sources.

Main fields:

- id
- name
- url
- type
- collectionMethod
- priority
- complianceRisk
- notes

### outreach

Stores messages and follow-up status.

Main fields:

- id
- opportunityId
- recruiterName
- recruiterCompany
- channel
- status
- subject
- message
- sentAt
- followUpAt
- repliedAt
- notes

### import_runs

Stores import history.

Main fields:

- id
- source
- fileName
- startedAt
- finishedAt
- totalRows
- importedCount
- duplicateCount
- invalidCount
- warnings
- status

## CSV import format

Recommended columns:

```csv
source,sourceUrl,title,company,recruiterName,recruiterCompany,location,remotePolicy,contractType,seniority,duration,startDate,rateMin,rateMax,currency,requiredSkills,niceToHaveSkills,description,publishedAt,notes