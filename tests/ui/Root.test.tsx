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
});
