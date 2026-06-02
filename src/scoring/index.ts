export type {
  ContractType,
  Opportunity,
  OpportunityClass,
  OpportunityRecommendation,
  OpportunityStatus,
  RemotePolicy,
  ScoreBreakdownItem,
  ScoreDimension,
  ScoringResult
} from "./types.js";

export {
  classifyOpportunity,
  confidenceFromMissingInformation,
  recommendOpportunity
} from "./classification.js";
export { detectMissingInformation } from "./missingInformation.js";
export { scoreOpportunity } from "./scoreOpportunity.js";
