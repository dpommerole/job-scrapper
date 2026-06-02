import { useState } from "react";
import type { Opportunity } from "../../domain/index.js";
import { OpportunityList } from "../components/opportunities/OpportunityList.js";
import { OpportunityListControls } from "../components/opportunities/OpportunityListControls.js";
import {
  defaultOpportunityListState,
  filterAndSortOpportunities,
  getOpportunityFilterOptions
} from "../view-models/opportunityFilters.js";
import { createOpportunityListViewModel } from "../view-models/opportunityListViewModel.js";

export type OpportunitiesPageProps = {
  opportunities: Opportunity[];
};

export function OpportunitiesPage({ opportunities }: OpportunitiesPageProps) {
  const [listState, setListState] = useState(defaultOpportunityListState);
  const filteredOpportunities = filterAndSortOpportunities(opportunities, listState);
  const filterOptions = getOpportunityFilterOptions(opportunities);
  const viewModel = createOpportunityListViewModel(filteredOpportunities);
  const hasFilters = filteredOpportunities.length !== opportunities.length;

  return (
    <section className="page-section page-section-wide">
      <header className="page-heading">
        <p className="eyebrow">Review and triage</p>
        <h1>Opportunities</h1>
      </header>
      <OpportunityListControls
        state={listState}
        sources={filterOptions.sources}
        resultCount={filteredOpportunities.length}
        totalCount={opportunities.length}
        onChange={setListState}
      />
      <OpportunityList
        opportunities={viewModel}
        emptyTitle={hasFilters ? "No matching opportunities" : "No opportunities yet"}
        emptyDescription={
          hasFilters
            ? "Adjust filters or reset them to see more opportunities."
            : "Imported or manually added opportunities will appear here once they are available."
        }
      />
    </section>
  );
}
