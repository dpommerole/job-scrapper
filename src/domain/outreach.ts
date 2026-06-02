export type OutreachStatus = "draft" | "sent" | "replied" | "follow_up_needed" | "closed";

export type OutreachChannel = "email" | "linkedin" | "platform-message" | "phone" | "other";

export type Outreach = {
  id: string;
  opportunityId?: string;
  recruiterName?: string;
  recruiterCompany?: string;
  relatedOpportunityTitle?: string;
  channel: OutreachChannel;
  status: OutreachStatus;
  subject?: string;
  message: string;
  sentAt?: string;
  followUpAt?: string;
  repliedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
