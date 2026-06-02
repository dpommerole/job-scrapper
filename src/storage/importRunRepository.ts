import { desc, eq } from "drizzle-orm";
import type { ImportRun } from "../domain/index.js";
import type { AppDatabase } from "./database.js";
import { importRuns, type ImportRunRow, type NewImportRunRow } from "./schema.js";

export class ImportRunRepository {
  constructor(private readonly db: AppDatabase) {}

  save(importRun: ImportRun): ImportRun {
    const row = toImportRunRow(importRun);

    this.db
      .insert(importRuns)
      .values(row)
      .onConflictDoUpdate({
        target: importRuns.id,
        set: {
          sourceId: row.sourceId,
          type: row.type,
          status: row.status,
          fileName: row.fileName,
          startedAt: row.startedAt,
          finishedAt: row.finishedAt,
          importedCount: row.importedCount,
          skippedDuplicateCount: row.skippedDuplicateCount,
          failedCount: row.failedCount,
          notes: row.notes,
          updatedAt: new Date().toISOString()
        }
      })
      .run();

    return importRun;
  }

  findById(id: string): ImportRun | undefined {
    const row = this.db.select().from(importRuns).where(eq(importRuns.id, id)).get();
    return row ? toImportRun(row) : undefined;
  }

  list(): ImportRun[] {
    return this.db.select().from(importRuns).orderBy(desc(importRuns.startedAt)).all().map(toImportRun);
  }
}

function toImportRunRow(importRun: ImportRun): NewImportRunRow {
  const now = new Date().toISOString();

  return {
    id: importRun.id,
    sourceId: importRun.sourceId,
    type: importRun.type,
    status: importRun.status,
    fileName: importRun.fileName,
    startedAt: importRun.startedAt,
    finishedAt: importRun.finishedAt,
    importedCount: importRun.importedCount,
    skippedDuplicateCount: importRun.skippedDuplicateCount,
    failedCount: importRun.failedCount,
    notes: importRun.notes,
    createdAt: now,
    updatedAt: now
  };
}

function toImportRun(row: ImportRunRow): ImportRun {
  return {
    id: row.id,
    sourceId: row.sourceId ?? undefined,
    type: row.type as ImportRun["type"],
    status: row.status as ImportRun["status"],
    fileName: row.fileName ?? undefined,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt ?? undefined,
    importedCount: row.importedCount,
    skippedDuplicateCount: row.skippedDuplicateCount,
    failedCount: row.failedCount,
    notes: row.notes ?? undefined
  };
}
