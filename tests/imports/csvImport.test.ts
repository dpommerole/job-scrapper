import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  normalizeCsvOpportunityRows,
  normalizeValidCsvOpportunityRows,
  parseCsv
} from "../../src/imports/index.js";

const exampleCsvPath = new URL("../../data/imports/example-opportunities.csv", import.meta.url);

describe("CSV opportunity import parsing", () => {
  it("parses the example CSV into rows with quoted descriptions", () => {
    const rows = parseCsv(readFileSync(exampleCsvPath, "utf8"));

    expect(rows).toHaveLength(3);
    expect(rows[0].title).toBe("Lead Frontend Vue 3 TypeScript");
    expect(rows[0].description).toContain("plateforme e-commerce");
    expect(rows[1].recruiterName).toBe("Alice Martin");
  });

  it("normalizes CSV rows into opportunities without persisting them", () => {
    const rows = parseCsv(readFileSync(exampleCsvPath, "utf8"));
    const opportunities = normalizeCsvOpportunityRows(rows, {
      collectedAt: "2026-06-02T12:00:00.000Z"
    });

    expect(opportunities).toHaveLength(3);
    expect(opportunities[0]).toMatchObject({
      id: "csv-1-lead-frontend-vue-3-typescript",
      source: "Free-Work",
      title: "Lead Frontend Vue 3 TypeScript",
      company: "Acme Retail",
      recruiterCompany: "Tech Recruiters",
      location: "Lille France",
      remotePolicy: "hybrid",
      contractType: "freelance",
      seniority: "senior",
      duration: "12 months",
      startDate: "ASAP",
      rateMin: 650,
      rateMax: 750,
      currency: "EUR",
      requiredSkills: ["Vue.js", "TypeScript", "Vitest"],
      niceToHaveSkills: ["Design system", "Accessibility"],
      collectedAt: "2026-06-02T12:00:00.000Z",
      status: "new"
    });
  });

  it("applies safe defaults for missing optional CSV values", () => {
    const rows = parseCsv(readFileSync(exampleCsvPath, "utf8"));
    const opportunities = normalizeCsvOpportunityRows(rows, {
      collectedAt: "2026-06-02T12:00:00.000Z"
    });
    const sparseOpportunity = opportunities[2];

    expect(sparseOpportunity).toMatchObject({
      id: "csv-3-frontend-mission-with-missing-details",
      source: "Manual CSV",
      title: "Frontend mission with missing details",
      remotePolicy: "unknown",
      contractType: "unknown",
      requiredSkills: ["JavaScript", "CSS"],
      niceToHaveSkills: [],
      collectedAt: "2026-06-02T12:00:00.000Z",
      status: "new"
    });
    expect(sparseOpportunity.sourceUrl).toBeUndefined();
    expect(sparseOpportunity.rateMin).toBeUndefined();
    expect(sparseOpportunity.rateMax).toBeUndefined();
    expect(sparseOpportunity.currency).toBeUndefined();
  });

  it("throws on malformed quoted CSV input", () => {
    expect(() => parseCsv("title,description\nBad,\"unterminated")).toThrow("unterminated quoted field");
  });

  it("returns invalid rows with reasons without dropping valid rows", () => {
    const rows = parseCsv(`source,title,description,requiredSkills,remotePolicy,contractType,rateMin,startDate,publishedAt
Manual CSV,Valid Vue mission,Enough detail to normalize safely,Vue.js;TypeScript,remote,freelance,650,ASAP,2026-06-02
,Missing source,Has a description,Vue.js,remote,freelance,600,2026-07-01,2026-06-02
Manual CSV,Bad values,Has a description,TypeScript,spaceship,permanent,not-a-rate,tomorrow,not-a-date`);

    const result = normalizeValidCsvOpportunityRows(rows, {
      collectedAt: "2026-06-02T12:00:00.000Z"
    });

    expect(result.opportunities).toHaveLength(1);
    expect(result.opportunities[0]).toMatchObject({
      source: "Manual CSV",
      title: "Valid Vue mission",
      remotePolicy: "remote",
      contractType: "freelance",
      requiredSkills: ["Vue.js", "TypeScript"],
      rateMin: 650
    });
    expect(result.invalidRows).toEqual([
      {
        rowNumber: 3,
        row: expect.objectContaining({
          title: "Missing source"
        }),
        reasons: ["Missing required field: source"]
      },
      {
        rowNumber: 4,
        row: expect.objectContaining({
          title: "Bad values"
        }),
        reasons: [
          "Invalid remotePolicy: spaceship",
          "Invalid contractType: permanent",
          "Invalid rateMin: not-a-rate",
          "Invalid startDate: tomorrow",
          "Invalid publishedAt: not-a-date"
        ]
      }
    ]);
  });
});
