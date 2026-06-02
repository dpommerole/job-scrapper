import type { OpportunityListItemViewModel } from "../../view-models/opportunityListViewModel.js";

export type OpportunityListProps = {
  opportunities: OpportunityListItemViewModel[];
};

export function OpportunityList({ opportunities }: OpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <section className="empty-state" aria-label="Empty opportunities">
        <h2>No opportunities yet</h2>
        <p>Imported or manually added opportunities will appear here once they are available.</p>
      </section>
    );
  }

  return (
    <div className="opportunity-list" aria-label="Opportunity list">
      {opportunities.map((opportunity) => (
        <article className="opportunity-row" key={opportunity.id} aria-label={opportunity.title}>
          <div className="opportunity-main">
            <a className="opportunity-title" href={opportunity.detailPath}>
              {opportunity.title}
            </a>
            <p className="opportunity-meta">
              {opportunity.company} · {opportunity.source} · {opportunity.location}
            </p>
            <div className="skill-list" aria-label={`Required skills for ${opportunity.title}`}>
              {opportunity.requiredSkills.length > 0 ? (
                opportunity.requiredSkills.map((skill) => (
                  <span className="skill-pill" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="muted">No required skills listed</span>
              )}
            </div>
          </div>
          <dl className="opportunity-facts">
            <div>
              <dt>Score</dt>
              <dd>{opportunity.score}</dd>
            </div>
            <div>
              <dt>Class</dt>
              <dd>{opportunity.opportunityClass}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{opportunity.status}</dd>
            </div>
            <div>
              <dt>Remote policy</dt>
              <dd>{opportunity.remotePolicy}</dd>
            </div>
            <div>
              <dt>Contract</dt>
              <dd>{opportunity.contractType}</dd>
            </div>
            <div>
              <dt>Collected</dt>
              <dd>{opportunity.collectedAt}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
