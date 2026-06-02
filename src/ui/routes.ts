export type AppRoute = {
  path: string;
  label: string;
  title: string;
  description: string;
};

export const appRoutes = [
  {
    path: "/",
    label: "Dashboard",
    title: "Dashboard",
    description: "Immediate actions, recent opportunities, follow-ups, and latest reports will appear here."
  },
  {
    path: "/opportunities",
    label: "Opportunities",
    title: "Opportunities",
    description: "Persisted opportunities will be listed here with score, status, source, and key mission details."
  },
  {
    path: "/opportunities/new",
    label: "Add opportunity",
    title: "Add opportunity",
    description: "Manual opportunity creation will be available here."
  },
  {
    path: "/sources",
    label: "Sources",
    title: "Sources",
    description: "Source health, quality, and collection methods will be reviewed here."
  },
  {
    path: "/outreach",
    label: "Outreach",
    title: "Outreach",
    description: "Recruiter conversations, drafts, and follow-ups will be tracked here."
  },
  {
    path: "/reports",
    label: "Reports",
    title: "Reports",
    description: "Generated markdown reports will be browsed here."
  }
] satisfies AppRoute[];

export const detailRoute: AppRoute = {
  path: "/opportunities/:id",
  label: "Opportunity detail",
  title: "Opportunity detail",
  description: "A selected opportunity will show its description, score explanation, missing information, and source attribution here."
};

export function resolveRoute(pathname: string): AppRoute | undefined {
  const normalizedPath = normalizePath(pathname);
  const staticRoute = appRoutes.find((route) => route.path === normalizedPath);
  if (staticRoute) return staticRoute;

  if (/^\/opportunities\/[^/]+$/.test(normalizedPath)) {
    return detailRoute;
  }

  return undefined;
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname || "/";
}
