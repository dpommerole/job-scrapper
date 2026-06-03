import type { ReportDetail, ReportSummary } from "../../application/index.js";
import { MarkdownReport } from "../components/reports/MarkdownReport.js";
import { ReportList } from "../components/reports/ReportList.js";

export type ReportsPageProps = {
  reports: ReportSummary[];
  selectedReport?: ReportDetail | undefined;
  loadError?: string | undefined;
  onOpenReport?: (id: string) => void;
};

export function ReportsPage({ reports, selectedReport, loadError, onOpenReport }: ReportsPageProps) {
  return (
    <section className="page-section-wide reports-layout">
      <div className="page-heading reports-heading">
        <div>
          <p className="eyebrow">Reporting</p>
          <h1>Reports</h1>
        </div>
      </div>

      <ReportList reports={reports} selectedReportId={selectedReport?.id} onOpenReport={onOpenReport} />

      <section className="report-detail" aria-label="Report detail">
        {loadError ? (
          <p className="form-error" role="alert">
            {loadError}
          </p>
        ) : null}
        {selectedReport ? (
          <MarkdownReport markdown={selectedReport.markdown} />
        ) : reports.length > 0 ? (
          <div className="empty-state">
            <h2>Select a report</h2>
            <p>Open a generated markdown report to read its recommendations.</p>
          </div>
        ) : null}
      </section>
    </section>
  );
}
