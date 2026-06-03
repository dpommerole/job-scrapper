import type { RawCollectedOpportunity } from "../collectors/index.js";
import type { Opportunity } from "../domain/index.js";

export type InvalidRawCollectedOpportunity = {
  index: number;
  rawOpportunity: RawCollectedOpportunity;
  reasons: string[];
};

export type RawCollectedOpportunityNormalizationResult = {
  opportunities: Opportunity[];
  invalidRawOpportunities: InvalidRawCollectedOpportunity[];
};

export type NormalizeRawCollectedOpportunityOptions = {
  collectedAt: string;
};

export function normalizeValidRawCollectedOpportunities(
  rawOpportunities: RawCollectedOpportunity[],
  options: NormalizeRawCollectedOpportunityOptions
): RawCollectedOpportunityNormalizationResult {
  const opportunities: Opportunity[] = [];
  const invalidRawOpportunities: InvalidRawCollectedOpportunity[] = [];

  rawOpportunities.forEach((rawOpportunity, index) => {
    const reasons = validateRawCollectedOpportunity(rawOpportunity);

    if (reasons.length > 0) {
      invalidRawOpportunities.push({
        index,
        rawOpportunity,
        reasons
      });
      return;
    }

    opportunities.push(normalizeRawCollectedOpportunity(rawOpportunity, index, options));
  });

  return {
    opportunities,
    invalidRawOpportunities
  };
}

export function validateRawCollectedOpportunity(rawOpportunity: RawCollectedOpportunity): string[] {
  const reasons: string[] = [];

  if (!optional(rawOpportunity.title)) {
    reasons.push("Missing required field: title");
  }

  if (!optional(rawOpportunity.url)) {
    reasons.push("Missing required field: url");
  }

  return reasons;
}

function normalizeRawCollectedOpportunity(
  rawOpportunity: RawCollectedOpportunity,
  index: number,
  options: NormalizeRawCollectedOpportunityOptions
): Opportunity {
  const title = optional(rawOpportunity.title) ?? "Untitled opportunity";

  return {
    id: optional(rawOpportunity.id) ?? createRawOpportunityId(rawOpportunity, index, title),
    source: rawOpportunity.sourceName,
    sourceUrl: optional(rawOpportunity.url),
    title,
    company: optional(rawOpportunity.company),
    recruiterName: optional(rawOpportunity.recruiterName),
    recruiterCompany: optional(rawOpportunity.recruiterCompany),
    recruiterContactUrl: optional(rawOpportunity.recruiterContactUrl),
    location: optional(rawOpportunity.location),
    remotePolicy: normalizeRemotePolicy(rawOpportunity.remotePolicy),
    contractType: normalizeContractType(rawOpportunity.contractType),
    seniority: optional(rawOpportunity.seniority),
    duration: optional(rawOpportunity.duration),
    startDate: optional(rawOpportunity.startDate),
    rateMin: parseOptionalNumber(rawOpportunity.rateMin),
    rateMax: parseOptionalNumber(rawOpportunity.rateMax),
    currency: normalizeCurrency(rawOpportunity.currency),
    requiredSkills: rawOpportunity.requiredSkills ?? [],
    niceToHaveSkills: rawOpportunity.niceToHaveSkills ?? [],
    description: optional(rawOpportunity.description) ?? "",
    publishedAt: optional(rawOpportunity.publishedAt),
    collectedAt: options.collectedAt,
    status: "new"
  };
}

function createRawOpportunityId(rawOpportunity: RawCollectedOpportunity, index: number, title: string): string {
  const stableValue = optional(rawOpportunity.url) ?? title;
  const slug = normalize(`${rawOpportunity.sourceId}-${stableValue}`).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `collected-${index + 1}${slug ? `-${slug}` : ""}`;
}

function normalizeRemotePolicy(value: string | undefined): Opportunity["remotePolicy"] {
  const normalized = normalize(value);
  if (normalized === "remote" || normalized === "full remote" || normalized === "france remote") return "remote";
  if (normalized === "hybrid" || normalized === "hybride") return "hybrid";
  if (normalized === "onsite" || normalized === "on site" || normalized === "sur site") return "onsite";
  return "unknown";
}

function normalizeContractType(value: string | undefined): Opportunity["contractType"] {
  const normalized = normalize(value);
  if (normalized === "freelance" || normalized === "independant" || normalized === "independent") return "freelance";
  if (normalized === "cdi") return "cdi";
  if (normalized === "cdd") return "cdd";
  if (normalized === "internship" || normalized === "stage") return "internship";
  return "unknown";
}

function normalizeCurrency(value: string | undefined): "EUR" | undefined {
  const normalized = normalize(value);
  if (normalized === "eur" || normalized === "euro" || normalized === "euros") return "EUR";
  return undefined;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const match = value.replace(/\s/g, "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}
