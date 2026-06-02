import type { ContractType, Opportunity, RemotePolicy } from "../../domain/index.js";
import { scoreOpportunity } from "../../scoring/index.js";
import type { OpportunityRepository } from "../../storage/index.js";

export type CreateManualOpportunityInput = {
  source?: string;
  sourceUrl?: string;
  title?: string;
  company?: string;
  recruiterName?: string;
  recruiterCompany?: string;
  location?: string;
  remotePolicy?: RemotePolicy;
  contractType?: ContractType;
  seniority?: string;
  duration?: string;
  startDate?: string;
  rateMin?: string | number;
  rateMax?: string | number;
  requiredSkills?: string;
  niceToHaveSkills?: string;
  description?: string;
  notes?: string;
  now?: string;
};

export type CreateManualOpportunityDependencies = {
  opportunityRepository: Pick<OpportunityRepository, "save">;
};

export type CreateManualOpportunityResult =
  | {
      status: "created";
      opportunity: Opportunity;
    }
  | {
      status: "invalid";
      errors: string[];
    };

export function createManualOpportunity(
  input: CreateManualOpportunityInput,
  dependencies: CreateManualOpportunityDependencies
): CreateManualOpportunityResult {
  const errors = validateManualOpportunity(input);
  if (errors.length > 0) {
    return {
      status: "invalid",
      errors
    };
  }

  const now = input.now ?? new Date().toISOString();
  const rateMin = parseOptionalNumber(input.rateMin);
  const rateMax = parseOptionalNumber(input.rateMax);
  const opportunity: Opportunity = {
    id: createManualOpportunityId(now, input.title ?? ""),
    source: required(input.source),
    sourceUrl: optional(input.sourceUrl),
    title: required(input.title),
    company: optional(input.company),
    recruiterName: optional(input.recruiterName),
    recruiterCompany: optional(input.recruiterCompany),
    location: optional(input.location),
    remotePolicy: input.remotePolicy ?? "unknown",
    contractType: input.contractType ?? "unknown",
    seniority: optional(input.seniority),
    duration: optional(input.duration),
    startDate: optional(input.startDate),
    rateMin,
    rateMax,
    currency: rateMin !== undefined || rateMax !== undefined ? "EUR" : undefined,
    requiredSkills: splitSkills(input.requiredSkills),
    niceToHaveSkills: splitSkills(input.niceToHaveSkills),
    description: required(input.description),
    collectedAt: now,
    status: "new",
    notes: optional(input.notes)
  };
  const scoringResult = scoreOpportunity(opportunity);
  const scoredOpportunity: Opportunity = {
    ...opportunity,
    score: scoringResult.score,
    opportunityClass: scoringResult.opportunityClass,
    positiveSignals: scoringResult.positiveSignals,
    negativeSignals: scoringResult.negativeSignals,
    missingInformation: scoringResult.missingInformation
  };

  dependencies.opportunityRepository.save(scoredOpportunity);

  return {
    status: "created",
    opportunity: scoredOpportunity
  };
}

function validateManualOpportunity(input: CreateManualOpportunityInput): string[] {
  const errors: string[] = [];

  if (!optional(input.source)) errors.push("Missing required field: source");
  if (!optional(input.title)) errors.push("Missing required field: title");
  if (!optional(input.description)) errors.push("Missing required field: description");
  if (input.rateMin !== undefined && input.rateMin !== "" && parseOptionalNumber(input.rateMin) === undefined) {
    errors.push("Invalid rateMin");
  }
  if (input.rateMax !== undefined && input.rateMax !== "" && parseOptionalNumber(input.rateMax) === undefined) {
    errors.push("Invalid rateMax");
  }

  return errors;
}

function splitSkills(value: string | undefined): string[] {
  return (value ?? "")
    .split(/[;\n,]/)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string | number | undefined): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;

  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createManualOpportunityId(now: string, title: string): string {
  const slug = normalize(title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const timestamp = now.replace(/[^0-9]/g, "");
  return `manual-${timestamp}${slug ? `-${slug}` : ""}`;
}

function required(value: string | undefined): string {
  return optional(value) ?? "";
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
