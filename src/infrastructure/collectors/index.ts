export { createEmailAlertCollector, parseEmailAlert } from "./email/index.js";
export { createRssCollector, parseRssFeed } from "./rss/index.js";
export type {
  CreateEmailAlertCollectorInput,
  EmailAlertParseInput,
  EmailAlertParseResult
} from "./email/index.js";
export type {
  CreateRssCollectorInput,
  RssFeedFetcher,
  RssFeedParseInput,
  RssFeedParseResult
} from "./rss/index.js";
