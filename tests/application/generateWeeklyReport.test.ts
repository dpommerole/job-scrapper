import Database from "better-sqlite3";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateWeeklyReport } from "../../src/application/index.js";
import {
  createAppDatabase,
  OpportunityRepository,
  runInitialMigration,
  type SqliteDatabase
} from "../../src/storage/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("generateWeeklyReport", () => {
  let sqlite: SqliteDatabase;
  let opportunityRepository: OpportunityRepository;
  let tempRoot: string;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    opportunityRepository = new OpportunityRepository(createAppDatabase(sqlite));
    tempRoot = mkdtempSync(join(tmpdir(), "job-tracker-report-"));
  });

  afterEach(() => {
    sqlite.close();
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it("writes a weekly markdown report from persisted opportunities", () => {
    opportunityRepository.save({
      ...idealVueFreelanceLille,
      score: 95,
      opportunityClass: "hot",
      missingInformation: []
    });

    const result = generateWeeklyReport(
      {
        generatedAt: "2026-06-08T09:00:00.000Z",
        outputDir: tempRoot
      },
      {
        opportunityRepository
      }
    );

    expect(result.filePath).toBe(join(tempRoot, "2026-06-08-weekly-market-report.md"));
    expect(existsSync(result.filePath)).toBe(true);
    expect(readFileSync(result.filePath, "utf8")).toContain("Lead Frontend Vue 3 TypeScript");
    expect(result.report.metrics.hotOpportunities).toBe(1);
  });
});
