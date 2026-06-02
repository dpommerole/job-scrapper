import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildWeeklyReportModel,
  renderWeeklyReportMarkdown,
  type WeeklyReportModel
} from "../../reporting/index.js";
import type { OpportunityRepository } from "../../storage/index.js";

export type GenerateWeeklyReportInput = {
  generatedAt?: string;
  outputDir?: string;
};

export type GenerateWeeklyReportDependencies = {
  opportunityRepository: OpportunityRepository;
};

export type GenerateWeeklyReportResult = {
  filePath: string;
  markdown: string;
  report: WeeklyReportModel;
};

export function generateWeeklyReport(
  input: GenerateWeeklyReportInput,
  dependencies: GenerateWeeklyReportDependencies
): GenerateWeeklyReportResult {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const outputDir = input.outputDir ?? "reports";
  const opportunities = dependencies.opportunityRepository.list();
  const report = buildWeeklyReportModel(opportunities, generatedAt);
  const markdown = renderWeeklyReportMarkdown(report);
  const filePath = join(outputDir, `${generatedAt.slice(0, 10)}-weekly-market-report.md`);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(filePath, markdown, "utf8");

  return {
    filePath,
    markdown,
    report
  };
}
