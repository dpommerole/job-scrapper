import type { Opportunity } from "../../domain/index.js";

export type OutreachDraftContent = {
  subject: string;
  message: string;
};

export function generateOutreachDraft(opportunity: Opportunity): OutreachDraftContent {
  const recruiterGreeting = opportunity.recruiterName ? `Bonjour ${opportunity.recruiterName},` : "Bonjour,";
  const companyContext = opportunity.company ? ` chez ${opportunity.company}` : "";
  const stack = formatSkills(opportunity.requiredSkills);
  const remotePolicy = formatRemotePolicy(opportunity.remotePolicy);
  const rate = formatRate(opportunity);
  const questions = createClarificationQuestions(opportunity);

  return {
    subject: `Mission ${opportunity.title}`,
    message: [
      recruiterGreeting,
      "",
      `Je vous contacte au sujet de la mission ${opportunity.title}${companyContext}.`,
      `Je suis développeur frontend senior, principalement Vue.js et TypeScript, avec un fort intérêt pour l'architecture frontend, les tests et les design systems.${stack}`,
      remotePolicy,
      rate,
      "",
      "Pour avancer proprement, j'aimerais clarifier :",
      ...questions.map((question) => `- ${question}`),
      "",
      "Est-ce que la mission est toujours ouverte ?"
    ]
      .filter((line) => line !== "")
      .join("\n")
  };
}

function formatSkills(skills: string[]): string {
  const relevantSkills = skills.slice(0, 4);
  return relevantSkills.length > 0 ? ` Stack mentionnée : ${relevantSkills.join(", ")}.` : "";
}

function formatRemotePolicy(remotePolicy: Opportunity["remotePolicy"]): string {
  if (remotePolicy === "unknown") return "";
  return `La modalité ${remotePolicy} me convient selon le rythme attendu.`;
}

function formatRate(opportunity: Opportunity): string {
  if (!opportunity.rateMin && !opportunity.rateMax) return "";
  if (opportunity.rateMin && opportunity.rateMax) return `Le TJM indiqué (${opportunity.rateMin}-${opportunity.rateMax} EUR) semble dans ma cible.`;
  const rate = opportunity.rateMin ?? opportunity.rateMax;
  return `Le TJM indiqué (${rate} EUR) semble dans ma cible.`;
}

function createClarificationQuestions(opportunity: Opportunity): string[] {
  const questions: string[] = [];
  const missingInformation = opportunity.missingInformation ?? [];

  if (missingInformation.some((item) => /client|company|intermédiaire|intermediary/i.test(item))) {
    questions.push("quel est le contexte client et le niveau d'intermédiation ?");
  }
  if (missingInformation.some((item) => /rate|tjm|tarif/i.test(item))) {
    questions.push("quelle est la fourchette de TJM prévue ?");
  }
  if (missingInformation.some((item) => /remote|location|localisation|policy/i.test(item))) {
    questions.push("quel est le rythme remote/hybride attendu ?");
  }
  if (missingInformation.some((item) => /duration|start|date|durée|démarrage/i.test(item))) {
    questions.push("quelle est la durée prévue et la date de démarrage ?");
  }

  if (questions.length === 0) {
    questions.push("quel est le contexte produit et l'organisation de l'équipe frontend ?");
    questions.push("quelles sont les prochaines étapes côté client ?");
  }

  return questions.slice(0, 3);
}
