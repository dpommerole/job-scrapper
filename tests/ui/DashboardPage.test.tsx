import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Outreach } from "../../src/domain/index.js";
import { DashboardPage } from "../../src/ui/pages/DashboardPage.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders key metrics and links", () => {
    const dueOutreach: Outreach = {
      id: "outreach-due",
      opportunityId: idealVueFreelanceLille.id,
      recruiterName: "Marie",
      relatedOpportunityTitle: idealVueFreelanceLille.title,
      channel: "email",
      status: "sent",
      message: "Bonjour",
      followUpAt: "2026-06-02",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-01T10:00:00.000Z"
    };

    render(
      <DashboardPage
        opportunities={[
          {
            ...idealVueFreelanceLille,
            score: 91,
            opportunityClass: "hot",
            collectedAt: new Date().toISOString()
          },
          {
            ...reactRemoteFreelance,
            score: 72,
            opportunityClass: "interesting"
          }
        ]}
        outreachItems={[dueOutreach]}
        reports={[
          {
            id: "2026-06-03-weekly-market-report.md",
            fileName: "2026-06-03-weekly-market-report.md",
            title: "Weekly Market Report",
            generatedDate: "2026-06-03"
          }
        ]}
      />
    );

    const metrics = screen.getByLabelText("Dashboard metrics");
    expect(within(metrics).getByText("Hot opportunities")).toBeInTheDocument();
    expect(within(metrics).getByText("Follow-ups due")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: idealVueFreelanceLille.title })[0]).toHaveAttribute(
      "href",
      `/opportunities/${idealVueFreelanceLille.id}`
    );
    expect(screen.getByRole("link", { name: "Marie" })).toHaveAttribute("href", "/outreach");
    expect(screen.getByRole("link", { name: "Weekly Market Report" })).toHaveAttribute("href", "/reports");
  });

  it("renders empty dashboard states", () => {
    render(<DashboardPage opportunities={[]} outreachItems={[]} reports={[]} />);

    expect(screen.getByText("No hot opportunities yet.")).toBeInTheDocument();
    expect(screen.getByText("No follow-ups due.")).toBeInTheDocument();
    expect(screen.getByText("No report generated yet.")).toBeInTheDocument();
  });
});
