import { createCollectorResult } from "../../collectors/index.js";
import type { CollectorResult, OpportunityCollector } from "../../collectors/index.js";
import type { CollectorRun } from "../../domain/index.js";

export type CollectOpportunitiesInput = {
  collector: OpportunityCollector;
  now?: string;
  dryRun?: boolean;
  collectorRunId?: string;
  collectorRunRepository?: {
    save: (collectorRun: CollectorRun) => CollectorRun;
  };
};

export async function collectOpportunities(input: CollectOpportunitiesInput): Promise<CollectorResult> {
  const now = input.now ?? new Date().toISOString();
  const startedAt = now;

  try {
    const result = await input.collector.collect({
      now,
      dryRun: input.dryRun
    });

    const collectorResult = createCollectorResult({
      sourceId: result.sourceId,
      collectorName: result.collectorName,
      collectedAt: result.collectedAt,
      rawOpportunities: result.rawOpportunities,
      warnings: result.warnings,
      errors: result.errors,
      status: result.status
    });

    saveCollectorRun(input, collectorResult, startedAt, input.now ?? new Date().toISOString());

    return collectorResult;
  } catch (error) {
    const collectorResult = createCollectorResult({
      sourceId: input.collector.sourceId,
      collectorName: input.collector.name,
      collectedAt: now,
      errors: [
        {
          code: "unknown-error",
          message: "Collector failed before returning a result.",
          cause: error instanceof Error ? error.message : String(error)
        }
      ]
    });

    saveCollectorRun(input, collectorResult, startedAt, input.now ?? new Date().toISOString());

    return collectorResult;
  }
}

function saveCollectorRun(
  input: CollectOpportunitiesInput,
  result: CollectorResult,
  startedAt: string,
  finishedAt: string
): void {
  input.collectorRunRepository?.save({
    id: input.collectorRunId ?? createCollectorRunId(input.collector.sourceId, input.collector.name, startedAt),
    sourceId: input.collector.sourceId,
    collectorName: input.collector.name,
    collectorType: input.collector.kind,
    status: result.status,
    startedAt,
    finishedAt,
    collectedCount: result.rawOpportunities.length,
    importedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    warningCount: result.warnings.length,
    errorCount: result.errors.length,
    warnings: result.warnings,
    errors: result.errors
  });
}

function createCollectorRunId(sourceId: string, collectorName: string, startedAt: string): string {
  return `${sourceId}-${collectorName}-${startedAt}`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
