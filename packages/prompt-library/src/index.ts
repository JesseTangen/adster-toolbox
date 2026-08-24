export type PromptLibraryItem = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  description?: string;
  tags: string[];
  sourceRow: number;
  fields: Record<string, string>;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function findColumn(headers: string[], candidates: RegExp[]) {
  return headers.findIndex(header => candidates.some(candidate => candidate.test(header)));
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "prompt";
}

function parseTags(value?: string) {
  return (value ?? "").split(/[;,|]/).map(tag => tag.trim()).filter(Boolean);
}

/** Converts the current prompt-sheet tab into display-ready records without making assumptions about its exact column order. */
export function parsePromptLibraryRows(rows: string[][]): PromptLibraryItem[] {
  const [headerRow, ...dataRows] = rows;
  if (!headerRow) return [];

  const headers = headerRow.map((header, index) => normalizeHeader(header || `Column ${index + 1}`));
  const titleIndex = findColumn(headers, [/^title$/, /^name$/, /prompt title/, /prompt name/]);
  const promptIndex = findColumn(headers, [/^prompt$/, /prompt text/, /prompt template/, /instruction/, /^copy$/]);
  const categoryIndex = findColumn(headers, [/^category$/, /^type$/, /prompt category/, /^area$/]);
  const descriptionIndex = findColumn(headers, [/^description$/, /^summary$/, /^context$/, /^notes?$/]);
  const tagIndex = findColumn(headers, [/^tags?$/, /^keywords?$/, /labels?/]);
  const idIndex = findColumn(headers, [/^id$/, /prompt id/]);

  return dataRows.flatMap((row, rowIndex) => {
    if (row.every(cell => !cell?.trim())) return [];
    const cells = headers.map((_, index) => row[index]?.trim() ?? "");
    const prompt = cells[promptIndex >= 0 ? promptIndex : 0] ?? "";
    const title = cells[titleIndex >= 0 ? titleIndex : promptIndex >= 0 ? promptIndex : 0] || `Prompt ${rowIndex + 1}`;
    const category = cells[categoryIndex] || "Uncategorized";
    const fields = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]).filter(([, value]) => value));
    const id = cells[idIndex] || `${slugify(title)}-${rowIndex + 2}`;

    return [{
      id,
      title,
      prompt,
      category,
      description: cells[descriptionIndex] || undefined,
      tags: parseTags(cells[tagIndex]),
      sourceRow: rowIndex + 2,
      fields,
    }];
  });
}

export function getPromptCategories(items: PromptLibraryItem[]) {
  return Array.from(new Set(items.map(item => item.category))).sort((a, b) => a.localeCompare(b));
}
