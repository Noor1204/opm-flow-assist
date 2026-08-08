import type { AutomationTicket, OpmEntry } from "./types";

const requiredHeaders = ["id", "title", "description", "workDone"] as const;

type RawTicket = Record<string, string>;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseTicketsCsv(csv: string): RawTicket[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV must contain a header and at least one ticket.");

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) throw new Error(`Missing required CSV column: ${header}`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    const cells = parseCsvLine(line);
    const row: RawTicket = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });
    if (!row.id) throw new Error(`Ticket row ${rowIndex + 2} has no id.`);
    return row;
  });
}

function emptyEntry(): OpmEntry {
  return {
    project: "",
    module: "",
    organization: "",
    taskType: "",
    taskCategory: "",
    task: "",
    startTime: "",
    endTime: "",
    hours: 0,
    workDone: "",
    date: new Date().toISOString().slice(0, 10),
  };
}

export function rawTicketsToAutomationTickets(rows: RawTicket[]): AutomationTicket[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    workDone: row.workdone ?? row.workDone ?? "",
    status: "queued",
    confidence: 0,
    entry: { ...emptyEntry(), workDone: row.workdone ?? row.workDone ?? "" },
  }));
}

export function parseTicketsJson(json: string): AutomationTicket[] {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("JSON must contain an array of tickets.");
  return rawTicketsToAutomationTickets(
    parsed.map((item) => {
      if (!item || typeof item !== "object") throw new Error("Each ticket must be an object.");
      return Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key.toLowerCase(), String(value ?? "")]),
      );
    }),
  );
}
