import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CollectorRun, Source } from "../../src/domain/index.js";
import {
  CollectorRunRepository,
  createAppDatabase,
  runInitialMigration,
  SourceRepository,
  type SqliteDatabase
} from "../../src/storage/index.js";

describe("CollectorRunRepository", () => {
  let sqlite: SqliteDatabase;
  let sourceRepository: SourceRepository;
  let collectorRunRepository: CollectorRunRepository;

  const source: Source = {
    id: "rss-source",
    name: "RSS Source",
    type: "rss",
    collectionMethod: "rss",
    priority: "high",
    complianceRisk: "low"
  };

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    const db = createAppDatabase(sqlite);
    sourceRepository = new SourceRepository(db);
    collectorRunRepository = new CollectorRunRepository(db);
    sourceRepository.upsert(source);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("creates a successful collector run", () => {
    const collectorRun: CollectorRun = {
      id: "collector-run-success",
      sourceId: source.id,
      collectorName: "rss-safe-collector",
      collectorType: "rss",
      status: "success",
      startedAt: "2026-06-03T10:00:00.000Z",
      finishedAt: "2026-06-03T10:01:00.000Z",
      collectedCount: 3,
      importedCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      warningCount: 0,
      errorCount: 0,
      warnings: [],
      errors: []
    };

    collectorRunRepository.save(collectorRun);

    expect(collectorRunRepository.findById("collector-run-success")).toEqual(collectorRun);
  });

  it("creates a failed collector run with visible errors and warnings", () => {
    const collectorRun: CollectorRun = {
      id: "collector-run-failed",
      sourceId: source.id,
      collectorName: "rss-safe-collector",
      collectorType: "rss",
      status: "failed",
      startedAt: "2026-06-03T10:00:00.000Z",
      finishedAt: "2026-06-03T10:01:00.000Z",
      collectedCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      invalidCount: 0,
      warningCount: 1,
      errorCount: 1,
      warnings: [
        {
          code: "partial-result",
          message: "Feed returned no items."
        }
      ],
      errors: [
        {
          code: "parse-error",
          message: "RSS XML could not be parsed.",
          cause: "Unexpected closing tag"
        }
      ]
    };

    collectorRunRepository.save(collectorRun);

    expect(collectorRunRepository.findById("collector-run-failed")).toEqual(collectorRun);
  });

  it("queries collector runs by source with latest first", () => {
    collectorRunRepository.save(createCollectorRun("older-run", source.id, "2026-06-01T10:00:00.000Z"));
    collectorRunRepository.save(createCollectorRun("newer-run", source.id, "2026-06-02T10:00:00.000Z"));

    expect(collectorRunRepository.listBySource(source.id).map((collectorRun) => collectorRun.id)).toEqual([
      "newer-run",
      "older-run"
    ]);
  });

  it("queries the latest collector run by source", () => {
    collectorRunRepository.save(createCollectorRun("older-run", source.id, "2026-06-01T10:00:00.000Z"));
    collectorRunRepository.save(createCollectorRun("newer-run", source.id, "2026-06-02T10:00:00.000Z"));

    expect(collectorRunRepository.findLatestBySource(source.id)?.id).toBe("newer-run");
    expect(collectorRunRepository.findLatestBySource("missing-source")).toBeUndefined();
  });
});

function createCollectorRun(id: string, sourceId: string, startedAt: string): CollectorRun {
  return {
    id,
    sourceId,
    collectorName: "rss-safe-collector",
    collectorType: "rss",
    status: "success",
    startedAt,
    finishedAt: startedAt,
    collectedCount: 1,
    importedCount: 0,
    duplicateCount: 0,
    invalidCount: 0,
    warningCount: 0,
    errorCount: 0,
    warnings: [],
    errors: []
  };
}
