import type { CollectorError, CollectorKind, CollectorResultStatus, CollectorWarning } from "../collectors/index.js";

export type CollectorRunStatus = CollectorResultStatus;

export type CollectorRun = {
  id: string;
  sourceId: string;
  collectorName: string;
  collectorType: CollectorKind;
  status: CollectorRunStatus;
  startedAt: string;
  finishedAt?: string;
  collectedCount: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  warningCount: number;
  errorCount: number;
  warnings: CollectorWarning[];
  errors: CollectorError[];
};
