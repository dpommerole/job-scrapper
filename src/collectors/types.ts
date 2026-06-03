export type CollectorKind = "rss" | "api" | "email" | "csv-export" | "manual" | "saved-html";

export type RawCollectedOpportunity = {
  id?: string;
  sourceId: string;
  sourceName: string;
  sourceUrl?: string;
  title?: string;
  company?: string;
  recruiterName?: string;
  recruiterCompany?: string;
  recruiterContactUrl?: string;
  location?: string;
  remotePolicy?: string;
  contractType?: string;
  seniority?: string;
  duration?: string;
  startDate?: string;
  rateMin?: string;
  rateMax?: string;
  currency?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  description?: string;
  publishedAt?: string;
  collectedAt: string;
  url?: string;
  raw?: Record<string, unknown>;
};

export type CollectorResultStatus = "success" | "partial" | "failed";

export type CollectorWarningCode =
  | "missing-field"
  | "partial-result"
  | "parse-warning"
  | "rate-limit"
  | "unsupported-source"
  | "compliance-warning";

export type CollectorErrorCode =
  | "invalid-source"
  | "network-error"
  | "parse-error"
  | "compliance-blocked"
  | "unknown-error";

export type CollectorWarning = {
  code: CollectorWarningCode;
  message: string;
  itemId?: string;
  field?: string;
};

export type CollectorError = {
  code: CollectorErrorCode;
  message: string;
  cause?: string;
};

export type CollectorResult = {
  sourceId: string;
  collectorName: string;
  status: CollectorResultStatus;
  collectedAt: string;
  rawOpportunities: RawCollectedOpportunity[];
  warnings: CollectorWarning[];
  errors: CollectorError[];
};

export type CollectorContext = {
  now: string;
  dryRun?: boolean;
};

export type OpportunityCollector = {
  sourceId: string;
  sourceName: string;
  name: string;
  kind: CollectorKind;
  collect: (context: CollectorContext) => CollectorResult | Promise<CollectorResult>;
};

export type CollectorResultSummary = {
  sourceId: string;
  collectorName: string;
  status: CollectorResultStatus;
  collectedCount: number;
  warningCount: number;
  errorCount: number;
};
