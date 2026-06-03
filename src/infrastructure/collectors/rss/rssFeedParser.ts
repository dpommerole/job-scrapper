import type { CollectorError, CollectorWarning, RawCollectedOpportunity } from "../../../collectors/index.js";

export type RssFeedParseInput = {
  xml: string;
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  collectedAt: string;
};

export type RssFeedParseResult = {
  rawOpportunities: RawCollectedOpportunity[];
  warnings: CollectorWarning[];
  errors: CollectorError[];
};

type ParsedRssItem = {
  title?: string;
  link?: string;
  description?: string;
  publishedAt?: string;
  guid?: string;
};

export function parseRssFeed(input: RssFeedParseInput): RssFeedParseResult {
  const xml = input.xml.trim();
  if (!xml) {
    return {
      rawOpportunities: [],
      warnings: [],
      errors: [
        {
          code: "parse-error",
          message: "RSS feed content is empty."
        }
      ]
    };
  }

  if (!looksLikeSupportedFeed(xml) || looksMalformed(xml)) {
    return {
      rawOpportunities: [],
      warnings: [],
      errors: [
        {
          code: "parse-error",
          message: "RSS feed XML could not be parsed."
        }
      ]
    };
  }

  const itemBlocks = extractElements(xml, "item");
  const warnings: CollectorWarning[] = [];

  if (itemBlocks.length === 0) {
    warnings.push({
      code: "partial-result",
      message: "RSS feed contains no items."
    });
  }

  const rawOpportunities = itemBlocks.map((itemBlock, index) => {
    const item = parseRssItem(itemBlock);
    const itemId = item.guid ?? item.link ?? `rss-item-${index + 1}`;

    if (!item.title) {
      warnings.push({
        code: "missing-field",
        message: "RSS item is missing a title.",
        itemId,
        field: "title"
      });
    }

    if (!item.link) {
      warnings.push({
        code: "missing-field",
        message: "RSS item is missing a link.",
        itemId,
        field: "link"
      });
    }

    return toRawCollectedOpportunity(item, input, index, itemBlock);
  });

  return {
    rawOpportunities,
    warnings,
    errors: []
  };
}

function parseRssItem(itemBlock: string): ParsedRssItem {
  return {
    title: readElementText(itemBlock, "title"),
    link: readElementText(itemBlock, "link"),
    description: readElementText(itemBlock, "description") ?? readElementText(itemBlock, "summary"),
    publishedAt: readElementText(itemBlock, "pubDate") ?? readElementText(itemBlock, "published") ?? readElementText(itemBlock, "updated"),
    guid: readElementText(itemBlock, "guid")
  };
}

function toRawCollectedOpportunity(
  item: ParsedRssItem,
  input: RssFeedParseInput,
  index: number,
  itemBlock: string
): RawCollectedOpportunity {
  return {
    id: item.guid,
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    sourceUrl: input.feedUrl,
    title: item.title,
    description: item.description,
    publishedAt: item.publishedAt,
    collectedAt: input.collectedAt,
    url: item.link,
    raw: {
      feedUrl: input.feedUrl,
      guid: item.guid,
      itemIndex: index,
      xml: itemBlock
    }
  };
}

function looksLikeSupportedFeed(xml: string): boolean {
  return /<rss[\s>]/i.test(xml) || /<rdf:RDF[\s>]/i.test(xml);
}

function looksMalformed(xml: string): boolean {
  const hasOpeningItem = /<item[\s>]/i.test(xml);
  const hasClosingItem = /<\/item>/i.test(xml);
  const hasOpeningChannel = /<channel[\s>]/i.test(xml);
  const hasClosingChannel = /<\/channel>/i.test(xml);

  return (hasOpeningItem && !hasClosingItem) || (hasOpeningChannel && !hasClosingChannel);
}

function extractElements(xml: string, elementName: string): string[] {
  const pattern = new RegExp(`<${elementName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${elementName}>`, "gi");
  const blocks: string[] = [];
  let match = pattern.exec(xml);

  while (match) {
    blocks.push(match[1]);
    match = pattern.exec(xml);
  }

  return blocks;
}

function readElementText(xml: string, elementName: string): string | undefined {
  const pattern = new RegExp(`<${elementName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${elementName}>`, "i");
  const match = xml.match(pattern);
  const value = match?.[1] ? cleanXmlText(match[1]) : undefined;

  return value && value.length > 0 ? value : undefined;
}

function cleanXmlText(value: string): string {
  return decodeXmlEntities(value)
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}
