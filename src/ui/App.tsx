import type { Opportunity } from "../domain/index.js";
import { AppLayout } from "./components/AppLayout.js";
import { EmptyPage } from "./pages/EmptyPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { OpportunitiesPage } from "./pages/OpportunitiesPage.js";
import { resolveRoute } from "./routes.js";

export type AppProps = {
  pathname?: string;
  opportunities?: Opportunity[];
};

export function App({ pathname = window.location.pathname, opportunities = [] }: AppProps) {
  const route = resolveRoute(pathname);

  return (
    <AppLayout currentPath={pathname}>
      {route?.path === "/opportunities" ? (
        <OpportunitiesPage opportunities={opportunities} />
      ) : route ? (
        <EmptyPage route={route} />
      ) : (
        <NotFoundPage />
      )}
    </AppLayout>
  );
}
