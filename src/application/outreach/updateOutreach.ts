import type { Outreach, OutreachChannel, OutreachStatus } from "../../domain/index.js";
import type { OutreachRepository } from "../../storage/index.js";

export type UpdateOutreachInput = {
  id: string;
  status?: OutreachStatus;
  channel?: OutreachChannel;
  subject?: string;
  message?: string;
  sentAt?: string;
  followUpAt?: string;
  repliedAt?: string;
  notes?: string;
  now?: string;
};

export type UpdateOutreachDependencies = {
  outreachRepository: Pick<OutreachRepository, "findById" | "update">;
};

export function updateOutreach(input: UpdateOutreachInput, dependencies: UpdateOutreachDependencies): Outreach | undefined {
  const existing = dependencies.outreachRepository.findById(input.id);
  if (!existing) return undefined;

  const now = input.now ?? new Date().toISOString();
  const nextStatus = input.status ?? existing.status;

  return dependencies.outreachRepository.update(input.id, {
    status: nextStatus,
    channel: input.channel ?? existing.channel,
    subject: normalizeOptionalString(input.subject) ?? existing.subject,
    message: normalizeOptionalString(input.message) ?? existing.message,
    sentAt: nextStatus === "sent" && !input.sentAt && !existing.sentAt ? now : normalizeOptionalString(input.sentAt) ?? existing.sentAt,
    followUpAt: normalizeOptionalString(input.followUpAt) ?? existing.followUpAt,
    repliedAt:
      nextStatus === "replied" && !input.repliedAt && !existing.repliedAt
        ? now
        : normalizeOptionalString(input.repliedAt) ?? existing.repliedAt,
    notes: typeof input.notes === "string" ? input.notes : existing.notes
  });
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
