import { describe, expect, it } from "vitest";
import {
  classifyOpportunity,
  confidenceFromMissingInformation,
  recommendOpportunity
} from "../../src/scoring/index.js";

describe("classification helpers", () => {
  it("classifies scores using the documented thresholds", () => {
    expect(classifyOpportunity(100)).toBe("hot");
    expect(classifyOpportunity(80)).toBe("hot");
    expect(classifyOpportunity(79)).toBe("interesting");
    expect(classifyOpportunity(65)).toBe("interesting");
    expect(classifyOpportunity(64)).toBe("maybe");
    expect(classifyOpportunity(50)).toBe("maybe");
    expect(classifyOpportunity(49)).toBe("weak");
    expect(classifyOpportunity(35)).toBe("weak");
    expect(classifyOpportunity(34)).toBe("reject");
  });

  it("recommends asking for details when a good opportunity lacks enough information", () => {
    expect(
      recommendOpportunity(72, "interesting", ["rate", "duration", "start date", "client/company context"])
    ).toBe("ask for missing details");
  });

  it("derives confidence from missing information count", () => {
    expect(confidenceFromMissingInformation(["rate"])).toBe("high");
    expect(confidenceFromMissingInformation(["rate", "duration", "start date"])).toBe("medium");
    expect(confidenceFromMissingInformation(["a", "b", "c", "d", "e", "f"])).toBe("low");
  });
});
