import { readFileSync } from "node:fs";
import type { SqliteDatabase } from "./database.js";

const initialMigrationUrl = new URL("../../migrations/0001_initial.sql", import.meta.url);

export function runInitialMigration(sqlite: SqliteDatabase): void {
  sqlite.exec(readFileSync(initialMigrationUrl, "utf8"));
}
