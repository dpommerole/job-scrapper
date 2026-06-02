import { desc, eq } from "drizzle-orm";
import type { Opportunity } from "../domain/index.js";
import type { AppDatabase } from "./database.js";
import type { NewOpportunityRow, OpportunityRow } from "./schema.js";
import { opportunities } from "./schema.js";

export type OpportunityStatusAndNotesUpdate = {
  status: Opportunity["status"];
  notes?: string;
};

export class OpportunityRepository {
  constructor(private readonly db: AppDatabase) {}

  save(opportunity: Opportunity, sourceId?: string): Opportunity {
    const row = toOpportunityRow(opportunity, sourceId);

    this.db
      .insert(opportunities)
      .values(row)
      .onConflictDoUpdate({
        target: opportunities.id,
        set: {
          sourceId: row.sourceId,
          source: row.source,
          sourceUrl: row.sourceUrl,
          title: row.title,
          company: row.company,
          recruiterName: row.recruiterName,
          recruiterCompany: row.recruiterCompany,
          recruiterContactUrl: row.recruiterContactUrl,
          recruiterEmail: row.recruiterEmail,
          location: row.location,
          remotePolicy: row.remotePolicy,
          contractType: row.contractType,
          seniority: row.seniority,
          duration: row.duration,
          startDate: row.startDate,
          rateMin: row.rateMin,
          rateMax: row.rateMax,
          currency: row.currency,
          requiredSkillsJson: row.requiredSkillsJson,
          niceToHaveSkillsJson: row.niceToHaveSkillsJson,
          description: row.description,
          publishedAt: row.publishedAt,
          collectedAt: row.collectedAt,
          updatedAt: new Date().toISOString(),
          status: row.status,
          score: row.score,
          opportunityClass: row.opportunityClass,
          positiveSignalsJson: row.positiveSignalsJson,
          negativeSignalsJson: row.negativeSignalsJson,
          missingInformationJson: row.missingInformationJson,
          notes: row.notes
        }
      })
      .run();

    return opportunity;
  }

  findById(id: string): Opportunity | undefined {
    const row = this.db.select().from(opportunities).where(eq(opportunities.id, id)).get();
    return row ? toOpportunity(row) : undefined;
  }

  list(): Opportunity[] {
    return this.db.select().from(opportunities).orderBy(desc(opportunities.collectedAt)).all().map(toOpportunity);
  }

  updateStatusAndNotes(id: string, update: OpportunityStatusAndNotesUpdate): Opportunity | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updatedAt = new Date().toISOString();

    this.db
      .update(opportunities)
      .set({
        status: update.status,
        notes: update.notes,
        updatedAt
      })
      .where(eq(opportunities.id, id))
      .run();

    return {
      ...existing,
      status: update.status,
      notes: update.notes,
      updatedAt
    };
  }
}

function toOpportunityRow(opportunity: Opportunity, sourceId?: string): NewOpportunityRow {
  return {
    id: opportunity.id,
    sourceId,
    source: opportunity.source,
    sourceUrl: opportunity.sourceUrl,
    title: opportunity.title,
    company: opportunity.company,
    recruiterName: opportunity.recruiterName,
    recruiterCompany: opportunity.recruiterCompany,
    recruiterContactUrl: opportunity.recruiterContactUrl,
    recruiterEmail: opportunity.recruiterEmail,
    location: opportunity.location,
    remotePolicy: opportunity.remotePolicy,
    contractType: opportunity.contractType,
    seniority: opportunity.seniority,
    duration: opportunity.duration,
    startDate: opportunity.startDate,
    rateMin: opportunity.rateMin,
    rateMax: opportunity.rateMax,
    currency: opportunity.currency,
    requiredSkillsJson: JSON.stringify(opportunity.requiredSkills),
    niceToHaveSkillsJson: JSON.stringify(opportunity.niceToHaveSkills),
    description: opportunity.description,
    publishedAt: opportunity.publishedAt,
    collectedAt: opportunity.collectedAt,
    updatedAt: opportunity.updatedAt,
    status: opportunity.status,
    score: opportunity.score,
    opportunityClass: opportunity.opportunityClass,
    positiveSignalsJson: JSON.stringify(opportunity.positiveSignals ?? []),
    negativeSignalsJson: JSON.stringify(opportunity.negativeSignals ?? []),
    missingInformationJson: JSON.stringify(opportunity.missingInformation ?? []),
    notes: opportunity.notes,
    createdAt: new Date().toISOString()
  };
}

function toOpportunity(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    source: row.source,
    sourceUrl: row.sourceUrl ?? undefined,
    title: row.title,
    company: row.company ?? undefined,
    recruiterName: row.recruiterName ?? undefined,
    recruiterCompany: row.recruiterCompany ?? undefined,
    recruiterContactUrl: row.recruiterContactUrl ?? undefined,
    recruiterEmail: row.recruiterEmail ?? undefined,
    location: row.location ?? undefined,
    remotePolicy: row.remotePolicy as Opportunity["remotePolicy"],
    contractType: row.contractType as Opportunity["contractType"],
    seniority: row.seniority ?? undefined,
    duration: row.duration ?? undefined,
    startDate: row.startDate ?? undefined,
    rateMin: row.rateMin ?? undefined,
    rateMax: row.rateMax ?? undefined,
    currency: row.currency as Opportunity["currency"],
    requiredSkills: parseJsonArray(row.requiredSkillsJson),
    niceToHaveSkills: parseJsonArray(row.niceToHaveSkillsJson),
    description: row.description,
    publishedAt: row.publishedAt ?? undefined,
    collectedAt: row.collectedAt,
    updatedAt: row.updatedAt ?? undefined,
    status: row.status as Opportunity["status"],
    score: row.score ?? undefined,
    opportunityClass: row.opportunityClass as Opportunity["opportunityClass"],
    positiveSignals: parseJsonArray(row.positiveSignalsJson),
    negativeSignals: parseJsonArray(row.negativeSignalsJson),
    missingInformation: parseJsonArray(row.missingInformationJson),
    notes: row.notes ?? undefined
  };
}

function parseJsonArray(value: string): string[] {
  const parsed: unknown = JSON.parse(value);
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}
