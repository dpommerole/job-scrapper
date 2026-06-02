import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/ui/App.js";

describe("OpportunityCreatePage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the manual creation form", () => {
    render(<App pathname="/opportunities/new" />);

    expect(screen.getByRole("heading", { level: 1, name: "Add opportunity" })).toBeInTheDocument();
    expect(screen.getByLabelText("Source")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("shows validation errors for missing required fields", () => {
    render(<App pathname="/opportunities/new" onCreateOpportunity={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Create opportunity" }));

    expect(screen.getByText("Missing required field: source")).toBeInTheDocument();
    expect(screen.getByText("Missing required field: title")).toBeInTheDocument();
    expect(screen.getByText("Missing required field: description")).toBeInTheDocument();
  });

  it("submits a valid form with parsed field values", () => {
    const onCreateOpportunity = vi.fn();
    render(<App pathname="/opportunities/new" onCreateOpportunity={onCreateOpportunity} />);

    fireEvent.change(screen.getByLabelText("Source"), { target: { value: "Manual lead" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Lead Frontend Vue" } });
    fireEvent.change(screen.getByLabelText("Remote policy"), { target: { value: "hybrid" } });
    fireEvent.change(screen.getByLabelText("Contract type"), { target: { value: "freelance" } });
    fireEvent.change(screen.getByLabelText("Required skills"), { target: { value: "Vue.js; TypeScript" } });
    fireEvent.change(screen.getByLabelText("Nice-to-have skills"), { target: { value: "Design system" } });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Mission frontend senior Vue TypeScript." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Create opportunity" }));

    expect(onCreateOpportunity).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "Manual lead",
        title: "Lead Frontend Vue",
        remotePolicy: "hybrid",
        contractType: "freelance",
        requiredSkills: "Vue.js; TypeScript",
        niceToHaveSkills: "Design system",
        description: "Mission frontend senior Vue TypeScript."
      })
    );
  });

  it("shows API creation errors", () => {
    render(<App pathname="/opportunities/new" opportunityCreateError="Could not create opportunity" />);

    expect(screen.getByText("Could not create opportunity")).toBeInTheDocument();
  });
});
