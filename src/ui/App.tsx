import type { Opportunity } from "../domain/index.js";
import { AppLayout } from "./components/AppLayout.js";
import { EmptyPage } from "./pages/EmptyPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { OpportunityDetailPage } from "./pages/OpportunityDetailPage.js";
import { OpportunitiesPage } from "./pages/OpportunitiesPage.js";
import { resolveRoute } from "./routes.js";

export type AppProps = {
  pathname?: string;
  opportunities?: Opportunity[];
};

export function App({ pathname = window.location.pathname, opportunities = [] }: AppProps) {
  const route = resolveRoute(pathname);
  const opportunityId = getOpportunityIdFromPath(pathname);

  return (
    <AppLayout currentPath={pathname}>
      {route?.path === "/opportunities" ? (
        <OpportunitiesPage opportunities={opportunities} />
      ) : route?.path === "/opportunities/:id" ? (
        <OpportunityDetailPage opportunity={opportunities.find((opportunity) => opportunity.id === opportunityId)} />
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
