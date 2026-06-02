import type { Opportunity } from "../domain/index.js";

export type WeeklyReportMetrics = {
  collectedOpportunities: number;
  relevantOpportunities: number;
  hotOpportunities: number;
  interestingOpportunities: number;
  averageScore?: number;
  bestSource?: string;
};

export type WeeklySourceSummary = {
  source: string;
  collected: number;
  relevant: number;
  hotOrInteresting: number;
  averageScore?: number;
  recommendation: "keep" | "improve" | "downgrade" | "remove" | "manual-only";
};

export type WeeklyReportModel = {
  generatedAt: string;
  periodStart?: string;
  periodEnd?: string;
  metrics: WeeklyReportMetrics;
  topOpportunities: Opportunity[];
  sourceSummaries: WeeklySourceSummary[];
  missingInformation: Array<{
    opportunityId: string;
    title: string;
    missingInformation: string[];
  }>;
  technologySignals: string[];
  recommendedActions: string[];
};

export function buildWeeklyReportModel(
  opportunities: Opportunity[],
  generatedAt: string
): WeeklyReportModel {
  const sortedOpportunities = [...opportunities].sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
  const relevantOpportunities = opportunities.filter((opportunity) => (opportunity.score ?? 0) >= 50);
  const hotOpportunities = opportunities.filter((opportunity) => (opportunity.score ?? 0) >= 80);
  const interestingOpportunities = opportunities.filter((opportunity) => {
    const score = opportunity.score ?? 0;
    return score >= 65 && score <= 79;
  });
  const sourceSummaries = buildSourceSummaries(opportunities);

  return {
    generatedAt,
    periodStart: minDate(opportunities.map((opportunity) => opportunity.collectedAt)),
    periodEnd: maxDate(opportunities.map((opportunity) => opportunity.collectedAt)),
    metrics: {
      collectedOpportunities: opportunities.length,
      relevantOpportunities: relevantOpportunities.length,
      hotOpportunities: hotOpportunities.length,
      interestingOpportunities: interestingOpportunities.length,
      averageScore: averageScore(opportunities),
      bestSource: sourceSummaries[0]?.source
    },
    topOpportunities: sortedOpportunities.slice(0, 5),
    sourceSummaries,
    missingInformation: opportunities
      .filter((opportunity) => (opportunity.missingInformation ?? []).length > 0)
      .map((opportunity) => ({
        opportunityId: opportunity.id,
        title: opportunity.title,
        missingInformation: opportunity.missingInformation ?? []
      })),
    technologySignals: topTechnologySignals(opportunities),
    recommendedActions: recommendedActions(sortedOpportunities)
  };
}

export function renderWeeklyReportMarkdown(report: WeeklyReportModel): string {
  return [
    "# Weekly Market Report",
    "",
    `Generated at: ${report.generatedAt}`,
    report.periodStart && report.periodEnd ? `Period: ${report.periodStart} to ${report.periodEnd}` : "Period: no opportunities",
    "",
    "## Executive summary",
    "",
    executiveSummary(report),
    "",
    "## Weekly numbers",
    "",
    "| Metric | Value |",
    "| ------ | ----: |",
    `| Collected opportunities | ${report.metrics.collectedOpportunities} |`,
    `| Relevant opportunities | ${report.metrics.relevantOpportunities} |`,
    `| Hot opportunities | ${report.metrics.hotOpportunities} |`,
    `| Interesting opportunities | ${report.metrics.interestingOpportunities} |`,
    `| Average score | ${formatOptionalNumber(report.metrics.averageScore)} |`,
    `| Best source | ${report.metrics.bestSource ?? "n/a"} |`,
    "",
    "## Best opportunities",
    "",
    opportunityTable(report.topOpportunities),
    "",
    "## Source performance",
    "",
    sourceTable(report.sourceSummaries),
    "",
    "## Technology signals",
    "",
    bulletList(report.technologySignals),
    "",
    "## Missing information",
    "",
    missingInformationTable(report.missingInformation),
    "",
    "## Recommended actions",
    "",
    bulletList(report.recommendedActions)
  ].join("\n");
}

function buildSourceSummaries(opportunities: Opportunity[]): WeeklySourceSummary[] {
  const bySource = new Map<string, Opportunity[]>();

  for (const opportunity of opportunities) {
    bySource.set(opportunity.source, [...(bySource.get(opportunity.source) ?? []), opportunity]);
  }

  return Array.from(bySource.entries())
    .map(([source, sourceOpportunities]) => {
      const relevant = sourceOpportunities.filter((opportunity) => (opportunity.score ?? 0) >= 50).length;
      const hotOrInteresting = sourceOpportunities.filter((opportunity) => (opportunity.score ?? 0) >= 65).length;
      const sourceAverageScore = averageScore(sourceOpportunities);

      return {
        source,
        collected: sourceOpportunities.length,
        relevant,
        hotOrInteresting,
        averageScore: sourceAverageScore,
        recommendation: sourceRecommendation(sourceOpportunities, hotOrInteresting)
      };
    })
    .sort((left, right) => (right.averageScore ?? 0) - (left.averageScore ?? 0));
}

function sourceRecommendation(
  opportunities: Opportunity[],
  hotOrInteresting: number
): WeeklySourceSummary["recommendation"] {
  if (opportunities.some((opportunity) => opportunity.source.toLowerCase().includes("linkedin"))) return "manual-only";
  if (hotOrInteresting > 0) return "keep";
  if (opportunities.length > 0 && opportunities.some((opportunity) => (opportunity.score ?? 0) >= 50)) return "improve";
  return "downgrade";
}

function topTechnologySignals(opportunities: Opportunity[]): string[] {
  const counts = new Map<string, number>();

  for (const opportunity of opportunities) {
    for (const skill of [...opportunity.requiredSkills, ...opportunity.niceToHaveSkills]) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([skill, count]) => `${skill} (${count})`);
}

function recommendedActions(opportunities: Opportunity[]): string[] {
  if (opportunities.length === 0) return ["Import opportunities before generating the next report."];

  return opportunities.slice(0, 5).map((opportunity) => {
    const score = opportunity.score ?? 0;
    if (score >= 80) return `Contact immediately: ${opportunity.title}`;
    if ((opportunity.missingInformation ?? []).length > 0) return `Ask for missing details: ${opportunity.title}`;
    if (score >= 65) return `Save for later: ${opportunity.title}`;
    return `Monitor: ${opportunity.title}`;
  });
}

function opportunityTable(opportunities: Opportunity[]): string {
  if (opportunities.length === 0) return "No opportunities found.";

  return [
    "| Opportunity | Source | Score | Class | Missing information |",
    "| ----------- | ------ | ----: | ----- | ------------------- |",
    ...opportunities.map((opportunity) =>
      `| ${escapeMarkdown(opportunity.title)} | ${escapeMarkdown(opportunity.source)} | ${opportunity.score ?? "n/a"} | ${opportunity.opportunityClass ?? "n/a"} | ${(opportunity.missingInformation ?? []).join(", ") || "none"} |`
    )
  ].join("\n");
}

function sourceTable(sourceSummaries: WeeklySourceSummary[]): string {
  if (sourceSummaries.length === 0) return "No source activity found.";

  return [
    "| Source | Collected | Relevant | Hot/Interesting | Average score | Recommendation |",
    "| ------ | --------: | -------: | --------------: | ------------: | -------------- |",
    ...sourceSummaries.map((summary) =>
      `| ${escapeMarkdown(summary.source)} | ${summary.collected} | ${summary.relevant} | ${summary.hotOrInteresting} | ${formatOptionalNumber(summary.averageScore)} | ${summary.recommendation} |`
    )
  ].join("\n");
}

function missingInformationTable(rows: WeeklyReportModel["missingInformation"]): string {
  if (rows.length === 0) return "No missing information found.";

  return [
    "| Opportunity | Missing information |",
    "| ----------- | ------------------- |",
    ...rows.map((row) => `| ${escapeMarkdown(row.title)} | ${row.missingInformation.join(", ")} |`)
  ].join("\n");
}

function executiveSummary(report: WeeklyReportModel): string {
  if (report.metrics.collectedOpportunities === 0) {
    return "No opportunities were found in the database yet.";
  }

  return [
    `${report.metrics.collectedOpportunities} opportunities are currently stored.`,
    `${report.metrics.hotOpportunities} are hot and ${report.metrics.interestingOpportunities} are interesting.`,
    report.metrics.bestSource ? `Best source this week: ${report.metrics.bestSource}.` : "No best source identified yet."
  ].join(" ");
}

function bulletList(values: string[]): string {
  if (values.length === 0) return "- n/a";
  return values.map((value) => `- ${value}`).join("\n");
}

function averageScore(opportunities: Opportunity[]): number | undefined {
  const scores = opportunities.map((opportunity) => opportunity.score).filter((score): score is number => typeof score === "number");
  if (scores.length === 0) return undefined;
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function minDate(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((min, value) => (value < min ? value : min));
}

function maxDate(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((max, value) => (value > max ? value : max));
}

function formatOptionalNumber(value: number | undefined): string {
  return value === undefined ? "n/a" : String(value);
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|");
}
