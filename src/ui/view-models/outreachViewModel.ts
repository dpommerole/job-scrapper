import type { Outreach } from "../../domain/index.js";

export type OutreachViewModel = Outreach & {
  displayRecruiter: string;
  displayCompany: string;
  displayOpportunity: string;
  displaySentAt: string;
  displayFollowUpAt: string;
  isFollowUpDue: boolean;
  nextAction: string;
};

export function createOutreachViewModels(outreachItems: Outreach[], now = new Date().toISOString()): OutreachViewModel[] {
  const today = now.slice(0, 10);

  return outreachItems.map((outreach) => ({
    ...outreach,
    displayRecruiter: outreach.recruiterName ?? "Recruiter unknown",
    displayCompany: outreach.recruiterCompany ?? "Company unknown",
    displayOpportunity: outreach.relatedOpportunityTitle ?? outreach.opportunityId ?? "Opportunity not linked",
    displaySentAt: formatDate(outreach.sentAt),
    displayFollowUpAt: formatDate(outreach.followUpAt),
    isFollowUpDue: Boolean(outreach.followUpAt && outreach.followUpAt.slice(0, 10) <= today && outreach.status !== "closed"),
    nextAction: getNextAction(outreach)
  }));
}

function formatDate(value: string | undefined): string {
  return value?.slice(0, 10) || "Not set";
}

function getNextAction(outreach: Outreach): string {
  if (outreach.status === "draft") return "Send draft";
  if (outreach.status === "sent") return outreach.followUpAt ? "Wait or follow up" : "Set follow-up";
  if (outreach.status === "follow_up_needed") return "Follow up";
  if (outreach.status === "replied") return "Review reply";
  return "Closed";
}
