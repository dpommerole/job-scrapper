import type { Opportunity, OpportunityStatus } from "../../domain/index.js";
import {
  formatContractType,
  formatOpportunityClass,
  formatOpportunityScore,
  formatOpportunityStatus,
  formatRemotePolicy
} from "../formatters/opportunityFormatters.js";

export type OpportunityDetailViewModel = {
  id: string;
  title: string;
  description: string;
  company: string;
  source: string;
  sourceUrl: string | undefined;
  recruiter: string;
  location: string;
  remotePolicy: string;
  contractType: string;
  duration: string;
  startDate: string;
  rateRange: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  score: string;
  opportunityClass: string;
  status: string;
  statusValue: OpportunityStatus;
  positiveSignals: string[];
  negativeSignals: string[];
  missingInformation: string[];
  notes: string;
};

export function createOpportunityDetailViewModel(opportunity: Opportunity): OpportunityDetailViewModel {
  return {
    id: opportunity.id,
    title: opportunity.title,
    description: opportunity.description || "No description provided.",
    company: opportunity.company ?? "Unknown company",
    source: opportunity.source,
    sourceUrl: opportunity.sourceUrl,
    recruiter: formatRecruiter(opportunity),
    location: opportunity.location ?? "Unknown location",
    remotePolicy: formatRemotePolicy(opportunity.remotePolicy),
    contractType: formatContractType(opportunity.contractType),
    duration: opportunity.duration ?? "Unknown duration",
    startDate: opportunity.startDate ?? "Unknown start date",
    rateRange: formatRateRange(opportunity),
    requiredSkills: opportunity.requiredSkills,
    niceToHaveSkills: opportunity.niceToHaveSkills,
    score: formatOpportunityScore(opportunity.score),
    opportunityClass: formatOpportunityClass(opportunity.opportunityClass),
    status: formatOpportunityStatus(opportunity.status),
    statusValue: opportunity.status,
    positiveSignals: opportunity.positiveSignals ?? [],
    negativeSignals: opportunity.negativeSignals ?? [],
    missingInformation: opportunity.missingInformation ?? [],
    notes: opportunity.notes ?? "No notes yet."
  };
}

function formatRecruiter(opportunity: Opportunity): string {
  const parts = [opportunity.recruiterName, opportunity.recruiterCompany].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");

  return "No recruiter listed";
}

function formatRateRange(opportunity: Opportunity): string {
  const currency = opportunity.currency ?? "EUR";

  if (typeof opportunity.rateMin === "number" && typeof opportunity.rateMax === "number") {
    return `${opportunity.rateMin}-${opportunity.rateMax} ${currency}`;
  }

  if (typeof opportunity.rateMin === "number") return `From ${opportunity.rateMin} ${currency}`;
  if (typeof opportunity.rateMax === "number") return `Up to ${opportunity.rateMax} ${currency}`;

  return "Unknown rate";
}
