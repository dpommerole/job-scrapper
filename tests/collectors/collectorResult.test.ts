import { describe, expect, it } from "vitest";
import {
  createCollectorResult,
  createEmptyCollectorResult,
  inferCollectorStatus,
  summarizeCollectorResult
} from "../../src/collectors/index.js";
import type { RawCollectedOpportunity } from "../../src/collectors/index.js";

const collectedAt = "2026-06-03T08:00:00.000Z";

describe("collector result helpers", () => {
  it("creates an empty collector result", () => {
    const result = createEmptyCollectorResult({
      sourceId: "malt",
      collectorName: "malt-rss",
      collectedAt
    });

    expect(result).toEqual({
      sourceId: "malt",
      collectorName: "malt-rss",
      status: "success",
      collectedAt,
      rawOpportunities: [],
      warnings: [],
      errors: []
    });
  });

  it("summarizes warnings and errors without hiding partial results", () => {
    const rawOpportunity: RawCollectedOpportunity = {
      sourceId: "free-work",
      sourceName: "Free-Work",
      title: "Senior frontend architect",
      collectedAt
    };

    const result = createCollectorResult({
      sourceId: "free-work",
      collectorName: "free-work-rss",
      collectedAt,
      rawOpportunities: [rawOpportunity],
      warnings: [
        {
          code: "missing-field",
          message: "Company is missing.",
          field: "company"
        }
      ],
      errors: [
        {
          code: "parse-error",
          message: "One item could not be parsed."
        }
      ]
    });

    expect(result.status).toBe("partial");
    expect(summarizeCollectorResult(result)).toEqual({
      sourceId: "free-work",
      collectorName: "free-work-rss",
      status: "partial",
      collectedCount: 1,
      warningCount: 1,
      errorCount: 1
    });
  });

  it("infers failed status when errors prevent all collection", () => {
    expect(inferCollectorStatus(0, 1)).toBe("failed");
  });
});
