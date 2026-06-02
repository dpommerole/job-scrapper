import type { OpportunityDetailViewModel } from "../../view-models/opportunityDetailViewModel.js";

export type OpportunityDetailProps = {
  opportunity: OpportunityDetailViewModel;
};

export function OpportunityDetail({ opportunity }: OpportunityDetailProps) {
  return (
    <div className="detail-layout">
      <section className="detail-panel detail-panel-main" aria-label="Opportunity description">
        <div className="detail-heading">
          <p className="eyebrow">Opportunity detail</p>
          <h1>{opportunity.title}</h1>
          <p className="detail-subtitle">
            {opportunity.company} · {opportunity.source} · {opportunity.location}
          </p>
        </div>
        <p className="long-text">{opportunity.description}</p>
      </section>

      <aside className="detail-panel" aria-label="Score summary">
        <dl className="detail-score-grid">
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
        </dl>
      </aside>

      <section className="detail-panel" aria-label="Mission facts">
        <h2>Mission</h2>
        <dl className="detail-facts">
          <Fact label="Company" value={opportunity.company} />
          <Fact label="Recruiter" value={opportunity.recruiter} />
          <Fact label="Remote policy" value={opportunity.remotePolicy} />
          <Fact label="Contract" value={opportunity.contractType} />
          <Fact label="Duration" value={opportunity.duration} />
          <Fact label="Start date" value={opportunity.startDate} />
          <Fact label="Rate" value={opportunity.rateRange} />
          <Fact label="Source" value={opportunity.source} />
        </dl>
        {opportunity.sourceUrl ? (
          <a className="source-link" href={opportunity.sourceUrl}>
            View source
          </a>
        ) : null}
      </section>

      <section className="detail-panel" aria-label="Skills">
        <h2>Skills</h2>
        <SkillSection title="Required" skills={opportunity.requiredSkills} emptyText="No required skills listed" />
        <SkillSection title="Nice to have" skills={opportunity.niceToHaveSkills} emptyText="No nice-to-have skills listed" />
      </section>

      <section className="detail-panel" aria-label="Score explanation">
        <h2>Score explanation</h2>
        <SignalList title="Positive signals" items={opportunity.positiveSignals} emptyText="No positive signals recorded." />
        <SignalList title="Negative signals" items={opportunity.negativeSignals} emptyText="No negative signals recorded." />
      </section>

      <section className="detail-panel" aria-label="Missing information">
        <h2>Missing information</h2>
        <SignalList title="Missing details" items={opportunity.missingInformation} emptyText="No missing information recorded." />
      </section>

      <section className="detail-panel detail-panel-main" aria-label="Notes">
        <h2>Notes</h2>
        <p className="long-text">{opportunity.notes}</p>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SkillSection({ title, skills, emptyText }: { title: string; skills: string[]; emptyText: string }) {
  return (
    <div className="detail-subsection">
      <h3>{title}</h3>
      <div className="skill-list">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span className="skill-pill" key={skill}>
              {skill}
            </span>
          ))
        ) : (
          <span className="muted">{emptyText}</span>
        )}
      </div>
    </div>
  );
}

function SignalList({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <div className="detail-subsection">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul className="signal-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyText}</p>
      )}
    </div>
  );
}

