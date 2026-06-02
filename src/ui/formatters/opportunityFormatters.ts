import type { ContractType, OpportunityClass, OpportunityStatus, RemotePolicy } from "../../domain/index.js";

const remotePolicyLabels: Record<RemotePolicy, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unknown: "Unknown"
};

const contractTypeLabels: Record<ContractType, string> = {
  freelance: "Freelance",
  cdi: "CDI",
  cdd: "CDD",
  internship: "Internship",
  unknown: "Unknown"
};

const statusLabels: Record<OpportunityStatus, string> = {
  new: "New",
  interesting: "Interesting",
  contacted: "Contacted",
  replied: "Replied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived"
};

const classLabels: Record<OpportunityClass, string> = {
  hot: "Hot",
  interesting: "Interesting",
  maybe: "Maybe",
  weak: "Weak",
  reject: "Reject"
};

export function formatRemotePolicy(remotePolicy: RemotePolicy): string {
  return remotePolicyLabels[remotePolicy];
}

export function formatContractType(contractType: ContractType): string {
  return contractTypeLabels[contractType];
}

export function formatOpportunityStatus(status: OpportunityStatus): string {
  return statusLabels[status];
}

export function formatOpportunityClass(opportunityClass: OpportunityClass | undefined): string {
  return opportunityClass ? classLabels[opportunityClass] : "Not scored";
}

export function formatOpportunityScore(score: number | undefined): string {
  return typeof score === "number" ? String(score) : "n/a";
}

export function formatCollectedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
