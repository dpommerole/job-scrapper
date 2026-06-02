import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { importCsvOpportunities } from "../application/index.js";
import {
  createAppDatabase,
  createSqliteDatabase,
  ImportRunRepository,
  OpportunityRepository,
  runMigrations,
  SourceRepository
} from "../storage/index.js";

export type CliIo = {
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

export type RunJobTrackerCliOptions = {
  databasePath?: string;
  now?: string;
  io?: CliIo;
};

export function runJobTrackerCli(args: string[], options: RunJobTrackerCliOptions = {}): number {
  const io = options.io ?? {
    stdout: console.log,
    stderr: console.error
  };
  const [command, filePath] = args;

  if (command !== "import") {
    io.stderr("Usage: job-tracker import <csv-file>");
    return 1;
  }

  if (!filePath) {
    io.stderr("Missing CSV file path.");
    io.stderr("Usage: job-tracker import <csv-file>");
    return 1;
  }

  if (!existsSync(filePath)) {
    io.stderr(`CSV file not found: ${filePath}`);
    return 1;
  }

  const sqlite = createSqliteDatabase(options.databasePath);

  try {
    runMigrations(sqlite);
    const db = createAppDatabase(sqlite);
    const sourceRepository = new SourceRepository(db);
    const opportunityRepository = new OpportunityRepository(db);
    const importRunRepository = new ImportRunRepository(db);
    const summary = importCsvOpportunities(
      {
        csvText: readFileSync(filePath, "utf8"),
        fileName: basename(filePath),
        source: {
          id: "csv-import",
          name: "CSV import",
          type: "csv",
          collectionMethod: "csv",
          priority: "high",
          complianceRisk: "low"
        },
        now: options.now
      },
      {
        sourceRepository,
        opportunityRepository,
        importRunRepository
      }
    );

    io.stdout(`Import ${summary.status}`);
    io.stdout(`File: ${basename(filePath)}`);
    io.stdout(`Parsed rows: ${summary.parsedRowCount}`);
    io.stdout(`Imported: ${summary.importedCount}`);
    io.stdout(`Duplicates skipped: ${summary.skippedDuplicateCount}`);
    io.stdout(`Invalid rows: ${summary.failedCount}`);
    io.stdout(`Import run: ${summary.importRunId}`);

    for (const invalidRow of summary.invalidRows) {
      io.stdout(`Invalid row ${invalidRow.rowNumber}: ${invalidRow.reasons.join("; ")}`);
    }

    return summary.status === "failed" ? 1 : 0;
  } finally {
    sqlite.close();
  }
}
