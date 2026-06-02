import type { Outreach } from "../../domain/index.js";
import type { OutreachRepository } from "../../storage/index.js";

export type ListOutreachDependencies = {
  outreachRepository: Pick<OutreachRepository, "list">;
};

export function listOutreach(dependencies: ListOutreachDependencies): Outreach[] {
  return dependencies.outreachRepository.list();
}
