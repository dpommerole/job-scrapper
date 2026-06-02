import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { runJobTrackerCli } from "../../src/cli/jobTrackerCli.js";
import {
  createAppDatabase,
  ImportRunRepository,
  OpportunityRepository,
  runMigrations
} from "../../src/storage/index.js";

const exampleCsvPath = new URL("../../data/imports/example-opportunities.csv", import.meta.url).pathname;

function createIoCapture(): { stdout: string[]; stderr: string[]; io: { stdout: (message: string) => void; stderr: (message: string) => void } } {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    stdout,
    stderr,
    io: {
      stdout: (message) => stdout.push(message),
      stderr: (message) => stderr.push(message)
    }
  };
}

describe("job-tracker CLI", () => {
  const tempRoots: string[] = [];

  afterEach(() => {
    for (const tempRoot of tempRoots.splice(0)) {
      rmSync(tempRoot, { recursive: true, force: true });
    }
  });

  it("imports a CSV file and prints a summary", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "job-tracker-cli-"));
    tempRoots.push(tempRoot);
    const databasePath = join(tempRoot, "job-tracker.sqlite");
    const { stdout, stderr, io } = createIoCapture();

    const exitCode = runJobTrackerCli(["import", exampleCsvPath], {
      databasePath,
      now: "2026-06-02T12:00:00.000Z",
      io
    });

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(stdout).toEqual([
      "Import completed",
      "File: example-opportunities.csv",
      "Parsed rows: 3",
      "Imported: 3",
      "Duplicates skipped: 0",
      "Invalid rows: 0",
      "Import run: csv-import-20260602120000000"
    ]);

    const sqlite = new Database(databasePath);
    try {
      runMigrations(sqlite);
      const db = createAppDatabase(sqlite);
      const opportunityRepository = new OpportunityRepository(db);
      const importRunRepository = new ImportRunRepository(db);

      expect(opportunityRepository.list()).toHaveLength(3);
      expect(opportunityRepository.findById("csv-1-lead-frontend-vue-3-typescript")?.score).toBeGreaterThanOrEqual(80);
      expect(importRunRepository.findById("csv-import-20260602120000000")).toMatchObject({
        status: "completed",
        importedCount: 3,
        skippedDuplicateCount: 0,
        failedCount: 0
      });
    } finally {
      sqlite.close();
    }
  });

  it("returns a useful error for an invalid file path", () => {
    const { stdout, stderr, io } = createIoCapture();

    const exitCode = runJobTrackerCli(["import", "/missing/opportunities.csv"], { io });

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr).toEqual(["CSV file not found: /missing/opportunities.csv"]);
  });

  it("prints usage when the command is missing", () => {
    const { stdout, stderr, io } = createIoCapture();

    const exitCode = runJobTrackerCli([], { io });

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr).toEqual(["Usage: job-tracker import <csv-file>"]);
  });
});
