import { describe, expect, it } from "vitest";
import { scoreOpportunity } from "../../src/scoring/index.js";
import {
  cdiVueSenior,
  idealVueFreelanceLille,
  onsiteFarFreelance,
  reactRemoteFreelance,
  vagueOpportunity,
  veryLowRateVueMission
} from "./fixtures.js";

describe("scoreOpportunity", () => {
  it("scores an ideal Vue TypeScript freelance mission in Lille as hot", () => {
    const result = scoreOpportunity(idealVueFreelanceLille);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.opportunityClass).toBe("hot");
    expect(result.recommendation).toBe("contact immediately");
    expect(result.positiveSignals).toContain("Vue.js required");
    expect(result.positiveSignals).toContain("TypeScript required");
    expect(result.positiveSignals).toContain("Hybrid Lille");
    expect(result.positiveSignals).toContain("Freelance explicitly stated");
    expect(result.confidence).toBe("high");
  });

  it("keeps a React TypeScript remote freelance mission interesting but below a perfect Vue fit", () => {
    const idealResult = scoreOpportunity(idealVueFreelanceLille);
    const reactResult = scoreOpportunity(reactRemoteFreelance);

    expect(reactResult.score).toBeGreaterThanOrEqual(65);
    expect(reactResult.opportunityClass).toBe("interesting");
    expect(reactResult.score).toBeLessThan(idealResult.score);
    expect(reactResult.positiveSignals).not.toContain("Vue.js required");
    expect(reactResult.positiveSignals).toContain("TypeScript required");
    expect(reactResult.positiveSignals).toContain("Full remote");
  });

  it("caps non-freelance opportunities at 60", () => {
    const result = scoreOpportunity(cdiVueSenior);

    expect(result.score).toBeLessThanOrEqual(60);
    expect(result.negativeSignals).toContain("CDI-only");
  });

  it("caps full-onsite opportunities far from Lille or Paris at 65", () => {
    const result = scoreOpportunity(onsiteFarFreelance);

    expect(result.score).toBeLessThanOrEqual(65);
    expect(result.negativeSignals).toContain("Full onsite far from Lille/Paris");
  });

  it("keeps vague opportunities low confidence and asks for missing details", () => {
    const result = scoreOpportunity(vagueOpportunity);

    expect(result.score).toBeLessThanOrEqual(34);
    expect(result.opportunityClass).toBe("reject");
    expect(result.confidence).toBe("low");
    expect(result.missingInformation).toContain("contract type");
    expect(result.missingInformation).toContain("rate");
  });

  it("penalizes very low rates", () => {
    const result = scoreOpportunity(veryLowRateVueMission);

    expect(result.negativeSignals).toContain("Very low rate");
    expect(result.positiveSignals).not.toContain("TJM/rate visible and acceptable");
  });
});
