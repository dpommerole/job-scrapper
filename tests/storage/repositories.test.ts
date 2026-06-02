import Database from "better-sqlite3";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Source } from "../../src/domain/index.js";
import {
  createSqliteDatabase,
  createAppDatabase,
  ImportRunRepository,
  type SqliteDatabase,
  OpportunityRepository,
  runInitialMigration,
  SourceRepository
} from "../../src/storage/index.js";
import { scoreOpportunity } from "../../src/scoring/index.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

describe("SQLite repositories", () => {
  let sqlite: SqliteDatabase;
  let sourceRepository: SourceRepository;
  let opportunityRepository: OpportunityRepository;
  let importRunRepository: ImportRunRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    const db = createAppDatabase(sqlite);
    sourceRepository = new SourceRepository(db);
    opportunityRepository = new OpportunityRepository(db);
    importRunRepository = new ImportRunRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("upserts and reads sources", () => {
    const source: Source = {
      id: "manual-import",
      name: "Manual import",
      type: "manual-import",
      collectionMethod: "manual",
      priority: "high",
      complianceRisk: "low",
      notes: "Safe MVP source"
    };

    sourceRepository.upsert(source);
    sourceRepository.upsert({
      ...source,
      name: "Manual imports",
      notes: "Updated"
    });

    expect(sourceRepository.findById("manual-import")).toEqual({
      ...source,
      name: "Manual imports",
      notes: "Updated"
    });
    expect(sourceRepository.list()).toHaveLength(1);
  });

  it("saves and reads scored opportunities", () => {
    const scoringResult = scoreOpportunity(idealVueFreelanceLille);
    const opportunity = {
      ...idealVueFreelanceLille,
      score: scoringResult.score,
      opportunityClass: scoringResult.opportunityClass,
      positiveSignals: scoringResult.positiveSignals,
      negativeSignals: scoringResult.negativeSignals,
      missingInformation: scoringResult.missingInformation
    };

    opportunityRepository.save(opportunity);

    expect(opportunityRepository.findById(opportunity.id)).toEqual(opportunity);
  });

  it("lists opportunities by collected date descending", () => {
    opportunityRepository.save({
      ...idealVueFreelanceLille,
      id: "older",
      collectedAt: "2026-06-01T10:00:00.000Z"
    });
    opportunityRepository.save({
      ...reactRemoteFreelance,
      id: "newer",
      collectedAt: "2026-06-02T10:00:00.000Z"
    });

    expect(opportunityRepository.list().map((opportunity) => opportunity.id)).toEqual(["newer", "older"]);
  });

  it("creates missing parent directories for file-backed databases", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "job-scrapper-db-"));
    const databasePath = join(tempRoot, "nested", "job-tracker.sqlite");
    const fileBackedSqlite = createSqliteDatabase(databasePath);

    try {
      runInitialMigration(fileBackedSqlite);
      expect(fileBackedSqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sources'").get()).toEqual({
        name: "sources"
      });
    } finally {
      fileBackedSqlite.close();
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("saves and updates import runs without import business logic", () => {
    const source: Source = {
      id: "csv-import",
      name: "CSV import",
      type: "csv",
      collectionMethod: "csv",
      priority: "high",
      complianceRisk: "low"
    };
    sourceRepository.upsert(source);

    importRunRepository.save({
      id: "import-run-1",
      sourceId: source.id,
      type: "csv",
      status: "running",
      fileName: "opportunities.csv",
      startedAt: "2026-06-02T10:00:00.000Z",
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 0
    });

    importRunRepository.save({
      id: "import-run-1",
      sourceId: source.id,
      type: "csv",
      status: "completed",
      fileName: "opportunities.csv",
      startedAt: "2026-06-02T10:00:00.000Z",
      finishedAt: "2026-06-02T10:01:00.000Z",
      importedCount: 3,
      skippedDuplicateCount: 1,
      failedCount: 0,
      notes: "Repository stores the summary only"
    });

    expect(importRunRepository.findById("import-run-1")).toEqual({
      id: "import-run-1",
      sourceId: source.id,
      type: "csv",
      status: "completed",
      fileName: "opportunities.csv",
      startedAt: "2026-06-02T10:00:00.000Z",
      finishedAt: "2026-06-02T10:01:00.000Z",
      importedCount: 3,
      skippedDuplicateCount: 1,
      failedCount: 0,
      notes: "Repository stores the summary only"
    });
  });

  it("lists import runs by start date descending", () => {
    importRunRepository.save({
      id: "older-import",
      type: "manual",
      status: "completed",
      startedAt: "2026-06-01T10:00:00.000Z",
      finishedAt: "2026-06-01T10:05:00.000Z",
      importedCount: 1,
      skippedDuplicateCount: 0,
      failedCount: 0
    });
    importRunRepository.save({
      id: "newer-import",
      type: "json",
      status: "failed",
      startedAt: "2026-06-02T10:00:00.000Z",
      finishedAt: "2026-06-02T10:03:00.000Z",
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 1
    });

    expect(importRunRepository.list().map((importRun) => importRun.id)).toEqual(["newer-import", "older-import"]);
  });
});
