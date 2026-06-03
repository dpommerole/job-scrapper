import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importRssCollectedOpportunities } from "../../src/application/index.js";
import type { Source } from "../../src/domain/index.js";
import { createRssCollector } from "../../src/infrastructure/index.js";
import {
  CollectorRunRepository,
  createAppDatabase,
  OpportunityRepository,
  runInitialMigration,
  SourceRepository,
  type SqliteDatabase
} from "../../src/storage/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

const now = "2026-06-03T12:00:00.000Z";
const feedUrl = "https://rss.example/jobs.xml";

function fixturePath(name: string): URL {
  return new URL(`../../data/rss/${name}`, import.meta.url);
}

function readFixture(name: string): string {
  return readFileSync(fixturePath(name), "utf8");
}

describe("importRssCollectedOpportunities", () => {
  let sqlite: SqliteDatabase;
  let sourceRepository: SourceRepository;
  let opportunityRepository: OpportunityRepository;
  let collectorRunRepository: CollectorRunRepository;

  const source: Source = {
    id: "rss-source",
    name: "RSS Source",
    url: feedUrl,
    type: "rss",
    collectionMethod: "rss",
    priority: "high",
    complianceRisk: "low"
  };

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    const db = createAppDatabase(sqlite);
    sourceRepository = new SourceRepository(db);
    opportunityRepository = new OpportunityRepository(db);
    collectorRunRepository = new CollectorRunRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("imports RSS items as scored opportunities and records collector run counts", async () => {
    const collector = createRssCollector({
      sourceId: source.id,
      sourceName: source.name,
      feedUrl,
      fetchFeed: async () => readFixture("valid-feed.xml")
    });

    const summary = await importRssCollectedOpportunities(
      {
        collector,
        source,
        collectorRunId: "rss-run-1",
        now
      },
      {
        sourceRepository,
        opportunityRepository,
        collectorRunRepository
      }
    );

    expect(summary).toMatchObject({
      collectorRunId: "rss-run-1",
      status: "success",
      collectedCount: 2,
      importedCount: 2,
      skippedDuplicateCount: 0,
      invalidCount: 0,
      warningCount: 0,
      errorCount: 0
    });

    const imported = opportunityRepository.findById("rss-vue-lille");
    expect(imported).toMatchObject({
      source: "RSS Source",
      sourceUrl: "https://rss.example/jobs/vue-lille",
      title: "Lead Frontend Vue TypeScript",
      collectedAt: now,
      status: "new"
    });
    expect(imported?.score).toBeGreaterThan(0);
    expect(imported?.opportunityClass).toBeDefined();

    expect(collectorRunRepository.findById("rss-run-1")).toMatchObject({
      id: "rss-run-1",
      sourceId: source.id,
      collectorName: "rss-source-rss",
      collectorType: "rss",
      status: "success",
      collectedCount: 2,
      importedCount: 2,
      duplicateCount: 0,
      invalidCount: 0
    });
  });

  it("detects RSS duplicates instead of silently reinserting them", async () => {
    sourceRepository.upsert(source);
    opportunityRepository.save(
      {
        ...idealVueFreelanceLille,
        id: "existing-rss-vue",
        source: "RSS Source",
        sourceUrl: "https://rss.example/jobs/vue-lille",
        collectedAt: "2026-06-01T12:00:00.000Z"
      },
      source.id
    );

    const collector = createRssCollector({
      sourceId: source.id,
      sourceName: source.name,
      feedUrl,
      fetchFeed: async () => readFixture("valid-feed.xml")
    });

    const summary = await importRssCollectedOpportunities(
      {
        collector,
        source,
        collectorRunId: "rss-run-duplicates",
        now
      },
      {
        sourceRepository,
        opportunityRepository,
        collectorRunRepository
      }
    );

    expect(summary).toMatchObject({
      importedCount: 1,
      skippedDuplicateCount: 1,
      importedOpportunityIds: ["rss-design-system"]
    });
    expect(summary.duplicates).toEqual([
      {
        duplicateId: "rss-vue-lille",
        originalId: "existing-rss-vue",
        reason: "same-source-url"
      }
    ]);
    expect(collectorRunRepository.findById("rss-run-duplicates")).toMatchObject({
      collectedCount: 2,
      importedCount: 1,
      duplicateCount: 1,
      invalidCount: 0
    });
  });

  it("marks invalid RSS items in the collector run summary", async () => {
    const collector = createRssCollector({
      sourceId: source.id,
      sourceName: source.name,
      feedUrl,
      fetchFeed: async () => readFixture("missing-title.xml")
    });

    const summary = await importRssCollectedOpportunities(
      {
        collector,
        source,
        collectorRunId: "rss-run-invalid",
        now
      },
      {
        sourceRepository,
        opportunityRepository,
        collectorRunRepository
      }
    );

    expect(summary).toMatchObject({
      status: "failed",
      collectedCount: 1,
      importedCount: 0,
      invalidCount: 1,
      warningCount: 1,
      errorCount: 0
    });
    expect(summary.invalidRawOpportunities[0].reasons).toEqual(["Missing required field: title"]);
    expect(collectorRunRepository.findById("rss-run-invalid")).toMatchObject({
      status: "failed",
      collectedCount: 1,
      importedCount: 0,
      duplicateCount: 0,
      invalidCount: 1,
      warningCount: 1
    });
  });
});
