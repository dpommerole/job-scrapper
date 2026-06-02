import { describe, expect, it } from "vitest";
import type { Opportunity } from "../../src/domain/index.js";
import {
  defaultOpportunityListState,
  filterAndSortOpportunities,
  getOpportunityFilterOptions
} from "../../src/ui/view-models/opportunityFilters.js";
import { idealVueFreelanceLille, reactRemoteFreelance, vagueOpportunity } from "../scoring/fixtures.js";

const opportunities: Opportunity[] = [
  {
    ...idealVueFreelanceLille,
    id: "vue",
    source: "Malt",
    status: "interesting",
    score: 91,
    opportunityClass: "hot",
    collectedAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-03T10:00:00.000Z"
  },
  {
    ...reactRemoteFreelance,
    id: "react",
    source: "LeHibou",
    status: "new",
    score: 72,
    opportunityClass: "interesting",
    collectedAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z"
  },
  {
    ...vagueOpportunity,
    id: "weak",
    source: "Manual",
    status: "archived",
    remotePolicy: "onsite",
    contractType: "cdi",
    score: 24,
    opportunityClass: "reject",
    collectedAt: "2026-05-30T10:00:00.000Z"
  }
];

describe("opportunity filters", () => {
  it("filters by status", () => {
    const result = filterAndSortOpportunities(opportunities, {
      ...defaultOpportunityListState,
      filters: { ...defaultOpportunityListState.filters, status: "interesting" }
    });

    expect(result.map((opportunity) => opportunity.id)).toEqual(["vue"]);
  });

  it("filters by class, source and remote policy", () => {
    const result = filterAndSortOpportunities(opportunities, {
      ...defaultOpportunityListState,
      filters: {
        ...defaultOpportunityListState.filters,
        opportunityClass: "interesting",
        source: "LeHibou",
        remotePolicy: "remote"
      }
    });

    expect(result.map((opportunity) => opportunity.id)).toEqual(["react"]);
  });

  it("filters by contract type, minimum score and text search", () => {
    const result = filterAndSortOpportunities(opportunities, {
      ...defaultOpportunityListState,
      filters: {
        ...defaultOpportunityListState.filters,
        contractType: "freelance",
        minimumScore: 80,
        search: "vue lille"
      }
    });

    expect(result.map((opportunity) => opportunity.id)).toEqual(["vue"]);
  });

  it("sorts by score descending", () => {
    const result = filterAndSortOpportunities(opportunities, {
      ...defaultOpportunityListState,
      sort: "score-desc"
    });

    expect(result.map((opportunity) => opportunity.id)).toEqual(["vue", "react", "weak"]);
  });

  it("sorts by collected date descending", () => {
    const result = filterAndSortOpportunities(opportunities, {
      ...defaultOpportunityListState,
      sort: "collected-desc"
    });

    expect(result.map((opportunity) => opportunity.id)).toEqual(["react", "vue", "weak"]);
  });

  it("builds unique source options", () => {
    expect(getOpportunityFilterOptions(opportunities).sources).toEqual(["LeHibou", "Malt", "Manual"]);
  });
});
