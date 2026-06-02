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
    ["/", "Dashboard"],
    ["/opportunities/new", "Add opportunity"],
    ["/sources", "Sources"],
    ["/outreach", "Outreach"],
    ["/reports", "Reports"],
    ["/opportunities/abc", "Opportunity detail"]
  ])("renders the %s page title", (pathname, title) => {
    render(<App pathname={pathname} />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("No data yet")).toBeInTheDocument();
  });

  it("renders the opportunities page route", () => {
    render(<App pathname="/opportunities" />);

    expect(screen.getByRole("heading", { level: 1, name: "Opportunities" })).toBeInTheDocument();
    expect(screen.getByText("No opportunities yet")).toBeInTheDocument();
  });

  it("renders a not found page for unknown routes", () => {
    render(<App pathname="/unknown" />);

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
  });
});
