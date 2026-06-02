import type {
  Opportunity,
  ScoreBreakdownItem,
  ScoringResult
} from "./types.js";
import {
  classifyOpportunity,
  confidenceFromMissingInformation,
  recommendOpportunity
} from "./classification.js";
import { detectMissingInformation } from "./missingInformation.js";

const ACCEPTABLE_RATE_MIN = 500;
const VERY_LOW_RATE_MAX = 450;

export function scoreOpportunity(opportunity: Opportunity): ScoringResult {
  const breakdown = [
    scoreTechnicalFit(opportunity),
    scoreSeniorityOwnershipFit(opportunity),
    scoreContractBusinessFit(opportunity),
    scoreLocationRemoteFit(opportunity),
    scoreStrategicValue(opportunity),
    scoreClarityCredibility(opportunity)
  ];

  let score = breakdown.reduce((total, item) => total + item.score, 0);
  score = applyGlobalCaps(score, opportunity, breakdown);
  score = clamp(Math.round(score), 0, 100);

  const positiveSignals = unique(breakdown.flatMap((item) => item.positiveSignals));
  const negativeSignals = unique(breakdown.flatMap((item) => item.negativeSignals));
  const missingInformation = unique([
    ...detectMissingInformation(opportunity),
    ...breakdown.flatMap((item) => item.missingInformation)
  ]);
  const opportunityClass = classifyOpportunity(score);

  return {
    score,
    opportunityClass,
    recommendation: recommendOpportunity(score, opportunityClass, missingInformation),
    confidence: confidenceFromMissingInformation(missingInformation),
    breakdown,
    positiveSignals,
    negativeSignals,
    missingInformation
  };
}

function scoreTechnicalFit(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  let score = 0;

  if (matches(opportunity, ["vue", "vue.js", "vuejs", "vue 3", "nuxt"])) {
    score += 8;
    signals.push("Vue.js required");
  }

  if (matches(opportunity, ["typescript", "type script", "ts"])) {
    score += 6;
    signals.push("TypeScript required");
  }

  if (matches(opportunity, ["frontend architecture", "front-end architecture", "architecture front", "spa architecture"])) {
    score += 6;
    signals.push("Frontend architecture responsibility");
  }

  if (matches(opportunity, ["testing strategy", "test strategy", "vitest", "playwright", "cypress", "jest", "tests unitaires", "tests e2e"])) {
    score += 4;
    signals.push("Testing responsibility");
  }

  if (matches(opportunity, ["design system", "component library", "bibliotheque de composants", "storybook"])) {
    score += 3;
    signals.push("Design system or component library");
  }

  if (matches(opportunity, ["performance", "accessibility", "accessibilite", "a11y", "web performance"])) {
    score += 2;
    signals.push("Performance/accessibility concern");
  }

  if (matches(opportunity, ["e-commerce", "ecommerce", "complex business ui", "data-heavy", "data heavy", "dashboard", "plateforme data"])) {
    score += 1;
    signals.push("Complex frontend domain");
  }

  return dimension("technicalFit", score, 30, signals);
}

function scoreSeniorityOwnershipFit(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  let score = 0;

  if (matches(opportunity, ["senior", "sénior", "lead", "expert", "architect", "architecte", "referent frontend", "référent frontend"])) {
    score += 6;
    signals.push("Senior/lead/expert role");
  }

  if (matches(opportunity, ["technical ownership", "ownership", "responsable technique", "lead technique", "tech lead"])) {
    score += 5;
    signals.push("Technical ownership");
  }

  if (matches(opportunity, ["autonomy", "autonomie", "autonomous", "autonome"])) {
    score += 3;
    signals.push("Autonomy expected");
  }

  if (matches(opportunity, ["mentoring", "mentor", "coaching", "team support", "support equipe", "montee en competence"])) {
    score += 2;
    signals.push("Mentoring or team support");
  }

  if (matches(opportunity, ["product collaboration", "collaboration produit", "po", "product owner", "ux", "business", "client-facing"])) {
    score += 2;
    signals.push("Product/business collaboration");
  }

  if (matches(opportunity, ["architecture decisions", "technical decisions", "decisions techniques", "choix techniques"])) {
    score += 2;
    signals.push("Architecture decisions");
  }

  return dimension("seniorityOwnershipFit", score, 20, signals);
}

function scoreContractBusinessFit(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  const negativeSignals: string[] = [];
  const missingInformation: string[] = [];
  let score = 0;

  if (opportunity.contractType === "cdi") {
    score -= 10;
    negativeSignals.push("CDI-only");
  } else if (opportunity.contractType === "freelance" || matches(opportunity, ["freelance", "independant", "indépendant", "mission"])) {
    score += 6;
    signals.push("Freelance explicitly stated");
  } else if (opportunity.contractType === "unknown") {
    score -= 4;
    negativeSignals.push("No contract type");
    missingInformation.push("contract type");
  }

  if (hasAcceptableRate(opportunity)) {
    score += 5;
    signals.push("TJM/rate visible and acceptable");
  } else if (hasVeryLowRate(opportunity)) {
    score -= 8;
    negativeSignals.push("Very low rate");
  } else {
    score -= 3;
    negativeSignals.push("No rate information");
    missingInformation.push("rate");
  }

  if (opportunity.duration || matches(opportunity, ["mois", "months", "mission longue", "long term", "longue duree"])) {
    score += 3;
    signals.push("Mission duration clear");
  } else {
    missingInformation.push("duration");
  }

  if (opportunity.startDate || matches(opportunity, ["asap", "demarrage", "démarrage", "start date"])) {
    score += 2;
    signals.push("Start date clear");
  } else {
    missingInformation.push("start date");
  }

  if (opportunity.company || opportunity.recruiterCompany || matches(opportunity, ["client final", "end client", "grand compte", "credible intermediary"])) {
    score += 2;
    signals.push("Direct client or credible intermediary");
  } else {
    missingInformation.push("client or intermediary");
  }

  if (matches(opportunity, ["mission longue", "strategic project", "projet strategique", "projet stratégique", "scalable", "critical", "critique"])) {
    score += 2;
    signals.push("Scope commercially attractive");
  }

  if (matches(opportunity, ["chaine d'intermediaires", "chaîne d'intermédiaires", "multiple intermediaries"])) {
    score -= 2;
    negativeSignals.push("Unclear intermediary chain");
  }

  return dimension("contractBusinessFit", score, 20, signals, negativeSignals, missingInformation);
}

function scoreLocationRemoteFit(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  const negativeSignals: string[] = [];
  const missingInformation: string[] = [];
  let score = 0;
  const location = normalize(opportunity.location ?? "");

  if (opportunity.remotePolicy === "remote") {
    score += 7;
    signals.push("Full remote");
    if (location.includes("france")) {
      score += 6;
      signals.push("France remote");
    }
  }

  if (opportunity.remotePolicy === "hybrid" && location.includes("lille")) {
    score += 6;
    signals.push("Hybrid Lille");
  }

  if (opportunity.remotePolicy === "hybrid" && (location.includes("paris") || location.includes("ile-de-france") || location.includes("idf"))) {
    score += 5;
    signals.push("Hybrid Paris");
  }

  if (matches(opportunity, ["occasional travel", "deplacements occasionnels", "déplacements occasionnels", "occasionnel"])) {
    score += 3;
    signals.push("Occasional travel");
  }

  if (opportunity.remotePolicy !== "unknown" || opportunity.location) {
    score += 2;
    signals.push("Clear location policy");
  } else {
    score -= 2;
    negativeSignals.push("Location unclear");
    missingInformation.push("location policy");
  }

  if (opportunity.remotePolicy === "onsite" && location && !isNearTargetLocation(location)) {
    score -= 8;
    negativeSignals.push("Full onsite far from Lille/Paris");
  }

  if (matches(opportunity, ["relocation required", "relocalisation requise", "demenagement requis", "déménagement requis"])) {
    score -= 10;
    negativeSignals.push("Relocation required");
  }

  return dimension("locationRemoteFit", score, 15, signals, negativeSignals, missingInformation);
}

function scoreStrategicValue(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  let score = 0;

  if (matches(opportunity, ["senior", "lead", "expert", "referent", "référent", "technical leadership"])) {
    score += 3;
    signals.push("Improves senior positioning");
  }

  if (matches(opportunity, ["architecture", "platform", "plateforme", "migration", "design system"])) {
    score += 3;
    signals.push("Architecture or platform impact");
  }

  if (matches(opportunity, ["testing strategy", "quality", "qualite", "qualité", "vitest", "playwright", "cypress"])) {
    score += 2;
    signals.push("Testing or quality improvement");
  }

  if (matches(opportunity, ["client-facing", "product", "produit", "ux", "po", "product owner"])) {
    score += 1;
    signals.push("Product/client-facing exposure");
  }

  if (matches(opportunity, ["e-commerce", "accessibility", "accessibilite", "performance", "data", "fintech", "retail"])) {
    score += 1;
    signals.push("Domain is valuable for future missions");
  }

  return dimension("strategicValue", score, 10, signals);
}

function scoreClarityCredibility(opportunity: Opportunity): ScoreBreakdownItem {
  const signals: string[] = [];
  const missingInformation: string[] = [];
  let score = 0;

  if (opportunity.requiredSkills.length > 0 || opportunity.niceToHaveSkills.length > 0) {
    score += 1;
    signals.push("Clear technical stack");
  } else {
    missingInformation.push("technical stack");
  }

  if (opportunity.description.length > 80) {
    score += 1;
    signals.push("Clear responsibilities");
  } else {
    missingInformation.push("responsibilities");
  }

  if (opportunity.company || opportunity.recruiterCompany) {
    score += 1;
    signals.push("Clear client/company context");
  } else {
    missingInformation.push("client/company context");
  }

  if (opportunity.contractType !== "unknown" && (opportunity.duration || opportunity.startDate || opportunity.rateMin || opportunity.rateMax)) {
    score += 1;
    signals.push("Clear contract details");
  } else {
    missingInformation.push("contract details");
  }

  if (opportunity.source && (opportunity.publishedAt || opportunity.collectedAt)) {
    score += 1;
    signals.push("Credible/recent source");
  }

  return dimension("clarityCredibility", score, 5, signals, [], missingInformation);
}

function dimension(
  dimensionName: ScoreBreakdownItem["dimension"],
  score: number,
  maxScore: number,
  positiveSignals: string[],
  negativeSignals: string[] = [],
  missingInformation: string[] = []
): ScoreBreakdownItem {
  return {
    dimension: dimensionName,
    score: clamp(score, 0, maxScore),
    maxScore,
    positiveSignals,
    negativeSignals,
    missingInformation
  };
}

function applyGlobalCaps(score: number, opportunity: Opportunity, breakdown: ScoreBreakdownItem[]): number {
  let cappedScore = score;
  const missingCount = unique(breakdown.flatMap((item) => item.missingInformation)).length;

  if (missingCount >= 5 && cappedScore > 70) {
    cappedScore = 70;
  }

  if (opportunity.contractType !== "freelance" && cappedScore > 60) {
    cappedScore = 60;
  }

  if (opportunity.remotePolicy === "onsite" && opportunity.location && !isNearTargetLocation(normalize(opportunity.location)) && cappedScore > 65) {
    cappedScore = 65;
  }

  return cappedScore;
}

function matches(opportunity: Opportunity, terms: string[]): boolean {
  const haystack = searchableText(opportunity);
  return terms.some((term) => haystack.includes(normalize(term)));
}

function searchableText(opportunity: Opportunity): string {
  return normalize(
    [
      opportunity.title,
      opportunity.company,
      opportunity.recruiterCompany,
      opportunity.location,
      opportunity.seniority,
      opportunity.duration,
      opportunity.description,
      opportunity.requiredSkills.join(" "),
      opportunity.niceToHaveSkills.join(" "),
      opportunity.notes
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAcceptableRate(opportunity: Opportunity): boolean {
  return Boolean(
    (opportunity.rateMin && opportunity.rateMin >= ACCEPTABLE_RATE_MIN) ||
      (opportunity.rateMax && opportunity.rateMax >= ACCEPTABLE_RATE_MIN)
  );
}

function hasVeryLowRate(opportunity: Opportunity): boolean {
  return Boolean(
    (opportunity.rateMax && opportunity.rateMax <= VERY_LOW_RATE_MAX) ||
      (opportunity.rateMin && opportunity.rateMin <= VERY_LOW_RATE_MAX)
  );
}

function isNearTargetLocation(normalizedLocation: string): boolean {
  return (
    normalizedLocation.includes("lille") ||
    normalizedLocation.includes("paris") ||
    normalizedLocation.includes("ile-de-france") ||
    normalizedLocation.includes("idf")
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
