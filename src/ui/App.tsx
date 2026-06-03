import type { CreateManualOpportunityInput, ReportDetail, ReportSummary } from "../application/index.js";
import type { Opportunity, OpportunityStatus, Outreach, OutreachChannel, OutreachStatus } from "../domain/index.js";
import { AppLayout } from "./components/AppLayout.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { EmptyPage } from "./pages/EmptyPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { OpportunityCreatePage } from "./pages/OpportunityCreatePage.js";
import { OpportunityDetailPage } from "./pages/OpportunityDetailPage.js";
import { OutreachPage } from "./pages/OutreachPage.js";
import { OpportunitiesPage } from "./pages/OpportunitiesPage.js";
import { ReportsPage } from "./pages/ReportsPage.js";
import { resolveRoute } from "./routes.js";

export type AppProps = {
  pathname?: string;
  opportunities?: Opportunity[];
  isSavingOpportunity?: boolean;
  opportunitySaveError?: string | undefined;
  onUpdateOpportunity?: (id: string, update: { status: OpportunityStatus; notes: string }) => void;
  isCreatingOpportunity?: boolean;
  opportunityCreateError?: string | undefined;
  onCreateOpportunity?: (input: CreateManualOpportunityInput) => void;
  outreachItems?: Outreach[];
  isCreatingOutreach?: boolean;
  isSavingOutreach?: boolean;
  outreachSaveError?: string | undefined;
  onCreateOutreachDraft?: (input: {
    opportunityId: string;
    channel: OutreachChannel;
    followUpAt?: string;
    subject?: string;
    message?: string;
  }) => void;
  onUpdateOutreach?: (
    id: string,
    update: { status?: OutreachStatus; channel?: OutreachChannel; followUpAt?: string; notes?: string }
  ) => void;
  reports?: ReportSummary[];
  selectedReport?: ReportDetail | undefined;
  reportLoadError?: string | undefined;
  onOpenReport?: (id: string) => void;
};

export function App({
  pathname = window.location.pathname,
  opportunities = [],
  isSavingOpportunity,
  opportunitySaveError,
  onUpdateOpportunity,
  isCreatingOpportunity,
  opportunityCreateError,
  onCreateOpportunity,
  outreachItems = [],
  isCreatingOutreach,
  isSavingOutreach,
  outreachSaveError,
  onCreateOutreachDraft,
  onUpdateOutreach,
  reports = [],
  selectedReport,
  reportLoadError,
  onOpenReport
}: AppProps) {
  const route = resolveRoute(pathname);
  const opportunityId = getOpportunityIdFromPath(pathname);

  return (
    <AppLayout currentPath={pathname}>
      {route?.path === "/" ? (
        <DashboardPage opportunities={opportunities} outreachItems={outreachItems} reports={reports} />
      ) : route?.path === "/opportunities" ? (
        <OpportunitiesPage opportunities={opportunities} />
      ) : route?.path === "/opportunities/new" ? (
        <OpportunityCreatePage
          isCreating={isCreatingOpportunity}
          createError={opportunityCreateError}
          onCreateOpportunity={onCreateOpportunity}
        />
      ) : route?.path === "/opportunities/:id" ? (
        <OpportunityDetailPage
          opportunity={opportunities.find((opportunity) => opportunity.id === opportunityId)}
          isSaving={isSavingOpportunity}
          saveError={opportunitySaveError}
          onUpdateOpportunity={onUpdateOpportunity}
          isCreatingOutreach={isCreatingOutreach}
          outreachCreateError={outreachSaveError}
          onCreateOutreachDraft={onCreateOutreachDraft}
        />
      ) : route?.path === "/outreach" ? (
        <OutreachPage
          opportunities={opportunities}
          outreachItems={outreachItems}
          isCreatingOutreach={isCreatingOutreach}
          isSavingOutreach={isSavingOutreach}
          outreachSaveError={outreachSaveError}
          onCreateOutreachDraft={onCreateOutreachDraft}
          onUpdateOutreach={onUpdateOutreach}
        />
      ) : route?.path === "/reports" ? (
        <ReportsPage
          reports={reports}
          selectedReport={selectedReport}
          loadError={reportLoadError}
          onOpenReport={onOpenReport}
        />
      ) : route ? (
        <EmptyPage route={route} />
      ) : (
        <NotFoundPage />
      )}
    </AppLayout>
  );
}

function getOpportunityIdFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/opportunities\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
