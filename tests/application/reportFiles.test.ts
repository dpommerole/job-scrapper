import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { listReports, readReport } from "../../src/application/index.js";

describe("report files", () => {
  let tempRoot: string;
  let reportsDir: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), "job-tracker-reports-"));
    reportsDir = join(tempRoot, "reports");
    mkdirSync(reportsDir);
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it("lists markdown reports by newest file name first", () => {
    writeFileSync(join(reportsDir, "2026-06-08-weekly-market-report.md"), "# Weekly Market Report\n\nFirst.", "utf8");
    writeFileSync(join(reportsDir, "2026-06-15-weekly-market-report.md"), "# Newer Report\n\nSecond.", "utf8");
    writeFileSync(join(reportsDir, ".gitkeep"), "", "utf8");

    expect(listReports({ reportsDir })).toEqual([
      {
        id: "2026-06-15-weekly-market-report.md",
        fileName: "2026-06-15-weekly-market-report.md",
        title: "Newer Report",
        generatedDate: "2026-06-15"
      },
      {
        id: "2026-06-08-weekly-market-report.md",
        fileName: "2026-06-08-weekly-market-report.md",
        title: "Weekly Market Report",
        generatedDate: "2026-06-08"
      }
    ]);
  });

  it("reads a report by id without accepting arbitrary paths", () => {
    writeFileSync(join(reportsDir, "2026-06-08-weekly-market-report.md"), "# Weekly Market Report\n\nContent.", "utf8");

    expect(readReport({ reportsDir, id: "2026-06-08-weekly-market-report.md" })).toMatchObject({
      id: "2026-06-08-weekly-market-report.md",
      markdown: "# Weekly Market Report\n\nContent."
    });
    expect(readReport({ reportsDir, id: "../secrets.md" })).toBeUndefined();
  });
});
