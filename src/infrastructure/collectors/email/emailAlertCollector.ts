import { createCollectorResult } from "../../../collectors/index.js";
import type { CollectorResult, OpportunityCollector } from "../../../collectors/index.js";
import { parseEmailAlert } from "./emailAlertParser.js";

export type CreateEmailAlertCollectorInput = {
  sourceId: string;
  sourceName: string;
  collectorName?: string;
  sourceUrl?: string;
  content: string;
};

export function createEmailAlertCollector(input: CreateEmailAlertCollectorInput): OpportunityCollector {
  return {
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    name: input.collectorName ?? `${input.sourceId}-email-alert`,
    kind: "email",
    collect: ({ now }): CollectorResult => {
      const parsed = parseEmailAlert({
        content: input.content,
        sourceId: input.sourceId,
        sourceName: input.sourceName,
        sourceUrl: input.sourceUrl,
        collectedAt: now
      });

      return createCollectorResult({
        sourceId: input.sourceId,
        collectorName: input.collectorName ?? `${input.sourceId}-email-alert`,
        collectedAt: now,
        rawOpportunities: parsed.rawOpportunities,
        warnings: parsed.warnings
      });
    }
  };
}
