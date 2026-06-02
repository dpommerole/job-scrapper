import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
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
});
