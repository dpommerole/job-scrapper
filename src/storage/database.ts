import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import * as schema from "./schema.js";

export type SqliteDatabase = Database.Database;
export type AppDatabase = BetterSQLite3Database<typeof schema>;

export function createSqliteDatabase(databasePath = "data/job-tracker.sqlite"): SqliteDatabase {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  return new Database(databasePath);
}

export function createAppDatabase(sqlite: SqliteDatabase): AppDatabase {
  return drizzle(sqlite, { schema });
}
