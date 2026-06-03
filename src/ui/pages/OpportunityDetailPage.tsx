import type { Opportunity, OpportunityStatus, OutreachChannel } from "../../domain/index.js";
import { OutreachDraftHelper } from "../components/outreach/OutreachDraftHelper.js";
import { OpportunityDetail } from "../components/opportunities/OpportunityDetail.js";
import { createOpportunityDetailViewModel } from "../view-models/opportunityDetailViewModel.js";

export type OpportunityDetailPageProps = {
  opportunity: Opportunity | undefined;
  isSaving?: boolean;
  saveError?: string | undefined;
  onUpdateOpportunity?: (id: string, update: { status: OpportunityStatus; notes: string }) => void;
  isCreatingOutreach?: boolean;
  outreachCreateError?: string | undefined;
  onCreateOutreachDraft?: (input: {
    opportunityId: string;
    channel: OutreachChannel;
    subject: string;
    message: string;
  }) => void;
};

export function OpportunityDetailPage({
  opportunity,
  isSaving,
  saveError,
  onUpdateOpportunity,
  isCreatingOutreach,
  outreachCreateError,
  onCreateOutreachDraft
}: OpportunityDetailPageProps) {
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
      <OpportunityDetail
        opportunity={createOpportunityDetailViewModel(opportunity)}
        isSaving={isSaving}
        saveError={saveError}
        onUpdate={
          onUpdateOpportunity
            ? (update) => {
                onUpdateOpportunity(opportunity.id, update);
              }
            : undefined
        }
      />
      <OutreachDraftHelper
        opportunity={opportunity}
        isCreating={isCreatingOutreach}
        createError={outreachCreateError}
        onCreateDraft={onCreateOutreachDraft}
      />
    </section>
  );
}
