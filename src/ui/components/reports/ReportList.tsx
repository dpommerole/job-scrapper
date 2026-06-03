import type { ReportSummary } from "../../../application/index.js";

export type ReportListProps = {
  reports: ReportSummary[];
  selectedReportId?: string | undefined;
  onOpenReport?: (id: string) => void;
};

export function ReportList({ reports, selectedReportId, onOpenReport }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <section className="empty-state">
        <h2>No reports yet</h2>
        <p>Generate a weekly markdown report from the CLI, then it will appear here.</p>
      </section>
    );
  }

  return (
    <section className="report-list" aria-label="Generated reports">
      {reports.map((report) => (
        <button
          className="report-list-item"
          type="button"
          key={report.id}
          aria-pressed={report.id === selectedReportId}
          onClick={() => onOpenReport?.(report.id)}
        >
          <span>{report.title}</span>
          <small>{report.generatedDate ?? report.fileName}</small>
        </button>
      ))}
    </section>
  );
}
