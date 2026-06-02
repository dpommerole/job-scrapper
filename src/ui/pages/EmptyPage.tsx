import type { AppRoute } from "../routes.js";

export type EmptyPageProps = {
  route: AppRoute;
};

export function EmptyPage({ route }: EmptyPageProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">MVP screen</p>
        <h1>{route.title}</h1>
      </div>
      <div className="empty-state">
        <h2>No data yet</h2>
        <p>{route.description}</p>
      </div>
    </section>
  );
}
