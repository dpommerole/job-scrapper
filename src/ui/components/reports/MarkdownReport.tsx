export type MarkdownReportProps = {
  markdown: string;
};

export function MarkdownReport({ markdown }: MarkdownReportProps) {
  return <div className="markdown-report">{renderBlocks(markdown)}</div>;
}

function renderBlocks(markdown: string) {
  const lines = markdown.split("\n");
  const blocks: JSX.Element[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={index}>{line.replace(/^###\s+/, "")}</h3>);
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(<h2 key={index}>{line.replace(/^##\s+/, "")}</h2>);
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(<h1 key={index}>{line.replace(/^#\s+/, "")}</h1>);
      index += 1;
      continue;
    }

    if (isTableLine(line)) {
      const start = index;
      const tableLines: string[] = [];
      while (index < lines.length && isTableLine(lines[index].trim())) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      blocks.push(<MarkdownTable key={start} lines={tableLines} />);
      continue;
    }

    if (line.startsWith("- ")) {
      const start = index;
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={start}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
      continue;
    }

    const start = index;
    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={start}>{paragraphLines.join(" ")}</p>);
  }

  return blocks;
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const [headerLine, separatorLine, ...bodyLines] = lines;
  const headers = parseTableCells(headerLine);
  const body = separatorLine && isSeparatorLine(separatorLine) ? bodyLines : lines.slice(1);

  return (
    <table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((line) => (
          <tr key={line}>
            {parseTableCells(line).map((cell, index) => (
              <td key={`${line}-${index}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function isBlockStart(line: string): boolean {
  return line.startsWith("#") || line.startsWith("- ") || isTableLine(line);
}

function isTableLine(line: string): boolean {
  return line.startsWith("|") && line.endsWith("|");
}

function isSeparatorLine(line: string): boolean {
  return parseTableCells(line).every((cell) => /^:?-{2,}:?$/.test(cell));
}

function parseTableCells(line: string): string[] {
  return line
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}
