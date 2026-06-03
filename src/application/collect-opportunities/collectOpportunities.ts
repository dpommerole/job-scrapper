import { createCollectorResult } from "../../collectors/index.js";
import type { CollectorResult, OpportunityCollector } from "../../collectors/index.js";

export type CollectOpportunitiesInput = {
  collector: OpportunityCollector;
  now?: string;
  dryRun?: boolean;
};

export async function collectOpportunities(input: CollectOpportunitiesInput): Promise<CollectorResult> {
  const now = input.now ?? new Date().toISOString();

  try {
    const result = await input.collector.collect({
      now,
      dryRun: input.dryRun
    });

    return createCollectorResult({
      sourceId: result.sourceId,
      collectorName: result.collectorName,
      collectedAt: result.collectedAt,
      rawOpportunities: result.rawOpportunities,
      warnings: result.warnings,
      errors: result.errors,
      status: result.status
    });
  } catch (error) {
    return createCollectorResult({
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
  }
}
