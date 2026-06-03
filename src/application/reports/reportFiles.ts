import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

export type ReportSummary = {
  id: string;
  fileName: string;
  title: string;
  generatedDate?: string;
};

export type ReportDetail = ReportSummary & {
  markdown: string;
};

export type ListReportsInput = {
  reportsDir?: string;
};

export type ReadReportInput = {
  id: string;
  reportsDir?: string;
};

export function listReports(input: ListReportsInput = {}): ReportSummary[] {
  const reportsDir = input.reportsDir ?? "reports";
  if (!existsSync(reportsDir)) return [];

  return readdirSync(reportsDir)
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("."))
    .map((fileName) => toReportSummary(reportsDir, fileName))
    .sort((left, right) => right.fileName.localeCompare(left.fileName));
}

export function readReport(input: ReadReportInput): ReportDetail | undefined {
  const reportsDir = input.reportsDir ?? "reports";
  const report = listReports({ reportsDir }).find((summary) => summary.id === input.id);
  if (!report) return undefined;

  return {
    ...report,
    markdown: readFileSync(join(reportsDir, report.fileName), "utf8")
  };
}

function toReportSummary(reportsDir: string, fileName: string): ReportSummary {
  const filePath = join(reportsDir, fileName);
  const markdown = statSync(filePath).isFile() ? readFileSync(filePath, "utf8") : "";
  const title = extractTitle(markdown) ?? humanizeFileName(fileName);

  return {
    id: fileName,
    fileName,
    title,
    generatedDate: extractDate(fileName)
  };
}

function extractTitle(markdown: string): string | undefined {
  const heading = markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  return heading?.replace(/^#\s+/, "").trim() || undefined;
}

function humanizeFileName(fileName: string): string {
  return basename(fileName, ".md")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractDate(fileName: string): string | undefined {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1];
}
