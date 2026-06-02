import { useState } from "react";
import type { Outreach, OutreachChannel, OutreachStatus } from "../../../domain/index.js";
import type { OutreachViewModel } from "../../view-models/outreachViewModel.js";

export type OutreachListProps = {
  outreachItems: OutreachViewModel[];
  isSaving?: boolean;
  saveError?: string | undefined;
  onUpdateOutreach?: (id: string, update: OutreachActionUpdate) => void;
};

export type OutreachActionUpdate = {
  status?: OutreachStatus;
  channel?: OutreachChannel;
  followUpAt?: string;
  notes?: string;
};

export function OutreachList({ outreachItems, isSaving = false, saveError, onUpdateOutreach }: OutreachListProps) {
  if (outreachItems.length === 0) {
    return (
      <section className="empty-state">
        <h2>No outreach yet</h2>
        <p>Create a draft from an opportunity to start tracking recruiter contact and follow-ups.</p>
      </section>
    );
  }

  return (
    <section className="outreach-list" aria-label="Outreach items">
      {saveError ? (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      ) : null}
      {outreachItems.map((outreach) => (
        <OutreachRow
          key={outreach.id}
          outreach={outreach}
          isSaving={isSaving}
          onUpdateOutreach={onUpdateOutreach}
        />
      ))}
    </section>
  );
}

function OutreachRow({
  outreach,
  isSaving,
  onUpdateOutreach
}: {
  outreach: OutreachViewModel;
  isSaving: boolean;
  onUpdateOutreach?: (id: string, update: OutreachActionUpdate) => void;
}) {
  const [followUpAt, setFollowUpAt] = useState(outreach.followUpAt?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(outreach.notes ?? "");

  return (
    <article className="outreach-row">
      <div className="outreach-main">
        <div className="outreach-title-line">
          <h2>{outreach.displayRecruiter}</h2>
          {outreach.isFollowUpDue ? <span className="status-badge urgent">Follow-up due</span> : null}
        </div>
        <p className="opportunity-meta">
          {outreach.displayCompany} · {outreach.displayOpportunity}
        </p>
        <dl className="opportunity-facts">
          <Fact label="Status" value={outreach.status} />
          <Fact label="Channel" value={outreach.channel} />
          <Fact label="Sent" value={outreach.displaySentAt} />
          <Fact label="Follow-up" value={outreach.displayFollowUpAt} />
          <Fact label="Next action" value={outreach.nextAction} />
        </dl>
      </div>

      <div className="outreach-actions">
        <div className="button-row">
          <ActionButton
            label="Mark sent"
            disabled={isSaving || outreach.status === "sent"}
            onClick={() => onUpdateOutreach?.(outreach.id, { status: "sent" })}
          />
          <ActionButton
            label="Mark replied"
            disabled={isSaving || outreach.status === "replied"}
            onClick={() => onUpdateOutreach?.(outreach.id, { status: "replied" })}
          />
          <ActionButton
            label="Close"
            disabled={isSaving || outreach.status === "closed"}
            onClick={() => onUpdateOutreach?.(outreach.id, { status: "closed" })}
          />
        </div>
        <label>
          Follow-up date
          <input type="date" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} />
        </label>
        <button type="button" disabled={isSaving} onClick={() => onUpdateOutreach?.(outreach.id, { followUpAt })}>
          Set follow-up
        </button>
        <label>
          Notes
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <button type="button" disabled={isSaving} onClick={() => onUpdateOutreach?.(outreach.id, { notes })}>
          Save notes
        </button>
      </div>
    </article>
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

function ActionButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}

export type OutreachListItem = Outreach;
