import { describe, expect, it } from "vitest";
import {
  buildWeeklyReportModel,
  renderWeeklyReportMarkdown
} from "../../src/reporting/index.js";
import { idealVueFreelanceLille, reactRemoteFreelance, vagueOpportunity } from "../scoring/fixtures.js";

describe("weekly reporting", () => {
  it("builds weekly metrics and renders markdown", () => {
    const opportunities = [
      {
        ...idealVueFreelanceLille,
        score: 95,
        opportunityClass: "hot" as const,
        missingInformation: []
      },
      {
        ...reactRemoteFreelance,
        score: 72,
        opportunityClass: "interesting" as const,
        missingInformation: ["source URL"]
      },
      {
        ...vagueOpportunity,
        score: 20,
        opportunityClass: "reject" as const,
        missingInformation: ["contract type", "rate"]
      }
    ];

    const report = buildWeeklyReportModel(opportunities, "2026-06-08T09:00:00.000Z");
    const markdown = renderWeeklyReportMarkdown(report);

    expect(report.metrics).toEqual({
      collectedOpportunities: 3,
      relevantOpportunities: 2,
      hotOpportunities: 1,
      interestingOpportunities: 1,
      averageScore: 62,
      bestSource: "Freelance-Informatique"
    });
    expect(report.sourceSummaries[0]).toMatchObject({
      source: "Freelance-Informatique",
      collected: 1,
      relevant: 1,
      hotOrInteresting: 1,
      recommendation: "keep"
    });
    expect(markdown).toContain("# Weekly Market Report");
    expect(markdown).toContain("| Collected opportunities | 3 |");
    expect(markdown).toContain("Lead Frontend Vue 3 TypeScript");
    expect(markdown).toContain("source URL");
  });
});
