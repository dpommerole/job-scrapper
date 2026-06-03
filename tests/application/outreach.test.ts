import { describe, expect, it } from "vitest";
import { createOutreachDraft, generateOutreachDraft, updateOutreach } from "../../src/application/index.js";
import type { Opportunity, Outreach } from "../../src/domain/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("outreach application services", () => {
  it("generates an outreach draft from opportunity details", () => {
    const draft = generateOutreachDraft(idealVueFreelanceLille);

    expect(draft.subject).toBe(`Mission ${idealVueFreelanceLille.title}`);
    expect(draft.message).toContain(idealVueFreelanceLille.title);
    expect(draft.message).toContain("Vue.js");
    expect(draft.message).toContain("TypeScript");
    expect(draft.message).toContain("frontend senior");
    expect(draft.message).toContain("650-750 EUR");
  });

  it("adds clarification questions when information is missing", () => {
    const draft = generateOutreachDraft({
      ...idealVueFreelanceLille,
      rateMin: undefined,
      rateMax: undefined,
      missingInformation: ["rate", "location policy", "client/company context"]
    });

    expect(draft.message).toContain("quelle est la fourchette de TJM prévue ?");
    expect(draft.message).toContain("quel est le rythme remote/hybride attendu ?");
    expect(draft.message).toContain("quel est le contexte client");
  });

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

  it("saves edited subject and message when provided", () => {
    const saved: Outreach[] = [];
    const result = createOutreachDraft(
      {
        opportunityId: idealVueFreelanceLille.id,
        subject: "Custom subject",
        message: "Custom edited message",
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
      subject: "Custom subject",
      message: "Custom edited message"
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
