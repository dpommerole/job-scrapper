import type { CreateManualOpportunityInput } from "../../application/index.js";
import { OpportunityCreateForm } from "../components/opportunities/OpportunityCreateForm.js";

export type OpportunityCreatePageProps = {
  isCreating?: boolean;
  createError?: string | undefined;
  onCreateOpportunity?: (input: CreateManualOpportunityInput) => void;
};

export function OpportunityCreatePage({ isCreating, createError, onCreateOpportunity }: OpportunityCreatePageProps) {
  return (
    <section className="page-section page-section-wide">
      <header className="page-heading">
        <p className="eyebrow">Manual entry</p>
        <h1>Add opportunity</h1>
      </header>
      <OpportunityCreateForm
        isCreating={isCreating}
        createError={createError}
        onCreate={onCreateOpportunity ?? (() => undefined)}
      />
    </section>
  );
}
