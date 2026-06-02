export type ImportRunType = "csv" | "json" | "manual";

export type ImportRunStatus = "running" | "completed" | "failed";

export type ImportRun = {
  id: string;
  sourceId?: string;
  type: ImportRunType;
  status: ImportRunStatus;
  fileName?: string;
  startedAt: string;
  finishedAt?: string;
  importedCount: number;
  skippedDuplicateCount: number;
  failedCount: number;
  notes?: string;
};
