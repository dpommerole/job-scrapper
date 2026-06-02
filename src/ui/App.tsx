import { AppLayout } from "./components/AppLayout.js";
import { EmptyPage } from "./pages/EmptyPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { resolveRoute } from "./routes.js";

export type AppProps = {
  pathname?: string;
};

export function App({ pathname = window.location.pathname }: AppProps) {
  const route = resolveRoute(pathname);

  return (
    <AppLayout currentPath={pathname}>
      {route ? <EmptyPage route={route} /> : <NotFoundPage />}
    </AppLayout>
  );
}
