import type { Opportunity, OutreachChannel } from "../../../domain/index.js";

export type OutreachDraftFormProps = {
  opportunities: Opportunity[];
  isCreating?: boolean;
  onCreateDraft?: (input: { opportunityId: string; channel: OutreachChannel; followUpAt?: string }) => void;
};

const channels: OutreachChannel[] = ["email", "linkedin", "platform-message", "phone", "other"];

export function OutreachDraftForm({ opportunities, isCreating = false, onCreateDraft }: OutreachDraftFormProps) {
  return (
    <form
      className="outreach-draft-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const opportunityId = String(formData.get("opportunityId") ?? "");
        const channel = String(formData.get("channel") ?? "email") as OutreachChannel;
        const followUpAt = String(formData.get("followUpAt") ?? "").trim();

        if (!opportunityId) return;
        onCreateDraft?.({ opportunityId, channel, followUpAt: followUpAt || undefined });
      }}
    >
      <label>
        Opportunity
        <select name="opportunityId" disabled={opportunities.length === 0}>
          {opportunities.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>
              {opportunity.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Channel
        <select name="channel">
          {channels.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </label>
      <label>
        Follow-up date
        <input name="followUpAt" type="date" />
      </label>
      <button type="submit" disabled={isCreating || opportunities.length === 0}>
        {isCreating ? "Creating..." : "Create outreach draft"}
      </button>
    </form>
  );
}
