import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Outreach } from "../../src/domain/index.js";
import { OutreachPage } from "../../src/ui/pages/OutreachPage.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

const dueOutreach: Outreach = {
  id: "outreach-1",
  opportunityId: idealVueFreelanceLille.id,
  recruiterName: "Marie",
  recruiterCompany: "Acme Recruiting",
  relatedOpportunityTitle: idealVueFreelanceLille.title,
  channel: "email",
  status: "sent",
  subject: "Mission Vue",
  message: "Bonjour",
  sentAt: "2026-05-28T10:00:00.000Z",
  followUpAt: "2026-06-01",
  notes: "Intro sent.",
  createdAt: "2026-05-28T10:00:00.000Z",
  updatedAt: "2026-05-28T10:00:00.000Z"
};

describe("OutreachPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders outreach items and visible follow-ups due", () => {
    render(<OutreachPage opportunities={[idealVueFreelanceLille]} outreachItems={[dueOutreach]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Outreach" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Marie" })).toBeInTheDocument();
    expect(screen.getByText(/Acme Recruiting/)).toBeInTheDocument();
    expect(screen.getByText("Follow-up due")).toBeInTheDocument();
  });

  it("calls status update actions", () => {
    const onUpdateOutreach = vi.fn();
    render(
      <OutreachPage
        opportunities={[idealVueFreelanceLille]}
        outreachItems={[dueOutreach]}
        onUpdateOutreach={onUpdateOutreach}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Mark replied" }));

    expect(onUpdateOutreach).toHaveBeenCalledWith("outreach-1", { status: "replied" });
  });

  it("updates follow-up date and notes", () => {
    const onUpdateOutreach = vi.fn();
    render(
      <OutreachPage
        opportunities={[idealVueFreelanceLille]}
        outreachItems={[dueOutreach]}
        onUpdateOutreach={onUpdateOutreach}
      />
    );

    fireEvent.change(screen.getAllByLabelText("Follow-up date")[1], { target: { value: "2026-06-05" } });
    fireEvent.click(screen.getByRole("button", { name: "Set follow-up" }));
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Follow-up planned after first reply." } });
    fireEvent.click(screen.getByRole("button", { name: "Save notes" }));

    expect(onUpdateOutreach).toHaveBeenCalledWith("outreach-1", { followUpAt: "2026-06-05" });
    expect(onUpdateOutreach).toHaveBeenCalledWith("outreach-1", { notes: "Follow-up planned after first reply." });
  });

  it("shows outreach save errors", () => {
    render(
      <OutreachPage
        opportunities={[idealVueFreelanceLille]}
        outreachItems={[dueOutreach]}
        outreachSaveError="Could not save outreach"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Could not save outreach");
  });

  it("creates a draft from a selected opportunity", () => {
    const onCreateOutreachDraft = vi.fn();
    render(
      <OutreachPage
        opportunities={[idealVueFreelanceLille]}
        outreachItems={[]}
        onCreateOutreachDraft={onCreateOutreachDraft}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Create outreach draft" }));

    expect(onCreateOutreachDraft).toHaveBeenCalledWith({
      opportunityId: idealVueFreelanceLille.id,
      channel: "email",
      followUpAt: undefined
    });
  });

  it("renders an empty state", () => {
    render(<OutreachPage opportunities={[]} outreachItems={[]} />);

    expect(screen.getByText("No outreach yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create outreach draft" })).toBeDisabled();
  });
});
