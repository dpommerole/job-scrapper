import type { ReportSummary } from "../../application/index.js";
import type { Opportunity, Outreach } from "../../domain/index.js";

export type DashboardViewModel = {
  metrics: {
    hotOpportunities: number;
    interestingOpportunities: number;
    followUpsDue: number;
    latestImported: number;
  };
  hotOpportunities: Opportunity[];
  interestingOpportunities: Opportunity[];
  followUpsDue: Outreach[];
  latestOpportunities: Opportunity[];
  latestReport?: ReportSummary | undefined;
};

export function createDashboardViewModel(
  opportunities: Opportunity[],
  outreachItems: Outreach[],
  reports: ReportSummary[],
  now = new Date().toISOString()
): DashboardViewModel {
  const hotOpportunities = sortByScore(opportunities.filter((opportunity) => opportunity.opportunityClass === "hot")).slice(0, 3);
  const interestingOpportunities = sortByScore(
    opportunities.filter((opportunity) => opportunity.opportunityClass === "interesting")
  ).slice(0, 3);
  const today = now.slice(0, 10);
  const followUpsDue = outreachItems
    .filter((outreach) => Boolean(outreach.followUpAt && outreach.followUpAt.slice(0, 10) <= today && outreach.status !== "closed"))
    .sort((left, right) => String(left.followUpAt).localeCompare(String(right.followUpAt)))
    .slice(0, 5);
  const latestOpportunities = [...opportunities]
    .sort((left, right) => String(right.collectedAt).localeCompare(String(left.collectedAt)))
    .slice(0, 5);
  const latestImported = latestOpportunities.filter((opportunity) => opportunity.collectedAt.slice(0, 10) === today).length;
  const latestReport = [...reports].sort((left, right) => right.fileName.localeCompare(left.fileName))[0];

  return {
    metrics: {
      hotOpportunities: hotOpportunities.length,
      interestingOpportunities: interestingOpportunities.length,
      followUpsDue: followUpsDue.length,
      latestImported
    },
    hotOpportunities,
    interestingOpportunities,
    followUpsDue,
    latestOpportunities,
    latestReport
  };
}

function sortByScore(opportunities: Opportunity[]): Opportunity[] {
  return [...opportunities].sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
}
