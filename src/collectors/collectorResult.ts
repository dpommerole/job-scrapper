import type {
  CollectorError,
  CollectorResult,
  CollectorResultStatus,
  CollectorResultSummary,
  CollectorWarning,
  RawCollectedOpportunity
} from "./types.js";

export type CreateCollectorResultInput = {
  sourceId: string;
  collectorName: string;
  collectedAt: string;
  rawOpportunities?: RawCollectedOpportunity[];
  warnings?: CollectorWarning[];
  errors?: CollectorError[];
  status?: CollectorResultStatus;
};

export function createCollectorResult(input: CreateCollectorResultInput): CollectorResult {
  const rawOpportunities = input.rawOpportunities ?? [];
  const warnings = input.warnings ?? [];
  const errors = input.errors ?? [];

  return {
    sourceId: input.sourceId,
    collectorName: input.collectorName,
    status: input.status ?? inferCollectorStatus(rawOpportunities.length, errors.length),
    collectedAt: input.collectedAt,
    rawOpportunities,
    warnings,
    errors
  };
}

export function createEmptyCollectorResult(input: {
  sourceId: string;
  collectorName: string;
  collectedAt: string;
  warnings?: CollectorWarning[];
  errors?: CollectorError[];
}): CollectorResult {
  return createCollectorResult({
    sourceId: input.sourceId,
    collectorName: input.collectorName,
    collectedAt: input.collectedAt,
    warnings: input.warnings,
    errors: input.errors
  });
}

export function summarizeCollectorResult(result: CollectorResult): CollectorResultSummary {
  return {
    sourceId: result.sourceId,
    collectorName: result.collectorName,
    status: result.status,
    collectedCount: result.rawOpportunities.length,
    warningCount: result.warnings.length,
    errorCount: result.errors.length
  };
}

export function inferCollectorStatus(collectedCount: number, errorCount: number): CollectorResultStatus {
  if (errorCount === 0) {
    return "success";
  }

  return collectedCount > 0 ? "partial" : "failed";
}
