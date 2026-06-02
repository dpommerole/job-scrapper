import type { Opportunity } from "../../src/scoring/index.js";

const baseOpportunity: Opportunity = {
  id: "fixture-base",
  source: "Fixture",
  title: "Untitled opportunity",
  remotePolicy: "unknown",
  contractType: "unknown",
  requiredSkills: [],
  niceToHaveSkills: [],
  description: "",
  collectedAt: "2026-06-02T10:00:00.000Z",
  status: "new"
};

export const idealVueFreelanceLille: Opportunity = {
  ...baseOpportunity,
  id: "ideal-vue-freelance-lille",
  source: "Freelance-Informatique",
  sourceUrl: "https://example.com/vue-lille",
  title: "Lead Frontend Vue 3 TypeScript - mission freelance",
  company: "Client final retail",
  location: "Lille, France",
  remotePolicy: "hybrid",
  contractType: "freelance",
  seniority: "Lead senior frontend",
  duration: "12 months",
  startDate: "ASAP",
  rateMin: 650,
  rateMax: 750,
  currency: "EUR",
  requiredSkills: ["Vue.js", "TypeScript", "Vite", "Vitest", "Playwright"],
  niceToHaveSkills: ["Design system", "Accessibility", "Performance"],
  description:
    "Mission longue pour prendre le lead technique frontend sur une plateforme data-heavy. Responsabilites: architecture frontend, choix techniques, testing strategy, design system, performance, accessibilite, collaboration PO UX et API integration.",
  publishedAt: "2026-06-01T10:00:00.000Z"
};

export const reactRemoteFreelance: Opportunity = {
  ...baseOpportunity,
  id: "react-remote-freelance",
  source: "LeHibou",
  title: "Senior Frontend React TypeScript freelance",
  company: "Scale-up SaaS",
  location: "France",
  remotePolicy: "remote",
  contractType: "freelance",
  seniority: "Senior",
  duration: "6 months",
  startDate: "2026-07-01",
  rateMin: 600,
  currency: "EUR",
  requiredSkills: ["React", "TypeScript", "Playwright"],
  niceToHaveSkills: ["Design system"],
  description:
    "Mission frontend senior remote France sur une application SaaS complexe. Collaboration produit, qualite, tests end-to-end, API integration et amelioration du design system.",
  publishedAt: "2026-06-01T10:00:00.000Z"
};

export const cdiVueSenior: Opportunity = {
  ...idealVueFreelanceLille,
  id: "cdi-vue-senior",
  title: "Senior Frontend Vue TypeScript CDI",
  contractType: "cdi"
};

export const onsiteFarFreelance: Opportunity = {
  ...idealVueFreelanceLille,
  id: "onsite-far-freelance",
  location: "Toulouse, France",
  remotePolicy: "onsite"
};

export const vagueOpportunity: Opportunity = {
  ...baseOpportunity,
  id: "vague-opportunity",
  source: "Manual import",
  title: "Developpeur frontend",
  description: "Recherche developpeur frontend disponible.",
  requiredSkills: ["JavaScript"]
};

export const veryLowRateVueMission: Opportunity = {
  ...idealVueFreelanceLille,
  id: "very-low-rate-vue-mission",
  rateMin: 300,
  rateMax: 400
};
