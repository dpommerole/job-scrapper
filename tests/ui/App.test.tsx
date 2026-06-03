import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../../src/ui/App.js";
import { appRoutes } from "../../src/ui/routes.js";

describe("App layout and routes", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the base layout and navigation links", () => {
    render(<App pathname="/" />);

    expect(screen.getByRole("link", { name: "Job Tracker" })).toHaveAttribute("href", "/");
    for (const route of appRoutes) {
      expect(screen.getByRole("link", { name: route.label })).toHaveAttribute("href", route.path);
    }
  });

  it.each([
    ["/sources", "Sources"]
  ])("renders the %s page title", (pathname, title) => {
    render(<App pathname={pathname} />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  it("renders the dashboard route", () => {
    render(<App pathname="/" />);

    expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("No hot opportunities yet.")).toBeInTheDocument();
  });

  it("renders the reports page route", () => {
    render(<App pathname="/reports" />);

    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(screen.getByText("No reports yet")).toBeInTheDocument();
  });

  it("renders the outreach page route", () => {
    render(<App pathname="/outreach" />);

    expect(screen.getByRole("heading", { level: 1, name: "Outreach" })).toBeInTheDocument();
    expect(screen.getByText("No outreach yet")).toBeInTheDocument();
  });

  it("renders the opportunities page route", () => {
    render(<App pathname="/opportunities" />);

    expect(screen.getByRole("heading", { level: 1, name: "Opportunities" })).toBeInTheDocument();
    expect(screen.getByText("No opportunities yet")).toBeInTheDocument();
  });

  it("renders the add opportunity route", () => {
    render(<App pathname="/opportunities/new" />);

    expect(screen.getByRole("heading", { level: 1, name: "Add opportunity" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create opportunity" })).toBeInTheDocument();
  });

  it("renders a detail not found page for unknown opportunity ids", () => {
    render(<App pathname="/opportunities/abc" opportunities={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Opportunity not found" })).toBeInTheDocument();
    expect(screen.getByText("No matching opportunity")).toBeInTheDocument();
  });

  it("renders a not found page for unknown routes", () => {
    render(<App pathname="/unknown" />);

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
  });
});
