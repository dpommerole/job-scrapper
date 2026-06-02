export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => header.length === 0)) {
    throw new Error("CSV headers must not be empty");
  }

  return rows.slice(1).filter(hasNonEmptyCell).map((row, rowIndex) => {
    if (row.length > headers.length) {
      throw new Error(`CSV row ${rowIndex + 2} has more cells than headers`);
    }

    return Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""]));
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new Error("CSV contains an unterminated quoted field");
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function hasNonEmptyCell(row: string[]): boolean {
  return row.some((cell) => cell.trim().length > 0);
}
