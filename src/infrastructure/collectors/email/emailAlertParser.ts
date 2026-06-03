import type { CollectorWarning, RawCollectedOpportunity } from "../../../collectors/index.js";

export type EmailAlertParseInput = {
  content: string;
  sourceId: string;
  sourceName: string;
  sourceUrl?: string;
  collectedAt: string;
};

export type EmailAlertParseResult = {
  rawOpportunities: RawCollectedOpportunity[];
  warnings: CollectorWarning[];
};

type ParsedEmailMetadata = {
  subject?: string;
  from?: string;
  body: string;
};

const fieldAliases: Record<string, string> = {
  job: "title",
  mission: "title",
  poste: "title",
  title: "title",
  client: "company",
  company: "company",
  entreprise: "company",
  contract: "contractType",
  "contract type": "contractType",
  contrat: "contractType",
  description: "description",
  link: "url",
  location: "location",
  lieu: "location",
  published: "publishedAt",
  "published at": "publishedAt",
  source: "sourceName",
  skills: "skills",
  "required skills": "skills",
  competences: "skills",
  url: "url"
};

export function parseEmailAlert(input: EmailAlertParseInput): EmailAlertParseResult {
  const email = parseEmailMetadata(input.content);
  const blocks = splitOpportunityBlocks(email.body);
  const warnings: CollectorWarning[] = [];
  const rawOpportunities = blocks.flatMap((block, blockIndex) => {
    const parsedBlock = parseOpportunityBlock(block, blockIndex, input, email);
    if (!parsedBlock) return [];

    if (!parsedBlock.title) {
      warnings.push({
        code: "missing-field",
        message: "Email alert opportunity is missing a title.",
        itemId: parsedBlock.url,
        field: "title"
      });
    }

    if (!parsedBlock.url) {
      warnings.push({
        code: "missing-field",
        message: "Email alert opportunity is missing a link.",
        itemId: parsedBlock.title,
        field: "url"
      });
    }

    return [parsedBlock];
  });

  if (rawOpportunities.length === 0 && input.content.trim().length > 0) {
    warnings.push({
      code: "parse-warning",
      message: "No opportunities were detected in the email alert content."
    });
  }

  return {
    rawOpportunities,
    warnings
  };
}

function parseEmailMetadata(content: string): ParsedEmailMetadata {
  const normalized = normalizeEmailText(content);
  const headerMatch = normalized.match(/^([\s\S]*?)\n\s*\n([\s\S]*)$/);
  const headerText = headerMatch?.[1] ?? "";
  const body = headerMatch && looksLikeEmailHeaders(headerText) ? headerMatch[2] : normalized;

  return {
    subject: readHeaderValue(headerText, "Subject"),
    from: readHeaderValue(headerText, "From"),
    body
  };
}

function normalizeEmailText(content: string): string {
  return content.replace(/\r\n?/g, "\n").replace(/=\n/g, "").trim();
}

function looksLikeEmailHeaders(text: string): boolean {
  return /^(From|Subject|Date|To):\s+/im.test(text);
}

function readHeaderValue(headers: string, name: string): string | undefined {
  const match = headers.match(new RegExp(`^${name}:\\s*(.+)$`, "im"));
  return match?.[1]?.trim();
}

function splitOpportunityBlocks(body: string): string[] {
  return body
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function parseOpportunityBlock(
  block: string,
  blockIndex: number,
  input: EmailAlertParseInput,
  email: ParsedEmailMetadata
): RawCollectedOpportunity | undefined {
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const fields = parseFieldLines(lines);
  const links = extractLinks(block);
  const url = readField(fields, "url") ?? links[0];
  const title = readField(fields, "title") ?? inferTitle(lines, url);
  const description = readField(fields, "description") ?? inferDescription(lines);
  const skills = splitList(readField(fields, "skills"));

  if (!isOpportunityCandidate({ fields, links, title, description, skills })) {
    return undefined;
  }

  return {
    sourceId: input.sourceId,
    sourceName: readField(fields, "sourceName") ?? input.sourceName,
    sourceUrl: input.sourceUrl ?? url,
    title,
    company: readField(fields, "company"),
    location: readField(fields, "location"),
    contractType: readField(fields, "contractType"),
    requiredSkills: skills,
    description,
    publishedAt: readField(fields, "publishedAt"),
    collectedAt: input.collectedAt,
    url,
    raw: {
      emailSubject: email.subject,
      emailFrom: email.from,
      blockIndex,
      links,
      content: block
    }
  };
}

function parseFieldLines(lines: string[]): Map<string, string> {
  const fields = new Map<string, string>();

  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z -]{1,32}):\s*(.+)$/);
    if (!match) continue;

    const canonicalName = fieldAliases[match[1].trim().toLowerCase()];
    if (!canonicalName) continue;

    fields.set(canonicalName, match[2].trim());
  }

  return fields;
}

function readField(fields: Map<string, string>, name: string): string | undefined {
  const value = fields.get(name)?.trim();
  return value ? value : undefined;
}

function inferTitle(lines: string[], url: string | undefined): string | undefined {
  if (!url) return undefined;

  const firstContentLine = lines.find((line) => !isFieldLine(line) && !extractLinks(line).includes(line));
  return firstContentLine && !looksLikeGenericEmailLine(firstContentLine) ? firstContentLine : undefined;
}

function inferDescription(lines: string[]): string | undefined {
  const descriptionLines = lines.filter((line) => !isFieldLine(line) && extractLinks(line).length === 0 && !looksLikeGenericEmailLine(line));
  const description = descriptionLines.slice(1).join(" ").trim();
  return description.length > 0 ? description : undefined;
}

function isFieldLine(line: string): boolean {
  const match = line.match(/^([A-Za-z][A-Za-z -]{1,32}):\s*(.+)$/);
  return Boolean(match && fieldAliases[match[1].trim().toLowerCase()]);
}

function looksLikeGenericEmailLine(line: string): boolean {
  return /^(hello|bonjour|hi|view all|unsubscribe|manage alerts|you received)/i.test(line);
}

function isOpportunityCandidate(input: {
  fields: Map<string, string>;
  links: string[];
  title: string | undefined;
  description: string | undefined;
  skills: string[];
}): boolean {
  if (input.fields.has("title") || input.title) return true;
  if (input.links.length === 0) return false;

  return Boolean(input.description || input.skills.length > 0 || input.fields.has("company") || input.fields.has("location"));
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function extractLinks(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>"']+/g) ?? [];

  return matches.map((link) => link.replace(/[),.;]+$/g, ""));
}
