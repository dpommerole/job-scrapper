import type { Opportunity } from "../../domain/index.js";
import {
  formatCollectedDate,
  formatContractType,
  formatOpportunityClass,
  formatOpportunityScore,
  formatOpportunityStatus,
  formatRemotePolicy
} from "../formatters/opportunityFormatters.js";

export type OpportunityListItemViewModel = {
  id: string;
  detailPath: string;
  title: string;
  company: string;
  source: string;
  score: string;
  opportunityClass: string;
  status: string;
  location: string;
  remotePolicy: string;
  contractType: string;
  requiredSkills: string[];
  collectedAt: string;
};

export function createOpportunityListViewModel(opportunities: Opportunity[]): OpportunityListItemViewModel[] {
  return opportunities.map((opportunity) => ({
    id: opportunity.id,
    detailPath: `/opportunities/${encodeURIComponent(opportunity.id)}`,
    title: opportunity.title,
    company: opportunity.company ?? "Unknown company",
    source: opportunity.source,
    score: formatOpportunityScore(opportunity.score),
    opportunityClass: formatOpportunityClass(opportunity.opportunityClass),
    status: formatOpportunityStatus(opportunity.status),
    location: opportunity.location ?? "Unknown location",
    remotePolicy: formatRemotePolicy(opportunity.remotePolicy),
    contractType: formatContractType(opportunity.contractType),
    requiredSkills: opportunity.requiredSkills,
    collectedAt: formatCollectedDate(opportunity.collectedAt)
  }));
}
