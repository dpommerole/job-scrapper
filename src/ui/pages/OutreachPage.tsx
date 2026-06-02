import type { Opportunity, Outreach, OutreachChannel } from "../../domain/index.js";
import { OutreachDraftForm } from "../components/outreach/OutreachDraftForm.js";
import { type OutreachActionUpdate, OutreachList } from "../components/outreach/OutreachList.js";
import { createOutreachViewModels } from "../view-models/outreachViewModel.js";

export type OutreachPageProps = {
  opportunities: Opportunity[];
  outreachItems: Outreach[];
  isCreatingOutreach?: boolean;
  isSavingOutreach?: boolean;
  outreachSaveError?: string | undefined;
  onCreateOutreachDraft?: (input: { opportunityId: string; channel: OutreachChannel; followUpAt?: string }) => void;
  onUpdateOutreach?: (id: string, update: OutreachActionUpdate) => void;
};

export function OutreachPage({
  opportunities,
  outreachItems,
  isCreatingOutreach,
  isSavingOutreach,
  outreachSaveError,
  onCreateOutreachDraft,
  onUpdateOutreach
}: OutreachPageProps) {
  return (
    <section className="page-section-wide">
      <div className="page-heading">
        <p className="eyebrow">Pipeline</p>
        <h1>Outreach</h1>
      </div>

      <OutreachDraftForm
        opportunities={opportunities}
        isCreating={isCreatingOutreach}
        onCreateDraft={onCreateOutreachDraft}
      />
      <OutreachList
        outreachItems={createOutreachViewModels(outreachItems)}
        isSaving={isSavingOutreach}
        saveError={outreachSaveError}
        onUpdateOutreach={onUpdateOutreach}
      />
    </section>
  );
}
