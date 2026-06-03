import { createCollectorResult } from "../../../collectors/index.js";
import type { CollectorResult, OpportunityCollector } from "../../../collectors/index.js";
import { parseRssFeed } from "./rssFeedParser.js";

export type RssFeedFetcher = (feedUrl: string) => Promise<string>;

export type CreateRssCollectorInput = {
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  collectorName?: string;
  fetchFeed?: RssFeedFetcher;
};

export function createRssCollector(input: CreateRssCollectorInput): OpportunityCollector {
  return {
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    name: input.collectorName ?? `${input.sourceId}-rss`,
    kind: "rss",
    collect: async ({ now }): Promise<CollectorResult> => {
      const collectorName = input.collectorName ?? `${input.sourceId}-rss`;

      try {
        const xml = await (input.fetchFeed ?? defaultFetchFeed)(input.feedUrl);
        const parsed = parseRssFeed({
          xml,
          sourceId: input.sourceId,
          sourceName: input.sourceName,
          feedUrl: input.feedUrl,
          collectedAt: now
        });

        return createCollectorResult({
          sourceId: input.sourceId,
          collectorName,
          collectedAt: now,
          rawOpportunities: parsed.rawOpportunities,
          warnings: parsed.warnings,
          errors: parsed.errors
        });
      } catch (error) {
        return createCollectorResult({
          sourceId: input.sourceId,
          collectorName,
          collectedAt: now,
          errors: [
            {
              code: "network-error",
              message: "RSS feed could not be fetched.",
              cause: error instanceof Error ? error.message : String(error)
            }
          ]
        });
      }
    }
  };
}

async function defaultFetchFeed(feedUrl: string): Promise<string> {
  const response = await fetch(feedUrl);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}
