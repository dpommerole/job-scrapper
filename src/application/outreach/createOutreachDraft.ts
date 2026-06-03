import type { Outreach, OutreachChannel } from "../../domain/index.js";
import type { OpportunityRepository, OutreachRepository } from "../../storage/index.js";
import { generateOutreachDraft } from "./generateOutreachDraft.js";

export type CreateOutreachDraftInput = {
  opportunityId: string;
  channel?: OutreachChannel;
  subject?: string;
  message?: string;
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
  const draftContent = generateOutreachDraft(opportunity);
  const outreach: Outreach = {
    id: createOutreachId(now, opportunity.id),
    opportunityId: opportunity.id,
    recruiterName: opportunity.recruiterName,
    recruiterCompany: opportunity.recruiterCompany ?? opportunity.company,
    relatedOpportunityTitle: opportunity.title,
    channel: input.channel ?? "email",
    status: "draft",
    subject: normalizeOptionalString(input.subject) ?? draftContent.subject,
    message: normalizeOptionalString(input.message) ?? draftContent.message,
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

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
