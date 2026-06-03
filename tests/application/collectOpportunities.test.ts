import { describe, expect, it } from "vitest";
import { collectOpportunities } from "../../src/application/index.js";
import { createEmptyCollectorResult } from "../../src/collectors/index.js";
import type { OpportunityCollector } from "../../src/collectors/index.js";

const now = "2026-06-03T08:00:00.000Z";

describe("collectOpportunities", () => {
  it("returns an empty collector result", async () => {
    const collector: OpportunityCollector = {
      sourceId: "manual",
      sourceName: "Manual imports",
      name: "manual-empty",
      kind: "manual",
      collect: ({ now: collectedAt }) =>
        createEmptyCollectorResult({
          sourceId: "manual",
          collectorName: "manual-empty",
          collectedAt
        })
    };

    await expect(collectOpportunities({ collector, now })).resolves.toEqual({
      sourceId: "manual",
      collectorName: "manual-empty",
      status: "success",
      collectedAt: now,
      rawOpportunities: [],
      warnings: [],
      errors: []
    });
  });

  it("keeps collector warnings and errors in the returned result", async () => {
    const collector: OpportunityCollector = {
      sourceId: "rss-source",
      sourceName: "RSS Source",
      name: "rss-safe-collector",
      kind: "rss",
      collect: ({ now: collectedAt }) => ({
        sourceId: "rss-source",
        collectorName: "rss-safe-collector",
        status: "partial",
        collectedAt,
        rawOpportunities: [
          {
            sourceId: "rss-source",
            sourceName: "RSS Source",
            title: "Vue TypeScript lead",
            collectedAt
          }
        ],
        warnings: [
          {
            code: "missing-field",
            message: "Location is missing.",
            field: "location"
          }
        ],
        errors: [
          {
            code: "parse-error",
            message: "One RSS item could not be parsed."
          }
        ]
      })
    };

    const result = await collectOpportunities({ collector, now });

    expect(result.status).toBe("partial");
    expect(result.warnings).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });

  it("converts a thrown collector error into a failed collector result", async () => {
    const collector: OpportunityCollector = {
      sourceId: "api-source",
      sourceName: "API Source",
      name: "api-collector",
      kind: "api",
      collect: () => {
        throw new Error("Network unavailable");
      }
    };

    await expect(collectOpportunities({ collector, now })).resolves.toEqual({
      sourceId: "api-source",
      collectorName: "api-collector",
      status: "failed",
      collectedAt: now,
      rawOpportunities: [],
      warnings: [],
      errors: [
        {
          code: "unknown-error",
          message: "Collector failed before returning a result.",
          cause: "Network unavailable"
        }
      ]
    });
  });
});
