import { describe, expect, it } from "vitest";
import type { Outreach } from "../../src/domain/index.js";
import { createDashboardViewModel } from "../../src/ui/view-models/dashboardViewModel.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

describe("dashboard view model", () => {
  it("builds metrics and immediate action lists", () => {
    const dueOutreach: Outreach = {
      id: "outreach-due",
      opportunityId: idealVueFreelanceLille.id,
      recruiterName: "Marie",
      channel: "email",
      status: "sent",
      message: "Bonjour",
      followUpAt: "2026-06-02",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z"
    };

    const dashboard = createDashboardViewModel(
      [
        {
          ...idealVueFreelanceLille,
          score: 91,
          opportunityClass: "hot",
          collectedAt: "2026-06-03T08:00:00.000Z"
        },
        {
          ...reactRemoteFreelance,
          score: 72,
          opportunityClass: "interesting",
          collectedAt: "2026-06-02T08:00:00.000Z"
        }
      ],
      [dueOutreach],
      [
        {
          id: "2026-06-03-weekly-market-report.md",
          fileName: "2026-06-03-weekly-market-report.md",
          title: "Weekly Market Report",
          generatedDate: "2026-06-03"
        }
      ],
      "2026-06-03T10:00:00.000Z"
    );

    expect(dashboard.metrics).toEqual({
      hotOpportunities: 1,
      interestingOpportunities: 1,
      followUpsDue: 1,
      latestImported: 1
    });
    expect(dashboard.hotOpportunities[0]?.title).toBe(idealVueFreelanceLille.title);
    expect(dashboard.followUpsDue[0]?.id).toBe("outreach-due");
    expect(dashboard.latestReport?.title).toBe("Weekly Market Report");
  });
});
