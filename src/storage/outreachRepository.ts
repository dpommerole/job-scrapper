import { desc, eq } from "drizzle-orm";
import type { Outreach } from "../domain/index.js";
import type { AppDatabase } from "./database.js";
import { outreachItems, type NewOutreachItemRow, type OutreachItemRow } from "./schema.js";

export type OutreachUpdate = Partial<
  Pick<Outreach, "status" | "channel" | "subject" | "message" | "sentAt" | "followUpAt" | "repliedAt" | "notes">
>;

export class OutreachRepository {
  constructor(private readonly db: AppDatabase) {}

  save(outreach: Outreach): Outreach {
    const row = toOutreachRow(outreach);

    this.db
      .insert(outreachItems)
      .values(row)
      .onConflictDoUpdate({
        target: outreachItems.id,
        set: {
          opportunityId: row.opportunityId,
          recruiterName: row.recruiterName,
          recruiterCompany: row.recruiterCompany,
          relatedOpportunityTitle: row.relatedOpportunityTitle,
          channel: row.channel,
          status: row.status,
          subject: row.subject,
          message: row.message,
          sentAt: row.sentAt,
          followUpAt: row.followUpAt,
          repliedAt: row.repliedAt,
          notes: row.notes,
          updatedAt: row.updatedAt
        }
      })
      .run();

    return outreach;
  }

  findById(id: string): Outreach | undefined {
    const row = this.db.select().from(outreachItems).where(eq(outreachItems.id, id)).get();
    return row ? toOutreach(row) : undefined;
  }

  list(): Outreach[] {
    return this.db.select().from(outreachItems).orderBy(desc(outreachItems.updatedAt)).all().map(toOutreach);
  }

  update(id: string, update: OutreachUpdate): Outreach | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updated: Outreach = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString()
    };

    this.db
      .update(outreachItems)
      .set({
        status: updated.status,
        channel: updated.channel,
        subject: updated.subject,
        message: updated.message,
        sentAt: updated.sentAt,
        followUpAt: updated.followUpAt,
        repliedAt: updated.repliedAt,
        notes: updated.notes,
        updatedAt: updated.updatedAt
      })
      .where(eq(outreachItems.id, id))
      .run();

    return updated;
  }
}

function toOutreachRow(outreach: Outreach): NewOutreachItemRow {
  return {
    id: outreach.id,
    opportunityId: outreach.opportunityId,
    recruiterName: outreach.recruiterName,
    recruiterCompany: outreach.recruiterCompany,
    relatedOpportunityTitle: outreach.relatedOpportunityTitle,
    channel: outreach.channel,
    status: outreach.status,
    subject: outreach.subject,
    message: outreach.message,
    sentAt: outreach.sentAt,
    followUpAt: outreach.followUpAt,
    repliedAt: outreach.repliedAt,
    notes: outreach.notes,
    createdAt: outreach.createdAt,
    updatedAt: outreach.updatedAt
  };
}

function toOutreach(row: OutreachItemRow): Outreach {
  return {
    id: row.id,
    opportunityId: row.opportunityId ?? undefined,
    recruiterName: row.recruiterName ?? undefined,
    recruiterCompany: row.recruiterCompany ?? undefined,
    relatedOpportunityTitle: row.relatedOpportunityTitle ?? undefined,
    channel: row.channel as Outreach["channel"],
    status: row.status as Outreach["status"],
    subject: row.subject ?? undefined,
    message: row.message,
    sentAt: row.sentAt ?? undefined,
    followUpAt: row.followUpAt ?? undefined,
    repliedAt: row.repliedAt ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
