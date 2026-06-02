import type { Opportunity, Outreach, OutreachChannel } from "../../domain/index.js";
import type { OpportunityRepository, OutreachRepository } from "../../storage/index.js";

export type CreateOutreachDraftInput = {
  opportunityId: string;
  channel?: OutreachChannel;
  followUpAt?: string;
  notes?: string;
  now?: string;
};

export type CreateOutreachDraftDependencies = {
  opportunityRepository: Pick<OpportunityRepository, "findById">;
  outreachRepository: Pick<OutreachRepository, "save">;
};

export type CreateOutreachDraftResult =
  | {
      status: "created";
      outreach: Outreach;
    }
  | {
      status: "missing-opportunity";
    };

export function createOutreachDraft(
  input: CreateOutreachDraftInput,
  dependencies: CreateOutreachDraftDependencies
): CreateOutreachDraftResult {
  const opportunity = dependencies.opportunityRepository.findById(input.opportunityId);
  if (!opportunity) return { status: "missing-opportunity" };

  const now = input.now ?? new Date().toISOString();
  const outreach: Outreach = {
    id: createOutreachId(now, opportunity.id),
    opportunityId: opportunity.id,
    recruiterName: opportunity.recruiterName,
    recruiterCompany: opportunity.recruiterCompany ?? opportunity.company,
    relatedOpportunityTitle: opportunity.title,
    channel: input.channel ?? "email",
    status: "draft",
    subject: createSubject(opportunity),
    message: createDraftMessage(opportunity),
    followUpAt: normalizeOptionalString(input.followUpAt),
    notes: normalizeOptionalString(input.notes),
    createdAt: now,
    updatedAt: now
  };

  return {
    status: "created",
    outreach: dependencies.outreachRepository.save(outreach)
  };
}

function createOutreachId(now: string, opportunityId: string): string {
  const timestamp = now.replace(/\D/g, "").slice(0, 17) || "draft";
  return `outreach-${timestamp}-${opportunityId}`;
}

function createSubject(opportunity: Opportunity): string {
  return `Mission ${opportunity.title}`;
}

function createDraftMessage(opportunity: Opportunity): string {
  const recruiterGreeting = opportunity.recruiterName ? `Bonjour ${opportunity.recruiterName},` : "Bonjour,";
  const companyContext = opportunity.company ? ` chez ${opportunity.company}` : "";

  return [
    recruiterGreeting,
    "",
    `Je vous contacte au sujet de la mission ${opportunity.title}${companyContext}.`,
    "Je suis développeur frontend senior, principalement Vue.js et TypeScript, et j'aimerais en savoir plus sur le contexte, l'équipe et les modalités.",
    "",
    "Est-ce que la mission est toujours ouverte ?"
  ].join("\n");
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
