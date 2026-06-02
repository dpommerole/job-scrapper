import { describe, expect, it } from "vitest";
import { createOutreachDraft, updateOutreach } from "../../src/application/index.js";
import type { Opportunity, Outreach } from "../../src/domain/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("outreach application services", () => {
  it("creates an outreach draft from an opportunity", () => {
    const saved: Outreach[] = [];
    const result = createOutreachDraft(
      {
        opportunityId: idealVueFreelanceLille.id,
        channel: "email",
        now: "2026-06-02T10:00:00.000Z"
      },
      {
        opportunityRepository: {
          findById: (id: string): Opportunity | undefined => (id === idealVueFreelanceLille.id ? idealVueFreelanceLille : undefined)
        },
        outreachRepository: {
          save: (outreach: Outreach): Outreach => {
            saved.push(outreach);
            return outreach;
          }
        }
      }
    );

    expect(result.status).toBe("created");
    expect(saved[0]).toMatchObject({
      id: `outreach-20260602100000000-${idealVueFreelanceLille.id}`,
      opportunityId: idealVueFreelanceLille.id,
      relatedOpportunityTitle: idealVueFreelanceLille.title,
      status: "draft",
      channel: "email"
    });
  });

  it("returns missing-opportunity when the opportunity cannot be found", () => {
    const result = createOutreachDraft(
      { opportunityId: "missing" },
      {
        opportunityRepository: { findById: () => undefined },
        outreachRepository: { save: (outreach: Outreach): Outreach => outreach }
      }
    );

    expect(result).toEqual({ status: "missing-opportunity" });
  });

  it("sets sent and replied timestamps from status transitions", () => {
    const existing: Outreach = {
      id: "outreach-1",
      opportunityId: idealVueFreelanceLille.id,
      channel: "email",
      status: "draft",
      message: "Bonjour",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z"
    };

    const updated = updateOutreach(
      {
        id: existing.id,
        status: "sent",
        now: "2026-06-02T10:00:00.000Z"
      },
      {
        outreachRepository: {
          findById: () => existing,
          update: (_id, update): Outreach => ({ ...existing, ...update, updatedAt: "2026-06-02T10:00:00.000Z" })
        }
      }
    );

    expect(updated).toMatchObject({
      status: "sent",
      sentAt: "2026-06-02T10:00:00.000Z"
    });
  });
});
