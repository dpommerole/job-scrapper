import type { Opportunity } from "./types.js";

export function detectMissingInformation(opportunity: Opportunity): string[] {
  const missingInformation: string[] = [];

  if (!opportunity.source) missingInformation.push("source");
  if (!opportunity.sourceUrl) missingInformation.push("source URL");
  if (!opportunity.title) missingInformation.push("title");
  if (!opportunity.company && !opportunity.recruiterCompany) missingInformation.push("client/company context");
  if (!opportunity.location && opportunity.remotePolicy === "unknown") missingInformation.push("location policy");
  if (opportunity.contractType === "unknown") missingInformation.push("contract type");
  if (!opportunity.duration) missingInformation.push("duration");
  if (!opportunity.startDate) missingInformation.push("start date");
  if (!opportunity.rateMin && !opportunity.rateMax) missingInformation.push("rate");
  if (opportunity.requiredSkills.length === 0 && opportunity.niceToHaveSkills.length === 0) {
    missingInformation.push("technical stack");
  }
  if (opportunity.description.trim().length < 80) missingInformation.push("responsibilities");

  return unique(missingInformation);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
