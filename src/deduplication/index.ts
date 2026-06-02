import type { Opportunity } from "../domain/index.js";

export type DuplicateMatchReason =
  | "same-source-url"
  | "same-title-company-location"
  | "same-title-recruiter-location";

export type DuplicateMatch = {
  duplicateId: string;
  originalId: string;
  reason: DuplicateMatchReason;
};

export type DeduplicationResult = {
  opportunities: Opportunity[];
  duplicates: DuplicateMatch[];
};

export function deduplicateOpportunities(opportunities: Opportunity[]): DeduplicationResult {
  const uniqueOpportunities: Opportunity[] = [];
  const duplicates: DuplicateMatch[] = [];

  for (const opportunity of opportunities) {
    const duplicate = findDuplicateOpportunity(opportunity, uniqueOpportunities);

    if (duplicate) {
      duplicates.push({
        duplicateId: opportunity.id,
        originalId: duplicate.original.id,
        reason: duplicate.reason
      });
    } else {
      uniqueOpportunities.push(opportunity);
    }
  }

  return {
    opportunities: uniqueOpportunities,
    duplicates
  };
}

export function findDuplicateOpportunity(
  opportunity: Opportunity,
  candidates: Opportunity[]
): { original: Opportunity; reason: DuplicateMatchReason } | undefined {
  for (const candidate of candidates) {
    const reason = getDuplicateReason(opportunity, candidate);
    if (reason) return { original: candidate, reason };
  }

  return undefined;
}

export function getDuplicateReason(
  left: Opportunity,
  right: Opportunity
): DuplicateMatchReason | undefined {
  if (canonicalSourceUrl(left.sourceUrl) && canonicalSourceUrl(left.sourceUrl) === canonicalSourceUrl(right.sourceUrl)) {
    return "same-source-url";
  }

  if (
    normalized(left.title) === normalized(right.title) &&
    normalized(left.company) &&
    normalized(left.company) === normalized(right.company) &&
    normalized(left.location) === normalized(right.location)
  ) {
    return "same-title-company-location";
  }

  if (
    normalized(left.title) === normalized(right.title) &&
    normalized(left.recruiterCompany) &&
    normalized(left.recruiterCompany) === normalized(right.recruiterCompany) &&
    normalized(left.location) === normalized(right.location)
  ) {
    return "same-title-recruiter-location";
  }

  return undefined;
}

export function canonicalSourceUrl(sourceUrl?: string): string | undefined {
  if (!sourceUrl) return undefined;

  try {
    const url = new URL(sourceUrl);
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid"
    ];

    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }

    url.hash = "";
    url.hostname = url.hostname.toLowerCase();

    const query = url.searchParams.toString();
    const pathname = url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;

    return `${url.protocol}//${url.hostname}${pathname}${query ? `?${query}` : ""}`;
  } catch {
    return normalized(sourceUrl);
  }
}

function normalized(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}
