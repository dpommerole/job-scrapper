import { describe, expect, it } from "vitest";
import { listOpportunities } from "../../src/application/index.js";
import { idealVueFreelanceLille, reactRemoteFreelance } from "../scoring/fixtures.js";

describe("listOpportunities", () => {
  it("returns opportunities from the repository dependency", () => {
    const opportunities = [idealVueFreelanceLille, reactRemoteFreelance];

    expect(
      listOpportunities({
        opportunityRepository: {
          list: () => opportunities
        }
      })
    ).toEqual(opportunities);
  });
});
