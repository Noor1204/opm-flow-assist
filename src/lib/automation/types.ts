export type AutomationStatus =
  | "queued"
  | "review"
  | "approved"
  | "running"
  | "submitted"
  | "failed"
  | "needs-review";

export type OpmEntry = {
  project: string;
  module: string;
  organization: string;
  taskType: string;
  taskCategory: string;
  task: string;
  startTime: string;
  endTime: string;
  hours: number;
  workDone: string;
  date: string;
};

export type AutomationTicket = {
  id: string;
  title: string;
  description: string;
  workDone: string;
  status: AutomationStatus;
  confidence: number;
  entry: OpmEntry;
  error?: string;
};

export type AutomationRunResult = {
  ticketId: string;
  status: "submitted" | "failed" | "needs-review";
  opmReference?: string;
  error?: string;
};

export type OpmOptionSet = {
  projects: string[];
  modules: string[];
  organizations: string[];
  taskTypes: string[];
  taskCategories: string[];
  tasks: string[];
};
