import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createAppDatabase,
  OpportunityRepository,
  OutreachRepository,
  runInitialMigration,
  type SqliteDatabase
} from "../../src/storage/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("OutreachRepository", () => {
  let sqlite: SqliteDatabase;
  let opportunityRepository: OpportunityRepository;
  let outreachRepository: OutreachRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    runInitialMigration(sqlite);
    const db = createAppDatabase(sqlite);
    opportunityRepository = new OpportunityRepository(db);
    outreachRepository = new OutreachRepository(db);
    opportunityRepository.save(idealVueFreelanceLille);
  });

  afterEach(() => {
    sqlite.close();
  });

  it("saves and lists outreach items", () => {
    outreachRepository.save({
      id: "outreach-1",
      opportunityId: idealVueFreelanceLille.id,
      recruiterName: "Marie",
      recruiterCompany: "Acme Recruiting",
      relatedOpportunityTitle: idealVueFreelanceLille.title,
      channel: "email",
      status: "draft",
      subject: "Mission Vue",
      message: "Bonjour",
      followUpAt: "2026-06-02",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z"
    });

    expect(outreachRepository.list()).toHaveLength(1);
    expect(outreachRepository.findById("outreach-1")).toMatchObject({
      opportunityId: idealVueFreelanceLille.id,
      recruiterName: "Marie",
      status: "draft"
    });
  });

  it("updates status and follow-up fields", () => {
    outreachRepository.save({
      id: "outreach-1",
      opportunityId: idealVueFreelanceLille.id,
      channel: "email",
      status: "draft",
      message: "Bonjour",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z"
    });

    const updated = outreachRepository.update("outreach-1", {
      status: "sent",
      sentAt: "2026-06-02T10:00:00.000Z",
      followUpAt: "2026-06-06",
      notes: "Intro sent."
    });

    expect(updated).toMatchObject({
      id: "outreach-1",
      status: "sent",
      sentAt: "2026-06-02T10:00:00.000Z",
      followUpAt: "2026-06-06",
      notes: "Intro sent."
    });
  });

  it("returns undefined when updating a missing outreach item", () => {
    expect(outreachRepository.update("missing", { status: "closed" })).toBeUndefined();
  });
});
