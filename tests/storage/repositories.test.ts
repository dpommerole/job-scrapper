import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Source } from "../../src/domain/index.js";
import {
  createAppDatabase,
  type SqliteDatabase,
  OpportunityRepository,
  runInitialMigration,
  SourceRepository
} from "../../src/storage/index.js";
import { scoreOpportunity } from "../../src/scoring/index.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

describe("SQLite repositories", () => {
  let sqlite: SqliteDatabase;
  let sourceRepository: SourceRepository;
  let opportunityRepository: OpportunityRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    const db = createAppDatabase(sqlite);
    sourceRepository = new SourceRepository(db);
    opportunityRepository = new OpportunityRepository(db);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("upserts and reads sources", () => {
    const source: Source = {
      id: "manual-import",
      name: "Manual import",
      type: "manual-import",
      collectionMethod: "manual",
      priority: "high",
      complianceRisk: "low",
      notes: "Safe MVP source"
    };

    sourceRepository.upsert(source);
    sourceRepository.upsert({
      ...source,
      name: "Manual imports",
      notes: "Updated"
    });

    expect(sourceRepository.findById("manual-import")).toEqual({
      ...source,
      name: "Manual imports",
      notes: "Updated"
    });
    expect(sourceRepository.list()).toHaveLength(1);
  });

  it("saves and reads scored opportunities", () => {
    const scoringResult = scoreOpportunity(idealVueFreelanceLille);
    const opportunity = {
      ...idealVueFreelanceLille,
      score: scoringResult.score,
      opportunityClass: scoringResult.opportunityClass,
      positiveSignals: scoringResult.positiveSignals,
      negativeSignals: scoringResult.negativeSignals,
      missingInformation: scoringResult.missingInformation
    };

    opportunityRepository.save(opportunity);

    expect(opportunityRepository.findById(opportunity.id)).toEqual(opportunity);
  });

  it("lists opportunities by collected date descending", () => {
    opportunityRepository.save({
      ...idealVueFreelanceLille,
      id: "older",
      collectedAt: "2026-06-01T10:00:00.000Z"
    });
    opportunityRepository.save({
      ...reactRemoteFreelance,
      id: "newer",
      collectedAt: "2026-06-02T10:00:00.000Z"
    });

    expect(opportunityRepository.list().map((opportunity) => opportunity.id)).toEqual(["newer", "older"]);
  });
});
