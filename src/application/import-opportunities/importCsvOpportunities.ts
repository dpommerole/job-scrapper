import { findDuplicateOpportunity, type DuplicateMatch } from "../../deduplication/index.js";
import type { ImportRun, Opportunity, Source } from "../../domain/index.js";
import {
  normalizeValidCsvOpportunityRows,
  parseCsv,
  type InvalidCsvOpportunityRow
} from "../../imports/index.js";
import { scoreOpportunity } from "../../scoring/index.js";
import type {
  ImportRunRepository,
  OpportunityRepository,
  SourceRepository
} from "../../storage/index.js";

export type ImportCsvOpportunitiesInput = {
  csvText: string;
  fileName?: string;
  importRunId?: string;
  source?: Source;
  now?: string;
};

export type ImportCsvOpportunitiesDependencies = {
  opportunityRepository: OpportunityRepository;
  importRunRepository: ImportRunRepository;
  sourceRepository?: SourceRepository;
};

export type ImportCsvOpportunitiesSummary = {
  importRunId: string;
  status: ImportRun["status"];
  parsedRowCount: number;
  importedCount: number;
  skippedDuplicateCount: number;
  failedCount: number;
  invalidRows: InvalidCsvOpportunityRow[];
  duplicates: DuplicateMatch[];
  importedOpportunityIds: string[];
};

export function importCsvOpportunities(
  input: ImportCsvOpportunitiesInput,
  dependencies: ImportCsvOpportunitiesDependencies
): ImportCsvOpportunitiesSummary {
  const now = input.now ?? new Date().toISOString();
  const importRunId = input.importRunId ?? createImportRunId(now);
  const sourceId = input.source?.id;

  if (input.source && dependencies.sourceRepository) {
    dependencies.sourceRepository.upsert(input.source);
  }

  dependencies.importRunRepository.save({
    id: importRunId,
    sourceId,
    type: "csv",
    status: "running",
    fileName: input.fileName,
    startedAt: now,
    importedCount: 0,
    skippedDuplicateCount: 0,
    failedCount: 0
  });

  try {
    const rows = parseCsv(input.csvText);
    const { opportunities, invalidRows } = normalizeValidCsvOpportunityRows(rows, {
      collectedAt: now
    });
    const existingOpportunities = dependencies.opportunityRepository.list();
    const importedOpportunities: Opportunity[] = [];
    const duplicates: DuplicateMatch[] = [];

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

    const summary: ImportCsvOpportunitiesSummary = {
      importRunId,
      status: "completed",
      parsedRowCount: rows.length,
      importedCount: importedOpportunities.length,
      skippedDuplicateCount: duplicates.length,
      failedCount: invalidRows.length,
      invalidRows,
      duplicates,
      importedOpportunityIds: importedOpportunities.map((opportunity) => opportunity.id)
    };

    dependencies.importRunRepository.save({
      id: importRunId,
      sourceId,
      type: "csv",
      status: "completed",
      fileName: input.fileName,
      startedAt: now,
      finishedAt: now,
      importedCount: summary.importedCount,
      skippedDuplicateCount: summary.skippedDuplicateCount,
      failedCount: summary.failedCount,
      notes: importSummaryNote(summary)
    });

    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CSV import error";

    dependencies.importRunRepository.save({
      id: importRunId,
      sourceId,
      type: "csv",
      status: "failed",
      fileName: input.fileName,
      startedAt: now,
      finishedAt: now,
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 1,
      notes: message
    });

    return {
      importRunId,
      status: "failed",
      parsedRowCount: 0,
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 1,
      invalidRows: [
        {
          rowNumber: 0,
          row: {},
          reasons: [message]
        }
      ],
      duplicates: [],
      importedOpportunityIds: []
    };
  }
}

function importSummaryNote(summary: ImportCsvOpportunitiesSummary): string {
  return [
    `Imported ${summary.importedCount} opportunities`,
    `skipped ${summary.skippedDuplicateCount} duplicates`,
    `reported ${summary.failedCount} invalid rows`
  ].join(", ");
}

function createImportRunId(now: string): string {
  return `csv-import-${now.replace(/[^0-9]/g, "")}`;
}
