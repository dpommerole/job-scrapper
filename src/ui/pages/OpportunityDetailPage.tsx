import type { Opportunity } from "../../domain/index.js";
import { OpportunityDetail } from "../components/opportunities/OpportunityDetail.js";
import { createOpportunityDetailViewModel } from "../view-models/opportunityDetailViewModel.js";

export type OpportunityDetailPageProps = {
  opportunity: Opportunity | undefined;
};

export function OpportunityDetailPage({ opportunity }: OpportunityDetailPageProps) {
  if (!opportunity) {
    return (
      <section className="page-section">
        <div className="page-heading">
          <p className="eyebrow">Opportunity detail</p>
          <h1>Opportunity not found</h1>
        </div>
        <div className="empty-state">
          <h2>No matching opportunity</h2>
          <p>This opportunity may have been removed, archived elsewhere, or not loaded yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section page-section-wide">
      <OpportunityDetail opportunity={createOpportunityDetailViewModel(opportunity)} />
    </section>
  );
}

