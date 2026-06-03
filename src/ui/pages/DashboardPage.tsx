import type { ReactNode } from "react";
import type { ReportSummary } from "../../application/index.js";
import type { Opportunity, Outreach } from "../../domain/index.js";
import { createDashboardViewModel } from "../view-models/dashboardViewModel.js";

export type DashboardPageProps = {
  opportunities: Opportunity[];
  outreachItems: Outreach[];
  reports: ReportSummary[];
};

export function DashboardPage({ opportunities, outreachItems, reports }: DashboardPageProps) {
  const dashboard = createDashboardViewModel(opportunities, outreachItems, reports);

  return (
    <section className="page-section-wide dashboard-page">
      <header className="page-heading">
        <p className="eyebrow">Today</p>
        <h1>Dashboard</h1>
      </header>

      <section className="dashboard-metrics" aria-label="Dashboard metrics">
        <MetricCard label="Hot opportunities" value={dashboard.metrics.hotOpportunities} href="/opportunities" />
        <MetricCard label="Interesting opportunities" value={dashboard.metrics.interestingOpportunities} href="/opportunities" />
        <MetricCard label="Follow-ups due" value={dashboard.metrics.followUpsDue} href="/outreach" />
        <MetricCard label="Imported today" value={dashboard.metrics.latestImported} href="/opportunities" />
      </section>

      <div className="dashboard-grid">
        <DashboardPanel title="Hot opportunities" href="/opportunities" emptyText="No hot opportunities yet.">
          {dashboard.hotOpportunities.length > 0 ? <OpportunityLinks opportunities={dashboard.hotOpportunities} /> : null}
        </DashboardPanel>
        <DashboardPanel title="Interesting opportunities" href="/opportunities" emptyText="No interesting opportunities yet.">
          {dashboard.interestingOpportunities.length > 0 ? (
            <OpportunityLinks opportunities={dashboard.interestingOpportunities} />
          ) : null}
        </DashboardPanel>
        <DashboardPanel title="Follow-ups due" href="/outreach" emptyText="No follow-ups due.">
          {dashboard.followUpsDue.length > 0 ? <FollowUpLinks outreachItems={dashboard.followUpsDue} /> : null}
        </DashboardPanel>
        <DashboardPanel title="Latest imported" href="/opportunities" emptyText="No opportunities imported yet.">
          {dashboard.latestOpportunities.length > 0 ? <OpportunityLinks opportunities={dashboard.latestOpportunities} /> : null}
        </DashboardPanel>
        <DashboardPanel title="Latest report" href="/reports" emptyText="No report generated yet.">
          {dashboard.latestReport ? <ReportLink report={dashboard.latestReport} /> : null}
        </DashboardPanel>
        <DashboardPanel title="Source review" href="/sources" emptyText="Review source quality after the next report.">
          {dashboard.latestReport ? <p className="muted">Latest report can guide source decisions.</p> : null}
        </DashboardPanel>
      </div>
    </section>
  );
}

function MetricCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <a className="metric-card" href={href}>
      <span>{label}</span>
      <strong>{value}</strong>
    </a>
  );
}

function DashboardPanel({
  title,
  href,
  emptyText,
  children
}: {
  title: string;
  href: string;
  emptyText: string;
  children?: ReactNode;
}) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-panel-heading">
        <h2>{title}</h2>
        <a href={href}>Open</a>
      </div>
      {children ? children : <p className="muted">{emptyText}</p>}
    </section>
  );
}

function OpportunityLinks({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <ul className="dashboard-link-list">
      {opportunities.map((opportunity) => (
        <li key={opportunity.id}>
          <a href={`/opportunities/${encodeURIComponent(opportunity.id)}`}>{opportunity.title}</a>
          <span>
            {opportunity.score ?? "n/a"} - {opportunity.source}
          </span>
        </li>
      ))}
    </ul>
  );
}

function FollowUpLinks({ outreachItems }: { outreachItems: Outreach[] }) {
  return (
    <ul className="dashboard-link-list">
      {outreachItems.map((outreach) => (
        <li key={outreach.id}>
          <a href="/outreach">{outreach.recruiterName ?? outreach.recruiterCompany ?? "Recruiter unknown"}</a>
          <span>
            {outreach.relatedOpportunityTitle ?? "Opportunity not linked"} - {outreach.followUpAt?.slice(0, 10)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReportLink({ report }: { report: ReportSummary }) {
  return (
    <ul className="dashboard-link-list">
      <li>
        <a href="/reports">{report.title}</a>
        <span>{report.generatedDate ?? report.fileName}</span>
      </li>
    </ul>
  );
}
