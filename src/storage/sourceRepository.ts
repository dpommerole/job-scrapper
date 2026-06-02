import { eq } from "drizzle-orm";
import type { Source } from "../domain/index.js";
import type { AppDatabase } from "./database.js";
import type { SourceRow } from "./schema.js";
import { sources } from "./schema.js";

export class SourceRepository {
  constructor(private readonly db: AppDatabase) {}

  upsert(source: Source): Source {
    const now = new Date().toISOString();

    this.db
      .insert(sources)
      .values({
        id: source.id,
        name: source.name,
        url: source.url,
        type: source.type,
        collectionMethod: source.collectionMethod,
        priority: source.priority,
        complianceRisk: source.complianceRisk,
        notes: source.notes,
        createdAt: now,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: sources.id,
        set: {
          name: source.name,
          url: source.url,
          type: source.type,
          collectionMethod: source.collectionMethod,
          priority: source.priority,
          complianceRisk: source.complianceRisk,
          notes: source.notes,
          updatedAt: now
        }
      })
      .run();

    return source;
  }

  findById(id: string): Source | undefined {
    const row = this.db.select().from(sources).where(eq(sources.id, id)).get();
    return row ? toSource(row) : undefined;
  }

  list(): Source[] {
    return this.db.select().from(sources).all().map(toSource);
  }
}

function toSource(row: SourceRow): Source {
  return {
    id: row.id,
    name: row.name,
    url: row.url ?? undefined,
    type: row.type as Source["type"],
    collectionMethod: row.collectionMethod as Source["collectionMethod"],
    priority: row.priority as Source["priority"],
    complianceRisk: row.complianceRisk as Source["complianceRisk"],
    notes: row.notes ?? undefined
  };
}
