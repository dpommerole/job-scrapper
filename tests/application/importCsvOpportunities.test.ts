import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importCsvOpportunities } from "../../src/application/index.js";
import type { Source } from "../../src/domain/index.js";
import {
  createAppDatabase,
  ImportRunRepository,
  OpportunityRepository,
  runInitialMigration,
  SourceRepository,
  type SqliteDatabase
} from "../../src/storage/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

const exampleCsvPath = new URL("../../data/imports/example-opportunities.csv", import.meta.url);
const now = "2026-06-02T12:00:00.000Z";

describe("importCsvOpportunities", () => {
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

  it("imports valid CSV opportunities, scores them, skips duplicates and persists an import run", () => {
    const source: Source = {
      id: "csv-import",
      name: "CSV import",
      type: "csv",
      collectionMethod: "csv",
      priority: "high",
      complianceRisk: "low"
    };
    opportunityRepository.save({
      ...idealVueFreelanceLille,
      id: "existing-vue-lille",
      sourceUrl: "https://example.com/freework/vue-lille"
    });

    const summary = importCsvOpportunities(
      {
        csvText: readFileSync(exampleCsvPath, "utf8"),
        fileName: "example-opportunities.csv",
        importRunId: "import-run-example",
        source,
        now
      },
      {
        sourceRepository,
        opportunityRepository,
        importRunRepository
      }
    );

    expect(summary).toMatchObject({
      importRunId: "import-run-example",
      status: "completed",
      parsedRowCount: 3,
      importedCount: 2,
      skippedDuplicateCount: 1,
      failedCount: 0,
      importedOpportunityIds: [
        "csv-2-senior-frontend-react-typescript",
        "csv-3-frontend-mission-with-missing-details"
      ]
    });
    expect(summary.duplicates).toEqual([
      {
        duplicateId: "csv-1-lead-frontend-vue-3-typescript",
        originalId: "existing-vue-lille",
        reason: "same-source-url"
      }
    ]);
    expect(sourceRepository.findById("csv-import")).toEqual(source);

    const importedReact = opportunityRepository.findById("csv-2-senior-frontend-react-typescript");
    expect(importedReact?.score).toBeGreaterThanOrEqual(65);
    expect(importedReact?.opportunityClass).toBe("interesting");
    expect(importedReact?.positiveSignals).toContain("TypeScript required");

    expect(importRunRepository.findById("import-run-example")).toMatchObject({
      id: "import-run-example",
      sourceId: "csv-import",
      type: "csv",
      status: "completed",
      fileName: "example-opportunities.csv",
      startedAt: now,
      finishedAt: now,
      importedCount: 2,
      skippedDuplicateCount: 1,
      failedCount: 0
    });
  });

  it("reports invalid rows while importing valid rows", () => {
    const csvText = `source,title,description,requiredSkills,remotePolicy,contractType,rateMin,startDate,publishedAt
Manual CSV,Valid Vue mission,Enough detail to normalize safely,Vue.js;TypeScript,remote,freelance,650,ASAP,2026-06-02
,Missing source,Has a description,Vue.js,remote,freelance,600,2026-07-01,2026-06-02`;

    const summary = importCsvOpportunities(
      {
        csvText,
        importRunId: "import-run-invalid-row",
        now
      },
      {
        opportunityRepository,
        importRunRepository
      }
    );

    expect(summary.importedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(summary.invalidRows).toEqual([
      {
        rowNumber: 3,
        row: expect.objectContaining({
          title: "Missing source"
        }),
        reasons: ["Missing required field: source"]
      }
    ]);
    expect(opportunityRepository.list()).toHaveLength(1);
    expect(importRunRepository.findById("import-run-invalid-row")).toMatchObject({
      status: "completed",
      importedCount: 1,
      skippedDuplicateCount: 0,
      failedCount: 1
    });
  });

  it("marks the import run as failed when CSV parsing fails", () => {
    const summary = importCsvOpportunities(
      {
        csvText: "title,description\nBad,\"unterminated",
        importRunId: "import-run-failed",
        now
      },
      {
        opportunityRepository,
        importRunRepository
      }
    );

    expect(summary).toMatchObject({
      importRunId: "import-run-failed",
      status: "failed",
      parsedRowCount: 0,
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 1,
      importedOpportunityIds: []
    });
    expect(summary.invalidRows[0]?.reasons).toEqual(["CSV contains an unterminated quoted field"]);
    expect(importRunRepository.findById("import-run-failed")).toMatchObject({
      status: "failed",
      importedCount: 0,
      skippedDuplicateCount: 0,
      failedCount: 1,
      notes: "CSV contains an unterminated quoted field"
    });
  });
});
