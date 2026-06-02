import type { Opportunity } from "../../domain/index.js";
import type { OpportunityRepository } from "../../storage/index.js";

export type ListOpportunitiesDependencies = {
  opportunityRepository: Pick<OpportunityRepository, "list">;
};

export function listOpportunities(dependencies: ListOpportunitiesDependencies): Opportunity[] {
  return dependencies.opportunityRepository.list();
}
