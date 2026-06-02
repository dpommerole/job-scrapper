import type { ContractType, Opportunity, RemotePolicy } from "../domain/index.js";
import type { CsvRow } from "./csvParser.js";

export type NormalizeCsvOpportunityOptions = {
  collectedAt?: string;
};

export function normalizeCsvOpportunityRows(
  rows: CsvRow[],
  options: NormalizeCsvOpportunityOptions = {}
): Opportunity[] {
  return rows.map((row, index) => normalizeCsvOpportunityRow(row, index, options));
}

export function normalizeCsvOpportunityRow(
  row: CsvRow,
  index: number,
  options: NormalizeCsvOpportunityOptions = {}
): Opportunity {
  const title = valueOrDefault(row.title, "Untitled opportunity");
  const source = valueOrDefault(row.source, "CSV import");
  const requiredSkills = splitSkills(row.requiredSkills);
  const niceToHaveSkills = splitSkills(row.niceToHaveSkills);
  const rateMin = parseOptionalNumber(row.rateMin);
  const rateMax = parseOptionalNumber(row.rateMax);

  return {
    id: valueOrDefault(row.id, createCsvOpportunityId(index, title)),
    source,
    sourceUrl: optional(row.sourceUrl),
    title,
    company: optional(row.company),
    recruiterName: optional(row.recruiterName),
    recruiterCompany: optional(row.recruiterCompany),
    recruiterContactUrl: optional(row.recruiterContactUrl),
    recruiterEmail: optional(row.recruiterEmail),
    location: optional(row.location),
    remotePolicy: normalizeRemotePolicy(row.remotePolicy),
    contractType: normalizeContractType(row.contractType),
    seniority: optional(row.seniority),
    duration: optional(row.duration),
    startDate: optional(row.startDate),
    rateMin,
    rateMax,
    currency: normalizeCurrency(row.currency, rateMin, rateMax),
    requiredSkills,
    niceToHaveSkills,
    description: valueOrDefault(row.description, ""),
    publishedAt: optional(row.publishedAt),
    collectedAt: options.collectedAt ?? new Date().toISOString(),
    status: "new",
    notes: optional(row.notes)
  };
}

function splitSkills(value: string | undefined): string[] {
  return (value ?? "")
    .split(";")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function normalizeRemotePolicy(value: string | undefined): RemotePolicy {
  const normalized = normalize(value);
  if (normalized === "remote" || normalized === "full remote" || normalized === "france remote") return "remote";
  if (normalized === "hybrid" || normalized === "hybride") return "hybrid";
  if (normalized === "onsite" || normalized === "on site" || normalized === "sur site") return "onsite";
  return "unknown";
}

function normalizeContractType(value: string | undefined): ContractType {
  const normalized = normalize(value);
  if (normalized === "freelance" || normalized === "independant" || normalized === "independent") return "freelance";
  if (normalized === "cdi") return "cdi";
  if (normalized === "cdd") return "cdd";
  if (normalized === "internship" || normalized === "stage") return "internship";
  return "unknown";
}

function normalizeCurrency(value: string | undefined, rateMin?: number, rateMax?: number): "EUR" | undefined {
  const normalized = normalize(value);
  if (normalized === "eur" || normalized === "euro" || normalized === "euros") return "EUR";
  if (!value && (rateMin !== undefined || rateMax !== undefined)) return "EUR";
  return undefined;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;

  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function createCsvOpportunityId(index: number, title: string): string {
  const slug = normalize(title).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `csv-${index + 1}${slug ? `-${slug}` : ""}`;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function valueOrDefault(value: string | undefined, fallback: string): string {
  return optional(value) ?? fallback;
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}
