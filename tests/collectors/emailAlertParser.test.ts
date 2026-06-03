import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { collectOpportunities } from "../../src/application/index.js";
import { parseEmailAlert } from "../../src/infrastructure/index.js";
import { createEmailAlertCollector } from "../../src/infrastructure/index.js";

const collectedAt = "2026-06-03T12:00:00.000Z";

function fixturePath(name: string): URL {
  return new URL(`../../data/email-alerts/${name}`, import.meta.url);
}

function readFixture(name: string): string {
  return readFileSync(fixturePath(name), "utf8");
}

describe("email alert parser", () => {
  it("parses a simple job alert fixture into a raw collected opportunity", () => {
    const result = parseEmailAlert({
      content: readFixture("simple-job-alert.txt"),
      sourceId: "free-work-email",
      sourceName: "Free-Work email alert",
      collectedAt
    });

    expect(result.warnings).toEqual([]);
    expect(result.rawOpportunities).toEqual([
      expect.objectContaining({
        sourceId: "free-work-email",
        sourceName: "Free-Work email alert",
        sourceUrl: "https://www.free-work.example/jobs/lead-vue-lille",
        title: "Lead Frontend Vue 3 TypeScript",
        company: "Acme Retail",
        location: "Lille France",
        contractType: "Freelance",
        requiredSkills: ["Vue.js", "TypeScript", "Pinia"],
        description: "Architecture frontend mission on an ecommerce platform.",
        collectedAt,
        url: "https://www.free-work.example/jobs/lead-vue-lille"
      })
    ]);
    expect(result.rawOpportunities[0].raw).toMatchObject({
      emailSubject: "Free-Work alert - Vue missions",
      emailFrom: "alerts@free-work.example",
      links: ["https://www.free-work.example/jobs/lead-vue-lille"]
    });
  });

  it("parses multiple opportunities in one email alert", () => {
    const result = parseEmailAlert({
      content: readFixture("multiple-opportunities.txt"),
      sourceId: "market-email",
      sourceName: "Market email alert",
      collectedAt
    });

    expect(result.rawOpportunities).toHaveLength(2);
    expect(result.rawOpportunities.map((opportunity) => opportunity.title)).toEqual([
      "Senior Frontend React TypeScript",
      "Frontend Design System Lead"
    ]);
    expect(result.rawOpportunities[1].requiredSkills).toEqual(["Vue.js", "Design system", "Storybook"]);
    expect(result.warnings).toEqual([]);
  });

  it("handles an email with no opportunities conservatively", () => {
    const result = parseEmailAlert({
      content: readFixture("no-opportunities.txt"),
      sourceId: "newsletter",
      sourceName: "Newsletter",
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([]);
    expect(result.warnings).toEqual([
      {
        code: "parse-warning",
        message: "No opportunities were detected in the email alert content."
      }
    ]);
  });

  it("preserves source attribution and warns without inventing missing title data", () => {
    const result = parseEmailAlert({
      content: readFixture("missing-fields-alert.txt"),
      sourceId: "manual-email",
      sourceName: "Manual email source",
      sourceUrl: "https://manual-source.example",
      collectedAt
    });

    expect(result.rawOpportunities).toEqual([
      expect.objectContaining({
        sourceId: "manual-email",
        sourceName: "Manual email source",
        sourceUrl: "https://manual-source.example",
        title: undefined,
        description: "A recruiter mentions a frontend architecture mission but the copied alert does not include the title.",
        url: "https://manual-source.example/opportunities/incomplete-frontend-architecture"
      })
    ]);
    expect(result.warnings).toEqual([
      {
        code: "missing-field",
        message: "Email alert opportunity is missing a title.",
        itemId: "https://manual-source.example/opportunities/incomplete-frontend-architecture",
        field: "title"
      }
    ]);
  });

  it("can be run as a local email alert collector", async () => {
    const collector = createEmailAlertCollector({
      sourceId: "free-work-email",
      sourceName: "Free-Work email alert",
      content: readFixture("simple-job-alert.txt")
    });

    const result = await collectOpportunities({ collector, now: collectedAt });

    expect(result).toMatchObject({
      sourceId: "free-work-email",
      collectorName: "free-work-email-email-alert",
      status: "success",
      collectedAt
    });
    expect(result.rawOpportunities).toHaveLength(1);
  });
});
