import { collectOpportunities } from "../collect-opportunities/index.js";
import type { OpportunityCollector } from "../../collectors/index.js";
import { findDuplicateOpportunity, type DuplicateMatch } from "../../deduplication/index.js";
import type { CollectorRun, Opportunity, Source } from "../../domain/index.js";
import {
  normalizeValidRawCollectedOpportunities,
  type InvalidRawCollectedOpportunity
} from "../../imports/index.js";
import { scoreOpportunity } from "../../scoring/index.js";
import type {
  CollectorRunRepository,
  OpportunityRepository,
  SourceRepository
} from "../../storage/index.js";

export type ImportRssCollectedOpportunitiesInput = {
  collector: OpportunityCollector;
  source?: Source;
  collectorRunId?: string;
  now?: string;
};

export type ImportRssCollectedOpportunitiesDependencies = {
  opportunityRepository: OpportunityRepository;
  collectorRunRepository: CollectorRunRepository;
  sourceRepository?: SourceRepository;
};

export type ImportRssCollectedOpportunitiesSummary = {
  collectorRunId: string;
  status: CollectorRun["status"];
  collectedCount: number;
  importedCount: number;
  skippedDuplicateCount: number;
  invalidCount: number;
  warningCount: number;
  errorCount: number;
  invalidRawOpportunities: InvalidRawCollectedOpportunity[];
  duplicates: DuplicateMatch[];
  importedOpportunityIds: string[];
};

export async function importRssCollectedOpportunities(
  input: ImportRssCollectedOpportunitiesInput,
  dependencies: ImportRssCollectedOpportunitiesDependencies
): Promise<ImportRssCollectedOpportunitiesSummary> {
  const now = input.now ?? new Date().toISOString();
  const collectorRunId = input.collectorRunId ?? createCollectorRunId(input.collector.sourceId, input.collector.name, now);
  const sourceId = input.source?.id ?? input.collector.sourceId;

  if (input.source && dependencies.sourceRepository) {
    dependencies.sourceRepository.upsert(input.source);
  }

  const collectorResult = await collectOpportunities({
    collector: input.collector,
    now,
    collectorRunId,
    collectorRunRepository: dependencies.collectorRunRepository
  });

  const existingOpportunities = dependencies.opportunityRepository.list();
  const { opportunities, invalidRawOpportunities } = normalizeValidRawCollectedOpportunities(collectorResult.rawOpportunities, {
    collectedAt: now
  });
  const importedOpportunities: Opportunity[] = [];
  const duplicates: DuplicateMatch[] = [];

  if (collectorResult.status !== "failed") {
    for (const opportunity of opportunities) {
      const duplicate = findDuplicateOpportunity(opportunity, [
        ...existingOpportunities,
        ...importedOpportunities
      ]);

      if (duplicate) {
        duplicates.push({
          duplicateId: opportunity.id,
          originalId: duplicate.original.id,
          reason: duplicate.reason
        });
        continue;
      }

      const scoringResult = scoreOpportunity(opportunity);
      const scoredOpportunity: Opportunity = {
        ...opportunity,
        score: scoringResult.score,
        opportunityClass: scoringResult.opportunityClass,
        positiveSignals: scoringResult.positiveSignals,
        negativeSignals: scoringResult.negativeSignals,
        missingInformation: scoringResult.missingInformation
      };

      dependencies.opportunityRepository.save(scoredOpportunity, sourceId);
      importedOpportunities.push(scoredOpportunity);
    }
  }

  const warningCount = collectorResult.warnings.length;
  const errorCount = collectorResult.errors.length;
  const finalStatus = inferImportStatus(collectorResult.status, importedOpportunities.length, invalidRawOpportunities.length);

  dependencies.collectorRunRepository.save({
    id: collectorRunId,
    sourceId,
    collectorName: input.collector.name,
    collectorType: input.collector.kind,
    status: finalStatus,
    startedAt: now,
    finishedAt: now,
    collectedCount: collectorResult.rawOpportunities.length,
    importedCount: importedOpportunities.length,
    duplicateCount: duplicates.length,
    invalidCount: invalidRawOpportunities.length,
    warningCount,
    errorCount,
    warnings: collectorResult.warnings,
    errors: collectorResult.errors
  });

  return {
    collectorRunId,
    status: finalStatus,
    collectedCount: collectorResult.rawOpportunities.length,
    importedCount: importedOpportunities.length,
    skippedDuplicateCount: duplicates.length,
    invalidCount: invalidRawOpportunities.length,
    warningCount,
    errorCount,
    invalidRawOpportunities,
    duplicates,
    importedOpportunityIds: importedOpportunities.map((opportunity) => opportunity.id)
  };
}

function inferImportStatus(
  collectorStatus: CollectorRun["status"],
  importedCount: number,
  invalidCount: number
): CollectorRun["status"] {
  if (collectorStatus === "failed") return "failed";
  if (invalidCount > 0 && importedCount > 0) return "partial";
  if (invalidCount > 0 && importedCount === 0) return "failed";
  return collectorStatus;
}

function createCollectorRunId(sourceId: string, collectorName: string, now: string): string {
  return `${sourceId}-${collectorName}-${now}`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
