import { desc, eq } from "drizzle-orm";
import type { CollectorRun } from "../domain/index.js";
import type { AppDatabase } from "./database.js";
import { collectorRuns, type CollectorRunRow, type NewCollectorRunRow } from "./schema.js";

export class CollectorRunRepository {
  constructor(private readonly db: AppDatabase) {}

  save(collectorRun: CollectorRun): CollectorRun {
    const row = toCollectorRunRow(collectorRun);

    this.db
      .insert(collectorRuns)
      .values(row)
      .onConflictDoUpdate({
        target: collectorRuns.id,
        set: {
          sourceId: row.sourceId,
          collectorName: row.collectorName,
          collectorType: row.collectorType,
          status: row.status,
          startedAt: row.startedAt,
          finishedAt: row.finishedAt,
          collectedCount: row.collectedCount,
          importedCount: row.importedCount,
          duplicateCount: row.duplicateCount,
          invalidCount: row.invalidCount,
          warningCount: row.warningCount,
          errorCount: row.errorCount,
          warningsJson: row.warningsJson,
          errorsJson: row.errorsJson,
          updatedAt: new Date().toISOString()
        }
      })
      .run();

    return collectorRun;
  }

  findById(id: string): CollectorRun | undefined {
    const row = this.db.select().from(collectorRuns).where(eq(collectorRuns.id, id)).get();
    return row ? toCollectorRun(row) : undefined;
  }

  listBySource(sourceId: string): CollectorRun[] {
    return this.db
      .select()
      .from(collectorRuns)
      .where(eq(collectorRuns.sourceId, sourceId))
      .orderBy(desc(collectorRuns.startedAt))
      .all()
      .map(toCollectorRun);
  }

  findLatestBySource(sourceId: string): CollectorRun | undefined {
    const row = this.db
      .select()
      .from(collectorRuns)
      .where(eq(collectorRuns.sourceId, sourceId))
      .orderBy(desc(collectorRuns.startedAt))
      .limit(1)
      .get();

    return row ? toCollectorRun(row) : undefined;
  }
}

function toCollectorRunRow(collectorRun: CollectorRun): NewCollectorRunRow {
  const now = new Date().toISOString();

  return {
    id: collectorRun.id,
    sourceId: collectorRun.sourceId,
    collectorName: collectorRun.collectorName,
    collectorType: collectorRun.collectorType,
    status: collectorRun.status,
    startedAt: collectorRun.startedAt,
    finishedAt: collectorRun.finishedAt,
    collectedCount: collectorRun.collectedCount,
    importedCount: collectorRun.importedCount,
    duplicateCount: collectorRun.duplicateCount,
    invalidCount: collectorRun.invalidCount,
    warningCount: collectorRun.warningCount,
    errorCount: collectorRun.errorCount,
    warningsJson: JSON.stringify(collectorRun.warnings),
    errorsJson: JSON.stringify(collectorRun.errors),
    createdAt: now,
    updatedAt: now
  };
}

function toCollectorRun(row: CollectorRunRow): CollectorRun {
  return {
    id: row.id,
    sourceId: row.sourceId,
    collectorName: row.collectorName,
    collectorType: row.collectorType as CollectorRun["collectorType"],
    status: row.status as CollectorRun["status"],
    startedAt: row.startedAt,
    finishedAt: row.finishedAt ?? undefined,
    collectedCount: row.collectedCount,
    importedCount: row.importedCount,
    duplicateCount: row.duplicateCount,
    invalidCount: row.invalidCount,
    warningCount: row.warningCount,
    errorCount: row.errorCount,
    warnings: parseJsonArray(row.warningsJson),
    errors: parseJsonArray(row.errorsJson)
  };
}

function parseJsonArray<T>(value: string): T[] {
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}
