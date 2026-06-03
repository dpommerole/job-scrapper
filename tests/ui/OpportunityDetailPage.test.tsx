// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/ui/App.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

const detailedOpportunity = {
  ...idealVueFreelanceLille,
  id: "detail-vue",
  status: "interesting" as const,
  score: 91,
  opportunityClass: "hot" as const,
  recruiterName: "Camille Martin",
  recruiterCompany: "Tech Leads",
  positiveSignals: ["Vue 3 and TypeScript are core requirements", "Architecture ownership is explicit"],
  negativeSignals: ["Rate has not been confirmed"],
  missingInformation: ["Client decision process", "Interview timeline"],
  notes: "Ask whether the design system work is already staffed."
};

describe("OpportunityDetailPage", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the selected opportunity detail", () => {
    render(<App pathname="/opportunities/detail-vue" opportunities={[detailedOpportunity]} />);

    expect(screen.getByRole("heading", { level: 1, name: detailedOpportunity.title })).toBeInTheDocument();
    expect(screen.getByText(detailedOpportunity.description)).toBeInTheDocument();
    expect(screen.getByText("Client final retail · Freelance-Informatique · Lille, France")).toBeInTheDocument();
    expect(screen.getByText("Camille Martin · Tech Leads")).toBeInTheDocument();
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Freelance")).toBeInTheDocument();
    expect(screen.getByText("12 months")).toBeInTheDocument();
    expect(screen.getByText("ASAP")).toBeInTheDocument();
    expect(screen.getByText("650-750 EUR")).toBeInTheDocument();
    expect(screen.getByText("Vue.js")).toBeInTheDocument();
    expect(screen.getByText("Design system")).toBeInTheDocument();
  });

  it("makes score, signals and missing information visible", () => {
    render(<App pathname="/opportunities/detail-vue" opportunities={[detailedOpportunity]} />);

    const scoreSummary = screen.getByLabelText("Score summary");
    expect(within(scoreSummary).getByText("91")).toBeInTheDocument();
    expect(within(scoreSummary).getByText("Hot")).toBeInTheDocument();
    expect(within(scoreSummary).getByText("Interesting")).toBeInTheDocument();

    expect(screen.getByText("Vue 3 and TypeScript are core requirements")).toBeInTheDocument();
    expect(screen.getByText("Architecture ownership is explicit")).toBeInTheDocument();
    expect(screen.getByText("Rate has not been confirmed")).toBeInTheDocument();
    expect(screen.getByText("Client decision process")).toBeInTheDocument();
    expect(screen.getByText("Interview timeline")).toBeInTheDocument();
  });

  it("displays source attribution and notes", () => {
    render(<App pathname="/opportunities/detail-vue" opportunities={[detailedOpportunity]} />);

    expect(screen.getByRole("link", { name: "View source" })).toHaveAttribute(
      "href",
      detailedOpportunity.sourceUrl
    );
    expect(screen.getByText("Ask whether the design system work is already staffed.")).toBeInTheDocument();
  });

  it("renders readable defaults when optional data is missing", () => {
    render(
      <App
        pathname="/opportunities/sparse"
        opportunities={[
          {
            ...detailedOpportunity,
            id: "sparse",
            sourceUrl: undefined,
            recruiterName: undefined,
            recruiterCompany: undefined,
            rateMin: undefined,
            rateMax: undefined,
            requiredSkills: [],
            niceToHaveSkills: [],
            positiveSignals: [],
            negativeSignals: [],
            missingInformation: [],
            notes: undefined
          }
        ]}
      />
    );

    expect(screen.getByText("No recruiter listed")).toBeInTheDocument();
    expect(screen.getByText("Unknown rate")).toBeInTheDocument();
    expect(screen.getByText("No required skills listed")).toBeInTheDocument();
    expect(screen.getByText("No nice-to-have skills listed")).toBeInTheDocument();
    expect(screen.getByText("No positive signals recorded.")).toBeInTheDocument();
    expect(screen.getByText("No negative signals recorded.")).toBeInTheDocument();
    expect(screen.getByText("No missing information recorded.")).toBeInTheDocument();
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View source" })).not.toBeInTheDocument();
  });

  it("renders a not found state when the opportunity is missing", () => {
    render(<App pathname="/opportunities/missing" opportunities={[detailedOpportunity]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Opportunity not found" })).toBeInTheDocument();
    expect(screen.getByText("No matching opportunity")).toBeInTheDocument();
  });

  it("submits status and notes updates from the detail page", () => {
    const onUpdateOpportunity = vi.fn();

    render(
      <App
        pathname="/opportunities/detail-vue"
        opportunities={[detailedOpportunity]}
        onUpdateOpportunity={onUpdateOpportunity}
      />
    );

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "contacted" } });
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Intro sent." } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onUpdateOpportunity).toHaveBeenCalledWith("detail-vue", {
      status: "contacted",
      notes: "Intro sent."
    });
  });

  it("shows save errors", () => {
    render(
      <App
        pathname="/opportunities/detail-vue"
        opportunities={[detailedOpportunity]}
        opportunitySaveError="Failed to save opportunity"
        onUpdateOpportunity={() => undefined}
      />
    );

    expect(screen.getByText("Failed to save opportunity")).toBeInTheDocument();
  });

  it("pre-fills an editable outreach draft from opportunity data", () => {
    render(<App pathname="/opportunities/detail-vue" opportunities={[detailedOpportunity]} />);

    expect(screen.getByRole("heading", { level: 2, name: "Outreach draft" })).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toHaveValue(`Mission ${detailedOpportunity.title}`);
    const draftMessage = screen.getByLabelText("Message") as HTMLTextAreaElement;
    expect(draftMessage.value).toContain(detailedOpportunity.title);
    expect(draftMessage.value).toContain("quel est le contexte client");
    expect(screen.getByRole("button", { name: "Copy draft" })).toBeInTheDocument();
  });

  it("saves an edited outreach draft from detail page", () => {
    const onCreateOutreachDraft = vi.fn();

    render(
      <App
        pathname="/opportunities/detail-vue"
        opportunities={[detailedOpportunity]}
        onCreateOutreachDraft={onCreateOutreachDraft}
      />
    );

    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Intro mission Vue" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Message edited before saving." } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(onCreateOutreachDraft).toHaveBeenCalledWith({
      opportunityId: "detail-vue",
      channel: "email",
      subject: "Intro mission Vue",
      message: "Message edited before saving."
    });
  });

  it("copies the edited outreach draft", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText
      }
    });

    render(<App pathname="/opportunities/detail-vue" opportunities={[detailedOpportunity]} />);

    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Intro mission Vue" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Message edited before copy." } });
    fireEvent.click(screen.getByRole("button", { name: "Copy draft" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("Intro mission Vue\n\nMessage edited before copy.");
    });
    expect(screen.getByText("Draft copied")).toBeInTheDocument();
  });
});
