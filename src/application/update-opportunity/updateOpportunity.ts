import type { Opportunity, OpportunityStatus } from "../../domain/index.js";
import type { OpportunityRepository } from "../../storage/index.js";

export type UpdateOpportunityInput = {
  id: string;
  status: OpportunityStatus;
  notes?: string;
};

export type UpdateOpportunityDependencies = {
  opportunityRepository: Pick<OpportunityRepository, "updateStatusAndNotes">;
};

export function updateOpportunity(
  input: UpdateOpportunityInput,
  dependencies: UpdateOpportunityDependencies
): Opportunity | undefined {
  return dependencies.opportunityRepository.updateStatusAndNotes(input.id, {
    status: input.status,
    notes: input.notes
  });
}
