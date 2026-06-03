import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SqliteDatabase } from "./database.js";

const migrationPaths = [
  "migrations/0001_initial.sql",
  "migrations/0002_import_runs.sql",
  "migrations/0003_outreach.sql",
  "migrations/0004_collector_runs.sql"
];

export function runMigrations(sqlite: SqliteDatabase): void {
  for (const migrationPath of migrationPaths) {
    sqlite.exec(readFileSync(join(process.cwd(), migrationPath), "utf8"));
  }
}

export const runInitialMigration = runMigrations;
