import type { OpportunityClass, OpportunityRecommendation } from "./types.js";

export function classifyOpportunity(score: number): OpportunityClass {
  if (score >= 80) return "hot";
  if (score >= 65) return "interesting";
  if (score >= 50) return "maybe";
  if (score >= 35) return "weak";
  return "reject";
}

export function recommendOpportunity(
  score: number,
  opportunityClass: OpportunityClass,
  missingInformation: string[]
): OpportunityRecommendation {
  if (opportunityClass === "reject") return "reject";
  if (score >= 80 && missingInformation.length <= 2) return "contact immediately";
  if (missingInformation.length >= 4 && score >= 50) return "ask for missing details";
  if (opportunityClass === "interesting") return "save for later";
  if (opportunityClass === "maybe" || opportunityClass === "weak") return "monitor";
  return "archive";
}

export function confidenceFromMissingInformation(missingInformation: string[]): "high" | "medium" | "low" {
  if (missingInformation.length <= 2) return "high";
  if (missingInformation.length <= 5) return "medium";
  return "low";
}
