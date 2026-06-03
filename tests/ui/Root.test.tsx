import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Root } from "../../src/ui/Root.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("Root", () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("loads opportunities from the local API", async () => {
    window.history.pushState({}, "", "/opportunities");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            opportunities: [
              {
                ...idealVueFreelanceLille,
                score: 91,
                opportunityClass: "hot"
              }
            ]
          })
      })
    );

    render(<Root />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: idealVueFreelanceLille.title })).toBeInTheDocument();
    });
  });

  it("persists updates and keeps updated values visible", async () => {
    window.history.pushState({}, "", `/opportunities/${idealVueFreelanceLille.id}`);

    const initialOpportunity = {
      ...idealVueFreelanceLille,
      status: "new" as const,
      notes: "Initial notes."
    };
    const updatedOpportunity = {
      ...initialOpportunity,
      status: "contacted" as const,
      notes: "Intro sent."
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [initialOpportunity] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunity: updatedOpportunity })
        })
    );

    render(<Root />);

    await screen.findByRole("heading", { level: 1, name: idealVueFreelanceLille.title });

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "contacted" } });
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Intro sent." } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Status")).toHaveValue("contacted");
      expect(screen.getByLabelText("Notes")).toHaveValue("Intro sent.");
    });
  });

  it("shows an error when update persistence fails", async () => {
    window.history.pushState({}, "", `/opportunities/${idealVueFreelanceLille.id}`);

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [idealVueFreelanceLille] })
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Server error",
          json: () => Promise.resolve({ error: "Could not save" })
        })
    );

    render(<Root />);

    await screen.findByRole("heading", { level: 1, name: idealVueFreelanceLille.title });

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Could not save")).toBeInTheDocument();
  });

  it("creates an opportunity and navigates to its detail page", async () => {
    window.history.pushState({}, "", "/opportunities/new");
    const createdOpportunity = {
      ...idealVueFreelanceLille,
      id: "manual-created-opportunity",
      title: "Manual Vue opportunity",
      score: 81,
      opportunityClass: "hot" as const
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunity: createdOpportunity })
        })
    );

    render(<Root />);

    fireEvent.change(screen.getByLabelText("Source"), { target: { value: "Manual lead" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Manual Vue opportunity" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Manual opportunity description." } });
    fireEvent.click(screen.getByRole("button", { name: "Create opportunity" }));

    await screen.findByRole("heading", { level: 1, name: "Manual Vue opportunity" });
    expect(window.location.pathname).toBe("/opportunities/manual-created-opportunity");
  });

  it("loads outreach and persists outreach status updates", async () => {
    window.history.pushState({}, "", "/outreach");
    const initialOutreach = {
      id: "outreach-1",
      opportunityId: idealVueFreelanceLille.id,
      recruiterName: "Marie",
      recruiterCompany: "Acme Recruiting",
      relatedOpportunityTitle: idealVueFreelanceLille.title,
      channel: "email",
      status: "sent",
      message: "Bonjour",
      followUpAt: "2026-06-01",
      createdAt: "2026-05-28T10:00:00.000Z",
      updatedAt: "2026-05-28T10:00:00.000Z"
    };
    const updatedOutreach = {
      ...initialOutreach,
      status: "replied",
      repliedAt: "2026-06-02T10:00:00.000Z"
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [idealVueFreelanceLille] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ outreachItems: [initialOutreach] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ outreach: updatedOutreach })
        })
    );

    render(<Root />);

    await screen.findByRole("heading", { level: 2, name: "Marie" });
    fireEvent.click(screen.getByRole("button", { name: "Mark replied" }));

    await waitFor(() => {
      expect(screen.getByText("replied")).toBeInTheDocument();
    });
  });

  it("creates an outreach draft from the opportunity detail helper", async () => {
    window.history.pushState({}, "", `/opportunities/${idealVueFreelanceLille.id}`);
    const createdOutreach = {
      id: "outreach-created",
      opportunityId: idealVueFreelanceLille.id,
      channel: "email",
      status: "draft",
      subject: "Intro mission Vue",
      message: "Message edited before saving.",
      createdAt: "2026-06-02T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z"
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [idealVueFreelanceLille] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ outreach: createdOutreach })
        })
    );

    render(<Root />);

    await screen.findByRole("heading", { level: 1, name: idealVueFreelanceLille.title });

    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Intro mission Vue" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Message edited before saving." } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        "/api/outreach",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            opportunityId: idealVueFreelanceLille.id,
            channel: "email",
            subject: "Intro mission Vue",
            message: "Message edited before saving."
          })
        })
      );
    });
  });

  it("loads reports and opens a markdown report", async () => {
    window.history.pushState({}, "", "/reports");
    const reportSummary = {
      id: "2026-06-08-weekly-market-report.md",
      fileName: "2026-06-08-weekly-market-report.md",
      title: "Weekly Market Report",
      generatedDate: "2026-06-08"
    };
    const reportDetail = {
      ...reportSummary,
      markdown: "# Weekly Market Report\n\n## Actions\n\n- Contact the best opportunity."
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ opportunities: [] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ reports: [reportSummary] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ report: reportDetail })
        })
    );

    render(<Root />);

    fireEvent.click(await screen.findByRole("button", { name: /Weekly Market Report/ }));

    expect(await screen.findByText("Contact the best opportunity.")).toBeInTheDocument();
  });
});
