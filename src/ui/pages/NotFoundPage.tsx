export function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">Not found</p>
        <h1>Page not found</h1>
      </div>
      <div className="empty-state">
        <h2>No matching route</h2>
        <p>The requested page does not exist in the MVP navigation.</p>
      </div>
    </section>
  );
}
