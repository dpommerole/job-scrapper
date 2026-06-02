export type OpportunityStatus =
  | "new"
  | "interesting"
  | "contacted"
  | "replied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

export type OpportunityClass = "hot" | "interesting" | "maybe" | "weak" | "reject";

export type RemotePolicy = "remote" | "hybrid" | "onsite" | "unknown";

export type ContractType = "freelance" | "cdi" | "cdd" | "internship" | "unknown";

export type Opportunity = {
  id: string;
  source: string;
  sourceUrl?: string;

  title: string;
  company?: string;

  recruiterName?: string;
  recruiterCompany?: string;
  recruiterContactUrl?: string;
  recruiterEmail?: string;

  location?: string;
  remotePolicy: RemotePolicy;
  contractType: ContractType;

  seniority?: string;
  duration?: string;
  startDate?: string;

  rateMin?: number;
  rateMax?: number;
  currency?: "EUR";

  requiredSkills: string[];
  niceToHaveSkills: string[];

  description: string;

  publishedAt?: string;
  collectedAt: string;
  updatedAt?: string;

  status: OpportunityStatus;
  score?: number;
  opportunityClass?: OpportunityClass;

  positiveSignals?: string[];
  negativeSignals?: string[];
  missingInformation?: string[];

  notes?: string;
};
