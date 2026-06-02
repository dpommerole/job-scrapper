import type {
  ContractType,
  Opportunity,
  OpportunityClass,
  OpportunityStatus,
  RemotePolicy
} from "../../domain/index.js";

export type OpportunitySortKey = "score-desc" | "collected-desc" | "updated-desc" | "follow-up-asc";

export type OpportunityFilters = {
  status: OpportunityStatus | "all";
  opportunityClass: OpportunityClass | "all";
  source: string;
  remotePolicy: RemotePolicy | "all";
  contractType: ContractType | "all";
  minimumScore: number | undefined;
  search: string;
};

export type OpportunityListState = {
  filters: OpportunityFilters;
  sort: OpportunitySortKey;
};

type OpportunityWithFollowUp = Opportunity & {
  followUpAt?: string;
  followUpDate?: string;
};

export const defaultOpportunityListState: OpportunityListState = {
  filters: {
    status: "all",
    opportunityClass: "all",
    source: "all",
    remotePolicy: "all",
    contractType: "all",
    minimumScore: undefined,
    search: ""
  },
  sort: "collected-desc"
};

export function filterAndSortOpportunities(opportunities: Opportunity[], state: OpportunityListState): Opportunity[] {
  return sortOpportunities(opportunities.filter((opportunity) => matchesFilters(opportunity, state.filters)), state.sort);
}

export function getOpportunityFilterOptions(opportunities: Opportunity[]) {
  return {
    sources: uniqueSorted(opportunities.map((opportunity) => opportunity.source))
  };
}

export function countActiveFilters(filters: OpportunityFilters): number {
  return [
    filters.status !== "all",
    filters.opportunityClass !== "all",
    filters.source !== "all",
    filters.remotePolicy !== "all",
    filters.contractType !== "all",
    typeof filters.minimumScore === "number",
    filters.search.trim().length > 0
  ].filter(Boolean).length;
}

function matchesFilters(opportunity: Opportunity, filters: OpportunityFilters): boolean {
  if (filters.status !== "all" && opportunity.status !== filters.status) return false;
  if (filters.opportunityClass !== "all" && opportunity.opportunityClass !== filters.opportunityClass) return false;
  if (filters.source !== "all" && opportunity.source !== filters.source) return false;
  if (filters.remotePolicy !== "all" && opportunity.remotePolicy !== filters.remotePolicy) return false;
  if (filters.contractType !== "all" && opportunity.contractType !== filters.contractType) return false;
  if (typeof filters.minimumScore === "number" && (opportunity.score ?? 0) < filters.minimumScore) return false;
  if (!matchesSearch(opportunity, filters.search)) return false;

  return true;
}

function matchesSearch(opportunity: Opportunity, search: string): boolean {
  const terms = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return true;

  const searchableText = [
    opportunity.title,
    opportunity.company,
    opportunity.source,
    opportunity.location,
    opportunity.description,
    opportunity.requiredSkills.join(" "),
    opportunity.niceToHaveSkills.join(" ")
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return terms.every((term) => searchableText.includes(term));
}

function sortOpportunities(opportunities: Opportunity[], sort: OpportunitySortKey): Opportunity[] {
  return [...opportunities].sort((left, right) => {
    if (sort === "score-desc") return compareNumbers(right.score, left.score) || compareDates(right.collectedAt, left.collectedAt);
    if (sort === "updated-desc") return compareDates(right.updatedAt, left.updatedAt) || compareDates(right.collectedAt, left.collectedAt);
    if (sort === "follow-up-asc") {
      return compareDates(
        getFollowUpDate(left as OpportunityWithFollowUp),
        getFollowUpDate(right as OpportunityWithFollowUp)
      );
    }

    return compareDates(right.collectedAt, left.collectedAt);
  });
}

function compareNumbers(left: number | undefined, right: number | undefined): number {
  return (left ?? Number.NEGATIVE_INFINITY) - (right ?? Number.NEGATIVE_INFINITY);
}

function compareDates(left: string | undefined, right: string | undefined): number {
  return dateValue(left) - dateValue(right);
}

function dateValue(value: string | undefined): number {
  if (!value) return Number.NEGATIVE_INFINITY;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? Number.NEGATIVE_INFINITY : date.getTime();
}

function getFollowUpDate(opportunity: OpportunityWithFollowUp): string | undefined {
  return opportunity.followUpAt ?? opportunity.followUpDate;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
