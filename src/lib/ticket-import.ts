export type ImportedTicket = {
  id: string;
  title: string;
  description?: string;
  workDone?: string;
  date?: string;
  hours?: number;
};

export function parseTicketCsv(csv: string): ImportedTicket[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const indexOf = (...names: string[]) => names.map(normalizeHeader).map((n) => headers.indexOf(n)).find((i) => i >= 0) ?? -1;
  const idIndex = indexOf("id", "ticket", "ticket id", "ticket_id");
  const titleIndex = indexOf("title", "subject", "ticket title");
  const descriptionIndex = indexOf("description", "details", "body");
  const workDoneIndex = indexOf("work done", "work_done", "worklog", "notes");
  const dateIndex = indexOf("date", "work date");
  const hoursIndex = indexOf("hours", "duration");

  if (idIndex < 0) throw new Error("CSV must contain an ID/Ticket column.");

  return lines.slice(1).map((line, row) => {
    const values = splitCsvLine(line);
    const id = values[idIndex]?.trim();
    if (!id) throw new Error(`Row ${row + 2}: ticket ID is missing.`);
    const rawHours = hoursIndex >= 0 ? values[hoursIndex]?.trim() : undefined;
    const hours = rawHours ? Number(rawHours) : undefined;
    if (rawHours && (!Number.isFinite(hours) || hours < 0)) {
      throw new Error(`Row ${row + 2}: hours must be a valid non-negative number.`);
    }
    return {
      id,
      title: titleIndex >= 0 ? values[titleIndex]?.trim() || id : id,
      description: descriptionIndex >= 0 ? values[descriptionIndex]?.trim() : undefined,
      workDone: workDoneIndex >= 0 ? values[workDoneIndex]?.trim() : undefined,
      date: dateIndex >= 0 ? values[dateIndex]?.trim() : undefined,
      hours,
    };
  });
}

export function parseTicketJson(input: string): ImportedTicket[] {
  const value: unknown = JSON.parse(input);
  if (!Array.isArray(value)) throw new Error("JSON must contain an array of tickets.");
  return value.map((item, index) => {
    if (!item || typeof item !== "object") throw new Error(`Ticket ${index + 1} is invalid.`);
    const record = item as Record<string, unknown>;
    const id = String(record.id ?? record.ticketId ?? record.ticket ?? "").trim();
    if (!id) throw new Error(`Ticket ${index + 1}: ID is missing.`);
    const hoursValue = record.hours ?? record.duration;
    const hours = hoursValue == null || hoursValue === "" ? undefined : Number(hoursValue);
    if (hours !== undefined && (!Number.isFinite(hours) || hours < 0)) {
      throw new Error(`Ticket ${index + 1}: hours must be a valid non-negative number.`);
    }
    return {
      id,
      title: String(record.title ?? record.subject ?? id),
      description: optionalString(record.description ?? record.details ?? record.body),
      workDone: optionalString(record.workDone ?? record.work_done ?? record.worklog ?? record.notes),
      date: optionalString(record.date ?? record.workDate),
      hours,
    };
  });
}

function optionalString(value: unknown) {
  return value == null ? undefined : String(value);
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current); current = "";
    } else current += char;
  }
  result.push(current);
  return result;
}
