import { describe, expect, it } from "vitest";
import { createManualOpportunity } from "../../src/application/index.js";

describe("createManualOpportunity", () => {
  it("validates required fields", () => {
    const result = createManualOpportunity(
      {
        source: "",
        title: "",
        description: ""
      },
      {
        opportunityRepository: {
          save: (opportunity) => opportunity
        }
      }
    );

    expect(result).toEqual({
      status: "invalid",
      errors: [
        "Missing required field: source",
        "Missing required field: title",
        "Missing required field: description"
      ]
    });
  });

  it("normalizes skills, scores and saves a manual opportunity", () => {
    const savedIds: string[] = [];
    const result = createManualOpportunity(
      {
        source: "Manual lead",
        sourceUrl: "https://example.com/manual",
        title: "Lead Frontend Vue TypeScript",
        company: "Client final",
        location: "Lille",
        remotePolicy: "hybrid",
        contractType: "freelance",
        rateMin: "650",
        rateMax: "750",
        requiredSkills: "Vue.js; TypeScript\nVitest",
        niceToHaveSkills: "Design system, Accessibility",
        description:
          "Mission senior frontend avec architecture Vue, TypeScript, testing strategy et design system.",
        notes: "Manual creation test",
        now: "2026-06-02T12:00:00.000Z"
      },
      {
        opportunityRepository: {
          save: (opportunity) => {
            savedIds.push(opportunity.id);
            return opportunity;
          }
        }
      }
    );

    expect(result.status).toBe("created");
    if (result.status !== "created") return;

    expect(savedIds).toEqual([result.opportunity.id]);
    expect(result.opportunity.id).toBe("manual-20260602120000000-lead-frontend-vue-typescript");
    expect(result.opportunity.requiredSkills).toEqual(["Vue.js", "TypeScript", "Vitest"]);
    expect(result.opportunity.niceToHaveSkills).toEqual(["Design system", "Accessibility"]);
    expect(result.opportunity.score).toBeGreaterThan(0);
    expect(result.opportunity.opportunityClass).toBeDefined();
    expect(result.opportunity.status).toBe("new");
  });
});
