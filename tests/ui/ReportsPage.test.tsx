import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportDetail, ReportSummary } from "../../src/application/index.js";
import { ReportsPage } from "../../src/ui/pages/ReportsPage.js";

const reportSummary: ReportSummary = {
  id: "2026-06-08-weekly-market-report.md",
  fileName: "2026-06-08-weekly-market-report.md",
  title: "Weekly Market Report",
  generatedDate: "2026-06-08"
};

const reportDetail: ReportDetail = {
  ...reportSummary,
  markdown: [
    "# Weekly Market Report",
    "",
    "Generated at: 2026-06-08T09:00:00.000Z",
    "",
    "## Metrics",
    "",
    "| Metric | Value |",
    "| --- | --- |",
    "| Hot opportunities | 1 |",
    "",
    "## Recommended actions",
    "",
    "- Contact the Vue lead first."
  ].join("\n")
};

describe("ReportsPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the report list", () => {
    render(<ReportsPage reports={[reportSummary]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Weekly Market Report/ })).toBeInTheDocument();
    expect(screen.getByText("Select a report")).toBeInTheDocument();
  });

  it("opens a report from the list", () => {
    const onOpenReport = vi.fn();
    render(<ReportsPage reports={[reportSummary]} onOpenReport={onOpenReport} />);

    fireEvent.click(screen.getByRole("button", { name: /Weekly Market Report/ }));

    expect(onOpenReport).toHaveBeenCalledWith("2026-06-08-weekly-market-report.md");
  });

  it("renders markdown content", () => {
    render(<ReportsPage reports={[reportSummary]} selectedReport={reportDetail} />);

    const report = screen.getByLabelText("Report detail");
    expect(within(report).getByRole("heading", { level: 1, name: "Weekly Market Report" })).toBeInTheDocument();
    expect(within(report).getByRole("table")).toBeInTheDocument();
    expect(within(report).getByText("Contact the Vue lead first.")).toBeInTheDocument();
  });

  it("renders an empty state", () => {
    render(<ReportsPage reports={[]} />);

    expect(screen.getByText("No reports yet")).toBeInTheDocument();
  });
});
