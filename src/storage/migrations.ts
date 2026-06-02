import { readFileSync } from "node:fs";
import type { SqliteDatabase } from "./database.js";

const migrationUrls = [
  new URL("../../migrations/0001_initial.sql", import.meta.url),
  new URL("../../migrations/0002_import_runs.sql", import.meta.url)
];

export function runMigrations(sqlite: SqliteDatabase): void {
  for (const migrationUrl of migrationUrls) {
    sqlite.exec(readFileSync(migrationUrl, "utf8"));
  }
}

export const runInitialMigration = runMigrations;
