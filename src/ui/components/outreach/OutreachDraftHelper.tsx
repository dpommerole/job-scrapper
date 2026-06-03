import { useMemo, useState } from "react";
import { generateOutreachDraft } from "../../../application/index.js";
import type { Opportunity, OutreachChannel } from "../../../domain/index.js";

export type OutreachDraftHelperProps = {
  opportunity: Opportunity;
  isCreating?: boolean;
  createError?: string | undefined;
  onCreateDraft?: (input: {
    opportunityId: string;
    channel: OutreachChannel;
    subject: string;
    message: string;
  }) => void;
};

const channels: OutreachChannel[] = ["email", "linkedin", "platform-message", "phone", "other"];

export function OutreachDraftHelper({ opportunity, isCreating = false, createError, onCreateDraft }: OutreachDraftHelperProps) {
  const generatedDraft = useMemo(() => generateOutreachDraft(opportunity), [opportunity]);
  const [channel, setChannel] = useState<OutreachChannel>("email");
  const [subject, setSubject] = useState(generatedDraft.subject);
  const [message, setMessage] = useState(generatedDraft.message);
  const [copyStatus, setCopyStatus] = useState<string | undefined>();

  function copyDraft() {
    const text = [subject, "", message].join("\n");
    void navigator.clipboard?.writeText(text).then(() => {
      setCopyStatus("Draft copied");
    });
  }

  return (
    <section className="detail-panel detail-panel-main" aria-label="Outreach draft helper">
      <h2>Outreach draft</h2>
      <form
        className="detail-form outreach-helper-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreateDraft?.({
            opportunityId: opportunity.id,
            channel,
            subject,
            message
          });
        }}
      >
        <label>
          Channel
          <select value={channel} onChange={(event) => setChannel(event.target.value as OutreachChannel)}>
            {channels.map((draftChannel) => (
              <option key={draftChannel} value={draftChannel}>
                {draftChannel}
              </option>
            ))}
          </select>
        </label>
        <label>
          Subject
          <input value={subject} onChange={(event) => setSubject(event.target.value)} />
        </label>
        <label>
          Message
          <textarea rows={11} value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        {createError ? <p className="form-error">{createError}</p> : null}
        {copyStatus ? <p className="muted">{copyStatus}</p> : null}
        <div className="button-row">
          <button type="button" onClick={copyDraft}>
            Copy draft
          </button>
          <button type="submit" disabled={isCreating}>
            {isCreating ? "Saving draft..." : "Save draft"}
          </button>
        </div>
      </form>
    </section>
  );
}
