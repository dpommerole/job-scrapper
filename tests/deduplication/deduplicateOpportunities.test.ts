import { describe, expect, it } from "vitest";
import {
  canonicalSourceUrl,
  deduplicateOpportunities,
  getDuplicateReason
} from "../../src/deduplication/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";
import type { Opportunity } from "../../src/domain/index.js";

function opportunity(overrides: Partial<Opportunity>): Opportunity {
  return {
    ...idealVueFreelanceLille,
    id: "test-opportunity",
    source: "Fixture",
    sourceUrl: undefined,
    company: undefined,
    recruiterCompany: undefined,
    location: "Paris, France",
    ...overrides
  };
}

describe("canonicalSourceUrl", () => {
  it("removes tracking params, hash and trailing slash", () => {
    expect(
      canonicalSourceUrl("https://Example.com/jobs/123/?utm_source=newsletter&utm_medium=email&foo=bar#details")
    ).toBe("https://example.com/jobs/123?foo=bar");
  });
});

describe("getDuplicateReason", () => {
  it("matches duplicate opportunities by canonical source URL", () => {
    const left = opportunity({
      id: "left",
      sourceUrl: "https://example.com/jobs/123?utm_source=email"
    });
    const right = opportunity({
      id: "right",
      sourceUrl: "https://example.com/jobs/123"
    });

    expect(getDuplicateReason(left, right)).toBe("same-source-url");
  });

  it("matches duplicate opportunities by title, company and location", () => {
    const left = opportunity({
      id: "left",
      title: "Lead Frontend Vue TypeScript",
      company: "Acme",
      location: "Lille, France"
    });
    const right = opportunity({
      id: "right",
      title: "Lead frontend Vue TypeScript",
      company: "ACME",
      location: "Lille France"
    });

    expect(getDuplicateReason(left, right)).toBe("same-title-company-location");
  });

  it("does not match same title for different companies", () => {
    const left = opportunity({
      id: "left",
      title: "Lead Frontend Vue TypeScript",
      company: "Acme",
      location: "Lille, France"
    });
    const right = opportunity({
      id: "right",
      title: "Lead Frontend Vue TypeScript",
      company: "Globex",
      location: "Lille, France"
    });

    expect(getDuplicateReason(left, right)).toBeUndefined();
  });
});

describe("deduplicateOpportunities", () => {
  it("keeps the first opportunity and reports later duplicates", () => {
    const result = deduplicateOpportunities([
      opportunity({
        id: "original",
        sourceUrl: "https://example.com/jobs/123"
      }),
      opportunity({
        id: "duplicate",
        sourceUrl: "https://example.com/jobs/123?utm_campaign=alert"
      }),
      opportunity({
        id: "other",
        sourceUrl: "https://example.com/jobs/456"
      })
    ]);

    expect(result.opportunities.map((item) => item.id)).toEqual(["original", "other"]);
    expect(result.duplicates).toEqual([
      {
        duplicateId: "duplicate",
        originalId: "original",
        reason: "same-source-url"
      }
    ]);
  });
});
