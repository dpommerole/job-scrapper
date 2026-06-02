import { describe, expect, it } from "vitest";
import { detectMissingInformation } from "../../src/scoring/index.js";
import { idealVueFreelanceLille, vagueOpportunity } from "./fixtures.js";

describe("detectMissingInformation", () => {
  it("returns very little missing information for a complete opportunity", () => {
    const missingInformation = detectMissingInformation(idealVueFreelanceLille);

    expect(missingInformation).toEqual([]);
  });

  it("detects the MVP fields missing from a vague opportunity", () => {
    const missingInformation = detectMissingInformation(vagueOpportunity);

    expect(missingInformation).toContain("source URL");
    expect(missingInformation).toContain("client/company context");
    expect(missingInformation).toContain("location policy");
    expect(missingInformation).toContain("contract type");
    expect(missingInformation).toContain("rate");
    expect(missingInformation).toContain("duration");
    expect(missingInformation).toContain("start date");
    expect(missingInformation).toContain("responsibilities");
  });
});
