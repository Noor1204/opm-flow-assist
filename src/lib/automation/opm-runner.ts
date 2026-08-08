import type { AutomationRunResult, AutomationTicket, OpmOptionSet } from "./types";

export type OpmBridge = {
  isConnected(): Promise<boolean>;
  getOptions(): Promise<OpmOptionSet>;
  fill(entry: AutomationTicket["entry"]): Promise<void>;
  save(): Promise<{ opmReference?: string }>;
};

function includesOption(options: string[], value: string) {
  return value.length > 0 && options.some((option) => option.trim() === value.trim());
}

function validateEntry(ticket: AutomationTicket, options: OpmOptionSet) {
  const { entry } = ticket;
  const errors: string[] = [];
  if (!includesOption(options.projects, entry.project)) errors.push("Project not found in OPM");
  if (!includesOption(options.modules, entry.module)) errors.push("Module not found in OPM");
  if (!includesOption(options.organizations, entry.organization)) errors.push("Organization not found in OPM");
  if (!includesOption(options.taskTypes, entry.taskType)) errors.push("Task type not found in OPM");
  if (!includesOption(options.taskCategories, entry.taskCategory)) errors.push("Task category not found in OPM");
  if (!includesOption(options.tasks, entry.task)) errors.push("Task not found in OPM");
  if (!entry.workDone.trim()) errors.push("Work Done is empty");
  if (!(entry.hours > 0)) errors.push("Hours must be greater than zero");
  return errors;
}

export async function runTicketsSequentially(
  tickets: AutomationTicket[],
  bridge: OpmBridge,
  onProgress?: (result: AutomationRunResult, index: number, total: number) => void,
): Promise<AutomationRunResult[]> {
  if (!(await bridge.isConnected())) throw new Error("OPM is not connected. Open the OPM entry page first.");

  const options = await bridge.getOptions();
  const results: AutomationRunResult[] = [];

  for (let index = 0; index < tickets.length; index += 1) {
    const ticket = tickets[index];
    const validationErrors = validateEntry(ticket, options);

    if (validationErrors.length > 0) {
      const result: AutomationRunResult = {
        ticketId: ticket.id,
        status: "needs-review",
        error: validationErrors.join("; "),
      };
      results.push(result);
      onProgress?.(result, index, tickets.length);
      continue;
    }

    try {
      await bridge.fill(ticket.entry);
      const saved = await bridge.save();
      const result: AutomationRunResult = {
        ticketId: ticket.id,
        status: "submitted",
        opmReference: saved.opmReference,
      };
      results.push(result);
      onProgress?.(result, index, tickets.length);
    } catch (error) {
      const result: AutomationRunResult = {
        ticketId: ticket.id,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown OPM automation error",
      };
      results.push(result);
      onProgress?.(result, index, tickets.length);
    }
  }

  return results;
}
