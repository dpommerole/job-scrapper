import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  type: text("type").notNull(),
  collectionMethod: text("collection_method").notNull(),
  priority: text("priority").notNull(),
  complianceRisk: text("compliance_risk").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").references(() => sources.id),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  title: text("title").notNull(),
  company: text("company"),
  recruiterName: text("recruiter_name"),
  recruiterCompany: text("recruiter_company"),
  recruiterContactUrl: text("recruiter_contact_url"),
  recruiterEmail: text("recruiter_email"),
  location: text("location"),
  remotePolicy: text("remote_policy").notNull(),
  contractType: text("contract_type").notNull(),
  seniority: text("seniority"),
  duration: text("duration"),
  startDate: text("start_date"),
  rateMin: integer("rate_min"),
  rateMax: integer("rate_max"),
  currency: text("currency"),
  requiredSkillsJson: text("required_skills_json").notNull(),
  niceToHaveSkillsJson: text("nice_to_have_skills_json").notNull(),
  description: text("description").notNull(),
  publishedAt: text("published_at"),
  collectedAt: text("collected_at").notNull(),
  updatedAt: text("updated_at"),
  status: text("status").notNull(),
  score: integer("score"),
  opportunityClass: text("opportunity_class"),
  positiveSignalsJson: text("positive_signals_json").notNull(),
  negativeSignalsJson: text("negative_signals_json").notNull(),
  missingInformationJson: text("missing_information_json").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull()
});

export const importRuns = sqliteTable("import_runs", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").references(() => sources.id),
  type: text("type").notNull(),
  status: text("status").notNull(),
  fileName: text("file_name"),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  importedCount: integer("imported_count").notNull(),
  skippedDuplicateCount: integer("skipped_duplicate_count").notNull(),
  failedCount: integer("failed_count").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export type SourceRow = typeof sources.$inferSelect;
export type NewSourceRow = typeof sources.$inferInsert;
export type OpportunityRow = typeof opportunities.$inferSelect;
export type NewOpportunityRow = typeof opportunities.$inferInsert;
export type ImportRunRow = typeof importRuns.$inferSelect;
export type NewImportRunRow = typeof importRuns.$inferInsert;
