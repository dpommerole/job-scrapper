import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { collectOpportunities } from "../../src/application/index.js";
import { createRssCollector, parseRssFeed } from "../../src/infrastructure/index.js";

const collectedAt = "2026-06-03T12:00:00.000Z";
const feedUrl = "https://rss.example/jobs.xml";

function fixturePath(name: string): URL {
  return new URL(`../../data/rss/${name}`, import.meta.url);
}

function readFixture(name: string): string {
  return readFileSync(fixturePath(name), "utf8");
}

describe("RSS collector", () => {
  it("parses a valid RSS fixture into raw collected opportunities", () => {
    const result = parseRssFeed({
      xml: readFixture("valid-feed.xml"),
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      collectedAt
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.rawOpportunities).toEqual([
      expect.objectContaining({
        id: "rss-vue-lille",
        sourceId: "rss-source",
        sourceName: "RSS Source",
        sourceUrl: feedUrl,
        title: "Lead Frontend Vue TypeScript",
        description: "Architecture frontend mission with Vue 3 and TypeScript.",
        publishedAt: "Tue, 02 Jun 2026 10:00:00 GMT",
        collectedAt,
        url: "https://rss.example/jobs/vue-lille"
      }),
      expect.objectContaining({
        id: "rss-design-system",
        title: "Design System Frontend Lead",
        url: "https://rss.example/jobs/design-system"
      })
    ]);
    expect(result.rawOpportunities[0].raw).toMatchObject({
      feedUrl,
      guid: "rss-vue-lille",
      itemIndex: 0
    });
  });

  it("handles an empty RSS feed with a warning", () => {
    const result = parseRssFeed({
      xml: readFixture("empty-feed.xml"),
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([
      {
        code: "partial-result",
        message: "RSS feed contains no items."
      }
    ]);
  });

  it("keeps an item with a missing title and returns a warning", () => {
    const result = parseRssFeed({
      xml: readFixture("missing-title.xml"),
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([
      expect.objectContaining({
        id: "rss-missing-title",
        title: undefined,
        url: "https://rss.example/jobs/missing-title"
      })
    ]);
    expect(result.warnings).toEqual([
      {
        code: "missing-field",
        message: "RSS item is missing a title.",
        itemId: "rss-missing-title",
        field: "title"
      }
    ]);
  });

  it("keeps an item with a missing link and returns a warning", () => {
    const result = parseRssFeed({
      xml: readFixture("missing-link.xml"),
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([
      expect.objectContaining({
        id: "rss-missing-link",
        title: "Senior Frontend Architect",
        url: undefined
      })
    ]);
    expect(result.warnings).toEqual([
      {
        code: "missing-field",
        message: "RSS item is missing a link.",
        itemId: "rss-missing-link",
        field: "link"
      }
    ]);
  });

  it("handles invalid XML gracefully", () => {
    const result = parseRssFeed({
      xml: readFixture("invalid-feed.xml"),
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.errors).toEqual([
      {
        code: "parse-error",
        message: "RSS feed XML could not be parsed."
      }
    ]);
  });

  it("runs as a collector with an injected feed fetcher", async () => {
    const collector = createRssCollector({
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      fetchFeed: async () => readFixture("valid-feed.xml")
    });

    const result = await collectOpportunities({ collector, now: collectedAt });

    expect(result).toMatchObject({
      sourceId: "rss-source",
      collectorName: "rss-source-rss",
      status: "success",
      collectedAt
    });
    expect(result.rawOpportunities).toHaveLength(2);
  });

  it("returns a failed collector result when the feed fetcher fails", async () => {
    const collector = createRssCollector({
      sourceId: "rss-source",
      sourceName: "RSS Source",
      feedUrl,
      fetchFeed: async () => {
        throw new Error("Network unavailable");
      }
    });

    const result = await collectOpportunities({ collector, now: collectedAt });

    expect(result).toEqual({
      sourceId: "rss-source",
      collectorName: "rss-source-rss",
      status: "failed",
      collectedAt,
      rawOpportunities: [],
      warnings: [],
      errors: [
        {
          code: "network-error",
          message: "RSS feed could not be fetched.",
          cause: "Network unavailable"
        }
      ]
    });
  });
});
