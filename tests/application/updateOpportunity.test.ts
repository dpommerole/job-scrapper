import { describe, expect, it } from "vitest";
import { updateOpportunity } from "../../src/application/index.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("updateOpportunity", () => {
  it("updates status and notes through the repository dependency", () => {
    const updatedOpportunity = {
      ...idealVueFreelanceLille,
      status: "contacted" as const,
      notes: "Sent a short intro."
    };

    expect(
      updateOpportunity(
        {
          id: idealVueFreelanceLille.id,
          status: "contacted",
          notes: "Sent a short intro."
        },
        {
          opportunityRepository: {
            updateStatusAndNotes: (id, update) => ({
              ...idealVueFreelanceLille,
              id,
              ...update
            })
          }
        }
      )
    ).toEqual(updatedOpportunity);
  });
});
