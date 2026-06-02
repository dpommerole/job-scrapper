import type { OpportunityClass } from "../domain/index.js";

export type { ContractType, Opportunity, OpportunityClass, OpportunityStatus, RemotePolicy } from "../domain/index.js";

export type ScoreDimension =
  | "technicalFit"
  | "seniorityOwnershipFit"
  | "contractBusinessFit"
  | "locationRemoteFit"
  | "strategicValue"
  | "clarityCredibility";

export type ScoreBreakdownItem = {
  dimension: ScoreDimension;
  score: number;
  maxScore: number;
  positiveSignals: string[];
  negativeSignals: string[];
  missingInformation: string[];
};

export type OpportunityRecommendation =
  | "contact immediately"
  | "save for later"
  | "ask for missing details"
  | "monitor"
  | "reject"
  | "archive";

export type ScoringResult = {
  score: number;
  opportunityClass: OpportunityClass;
  recommendation: OpportunityRecommendation;
  confidence: "high" | "medium" | "low";
  breakdown: ScoreBreakdownItem[];
  positiveSignals: string[];
  negativeSignals: string[];
  missingInformation: string[];
};
