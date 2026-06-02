import type { ReactNode } from "react";
import { appRoutes } from "../routes.js";

export type AppLayoutProps = {
  currentPath: string;
  children: ReactNode;
};

export function AppLayout({ currentPath, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <a className="brand" href="/">
          Job Tracker
        </a>
        <nav className="nav-list">
          {appRoutes.map((route) => (
            <a
              aria-current={isActiveRoute(currentPath, route.path) ? "page" : undefined}
              className="nav-link"
              href={route.path}
              key={route.path}
            >
              {route.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="app-main">{children}</main>
    </div>
  );
}

function isActiveRoute(currentPath: string, routePath: string): boolean {
  if (routePath === "/") return currentPath === "/";
  if (routePath === "/opportunities") return currentPath.startsWith("/opportunities") && currentPath !== "/opportunities/new";
  return currentPath === routePath;
}
