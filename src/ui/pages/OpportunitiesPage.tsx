import type { Opportunity } from "../../domain/index.js";
import { OpportunityList } from "../components/opportunities/OpportunityList.js";
import { createOpportunityListViewModel } from "../view-models/opportunityListViewModel.js";

export type OpportunitiesPageProps = {
  opportunities: Opportunity[];
};

export function OpportunitiesPage({ opportunities }: OpportunitiesPageProps) {
  const viewModel = createOpportunityListViewModel(opportunities);

  return (
    <section className="page-section page-section-wide">
      <header className="page-heading">
        <p className="eyebrow">Review and triage</p>
        <h1>Opportunities</h1>
      </header>
      <OpportunityList opportunities={viewModel} />
    </section>
  );
}
