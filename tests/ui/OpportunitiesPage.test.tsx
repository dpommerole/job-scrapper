import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../../src/ui/App.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

const scoredVueOpportunity = {
  ...idealVueFreelanceLille,
  status: "interesting" as const,
  score: 91,
  opportunityClass: "hot" as const
};

const scoredReactOpportunity = {
  ...reactRemoteFreelance,
  score: 72,
  opportunityClass: "interesting" as const
};

const archivedCdiOpportunity = {
  ...scoredReactOpportunity,
  id: "archived-cdi",
  title: "Frontend maintenance CDI",
  source: "Manual",
  status: "archived" as const,
  remotePolicy: "onsite" as const,
  contractType: "cdi" as const,
  score: 32,
  opportunityClass: "reject" as const,
  collectedAt: "2026-05-30T10:00:00.000Z"
};

describe("OpportunitiesPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders an empty state when there are no opportunities", () => {
    render(<App pathname="/opportunities" opportunities={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Opportunities" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "No opportunities yet" })).toBeInTheDocument();
  });

  it("renders opportunity rows with score, class, status and key details", () => {
    render(<App pathname="/opportunities" opportunities={[scoredVueOpportunity, scoredReactOpportunity]} />);

    const vueRow = screen.getByRole("article", { name: scoredVueOpportunity.title });
    expect(vueRow).toBeInTheDocument();

    expect(screen.getByRole("link", { name: scoredVueOpportunity.title })).toHaveAttribute(
      "href",
      `/opportunities/${scoredVueOpportunity.id}`
    );
    expect(screen.getByRole("link", { name: scoredReactOpportunity.title })).toHaveAttribute(
      "href",
      `/opportunities/${scoredReactOpportunity.id}`
    );

    expect(screen.getByText("Client final retail · Freelance-Informatique · Lille, France")).toBeInTheDocument();
    expect(screen.getByText("Scale-up SaaS · LeHibou · France")).toBeInTheDocument();
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Hot")).toBeInTheDocument();
    expect(screen.getAllByText("Interesting")).toHaveLength(2);
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getAllByText("Freelance")).toHaveLength(2);
    expect(screen.getAllByText("Jun 02, 2026")).toHaveLength(2);
    expect(screen.getByText("Vue.js")).toBeInTheDocument();
    expect(screen.getAllByText("TypeScript")).toHaveLength(2);
  });

  it("renders readable defaults for sparse opportunities", () => {
    render(
      <App
        pathname="/opportunities"
        opportunities={[
          {
            ...scoredReactOpportunity,
            id: "sparse",
            company: undefined,
            location: undefined,
            requiredSkills: [],
            score: undefined,
            opportunityClass: undefined
          }
        ]}
      />
    );

    expect(screen.getByText("Unknown company · LeHibou · Unknown location")).toBeInTheDocument();
    expect(screen.getByText("No required skills listed")).toBeInTheDocument();

    const sparseRow = screen.getByRole("article", { name: scoredReactOpportunity.title });

    expect(within(sparseRow).getByText("n/a")).toBeInTheDocument();
    expect(within(sparseRow).getByText("Not scored")).toBeInTheDocument();
  });

  it("combines filters and keeps the state readable", () => {
    render(
      <App
        pathname="/opportunities"
        opportunities={[scoredVueOpportunity, scoredReactOpportunity, archivedCdiOpportunity]}
      />
    );

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "new" } });
    fireEvent.change(screen.getByLabelText("Source"), { target: { value: "LeHibou" } });
    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "react remote" } });

    expect(screen.getByRole("article", { name: scoredReactOpportunity.title })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: scoredVueOpportunity.title })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: archivedCdiOpportunity.title })).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3 opportunities · 3 active filters")).toBeInTheDocument();
  });

  it("resets filters after a narrowed search", () => {
    render(
      <App
        pathname="/opportunities"
        opportunities={[scoredVueOpportunity, scoredReactOpportunity, archivedCdiOpportunity]}
      />
    );

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "vue" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "interesting" } });

    expect(screen.getByRole("article", { name: scoredVueOpportunity.title })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: scoredReactOpportunity.title })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByRole("article", { name: scoredVueOpportunity.title })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: scoredReactOpportunity.title })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: archivedCdiOpportunity.title })).toBeInTheDocument();
    expect(screen.getByText("3 of 3 opportunities · 0 active filters")).toBeInTheDocument();
  });

  it("filters by class, remote policy, contract type and minimum score", () => {
    render(
      <App
        pathname="/opportunities"
        opportunities={[scoredVueOpportunity, scoredReactOpportunity, archivedCdiOpportunity]}
      />
    );

    fireEvent.change(screen.getByLabelText("Class"), { target: { value: "hot" } });
    fireEvent.change(screen.getByLabelText("Remote policy"), { target: { value: "hybrid" } });
    fireEvent.change(screen.getByLabelText("Contract"), { target: { value: "freelance" } });
    fireEvent.change(screen.getByLabelText("Minimum score"), { target: { value: "80" } });

    expect(screen.getByRole("article", { name: scoredVueOpportunity.title })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: scoredReactOpportunity.title })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: archivedCdiOpportunity.title })).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3 opportunities · 4 active filters")).toBeInTheDocument();
  });

  it("sorts opportunities by score and collected date", () => {
    render(
      <App
        pathname="/opportunities"
        opportunities={[
          { ...scoredVueOpportunity, collectedAt: "2026-06-01T10:00:00.000Z" },
          { ...scoredReactOpportunity, collectedAt: "2026-06-02T10:00:00.000Z" },
          archivedCdiOpportunity
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "score-desc" } });
    expect(screen.getAllByRole("article").map((row) => row.getAttribute("aria-label"))).toEqual([
      scoredVueOpportunity.title,
      scoredReactOpportunity.title,
      archivedCdiOpportunity.title
    ]);

    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "collected-desc" } });
    expect(screen.getAllByRole("article").map((row) => row.getAttribute("aria-label"))).toEqual([
      scoredReactOpportunity.title,
      scoredVueOpportunity.title,
      archivedCdiOpportunity.title
    ]);
  });
});
