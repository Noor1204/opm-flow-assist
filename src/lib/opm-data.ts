export type Priority = "critical" | "high" | "medium" | "low";

export type TicketStatus =
  | "New"
  | "AI Analyzed"
  | "Needs Review"
  | "Pending Approval"
  | "Submitted"
  | "Failed"
  | "Draft"
  | "Rejected";

export type MappingField = {
  key: "project" | "module" | "task" | "category" | "workDone" | "hours" | "date" | "notes";
  label: string;
  aiValue: string;
  userValue: string;
  confidence: number;
  kind: "select" | "text" | "textarea" | "number" | "date";
};

export type Comment = { author: string; at: string; body: string };

export type Ticket = {
  id: string;
  title: string;
  requester: string;
  assignee: string;
  priority: Priority;
  status: TicketStatus;
  openedAt: string;
  updatedAt: string;
  updatedAgo: string;
  channel: string;
  project: string;
  description: string;
  workDone: string;
  comments: Comment[];
  aiSummary: string;
  aiConfidence: number;
  aiRationale: string;
  suggested: {
    project: string;
    module: string;
    category: string;
    task: string;
    hours: string;
    date: string;
    notes: string;
  };
  aiSignals: string[];
  opmRef?: string;
  submittedAt?: string;
  error?: string;
};

export const tickets: Ticket[] = [
  {
    id: "HD-48213",
    title: "Payroll batch job failing for APAC entities",
    requester: "N. Ramanathan · Finance Ops",
    assignee: "You (D. Sharma)",
    priority: "critical",
    status: "Submitted",
    openedAt: "Today, 08:12",
    updatedAt: "Today, 11:52",
    updatedAgo: "18m ago",
    channel: "Helpdesk · Email",
    project: "ERP Support – Payroll",
    description:
      "Nightly payroll consolidation job aborted with a locking error for 3 APAC legal entities. Payslip release blocked for the 25th cycle.",
    workDone:
      "Analysed job logs, identified deadlock on staging table, re-indexed PAY_STG_BATCH, re-ran batch for 3 entities and validated 1,842 payslips.",
    comments: [
      { author: "N. Ramanathan", at: "08:14", body: "Payslip release is blocked, please treat as P1." },
      { author: "D. Sharma", at: "09:05", body: "Deadlock confirmed on PAY_STG_BATCH. Re-indexing now." },
      { author: "D. Sharma", at: "11:45", body: "Batch re-run complete, 1,842 payslips validated." },
    ],
    aiSummary:
      "Resolved a payroll batch deadlock by re-indexing the staging table and re-running the consolidation for 3 APAC entities, then verified payslip output.",
    aiConfidence: 96,
    aiRationale:
      "Ticket body and worklog contain incident keywords (deadlock, batch abort) plus explicit object names (PAY_STG_BATCH) that map to the Payroll Engine module. Effort derived from three worklog notes spanning 08:20 – 11:45.",
    suggested: {
      project: "ERP Support – Payroll",
      module: "Payroll Engine",
      category: "Incident Resolution",
      task: "Batch job failure analysis & rerun",
      hours: "3.5",
      date: "2026-08-07",
      notes: "P1 incident, payslip release unblocked for 3 APAC entities.",
    },
    aiSignals: [
      "Detected incident keywords: deadlock, batch abort",
      "Matched to Payroll Engine from log references",
      "Effort estimated from 3 worklog notes (08:20 – 11:45)",
    ],
    opmRef: "OPM-2026-118342",
    submittedAt: "Today, 11:52",
  },
  {
    id: "HD-48198",
    title: "Vendor invoice OCR mismatch on GST fields",
    requester: "S. Kulkarni · Accounts Payable",
    assignee: "You (D. Sharma)",
    priority: "high",
    status: "Pending Approval",
    openedAt: "Today, 07:04",
    updatedAt: "Today, 11:20",
    updatedAgo: "50m ago",
    channel: "Helpdesk · Portal",
    project: "Finance Automation",
    description:
      "OCR engine posts GST amounts to the wrong tax code for scanned invoices from 4 vendors. 118 invoices are stuck in the exception queue.",
    workDone:
      "Reviewed 22 sample invoices, corrected tax-code mapping template, retrained OCR field anchors and reprocessed the queue.",
    comments: [
      { author: "S. Kulkarni", at: "07:06", body: "Exception queue growing, 118 invoices affected." },
      { author: "D. Sharma", at: "10:10", body: "Template mapping corrected, reprocessing batch." },
    ],
    aiSummary:
      "Fixed GST tax-code mapping in the invoice OCR template and reprocessed the pending vendor invoice queue.",
    aiConfidence: 91,
    aiRationale:
      "No outage signals present; the worklog describes a template change, so the activity is classified as a configuration change rather than an incident. Module inferred from repeated 'OCR template' references.",
    suggested: {
      project: "Finance Automation",
      module: "Invoice Capture",
      category: "Configuration Change",
      task: "OCR template mapping update",
      hours: "2.0",
      date: "2026-08-07",
      notes: "Tax-code mapping corrected for 4 vendors; queue reprocessed.",
    },
    aiSignals: [
      "Classified as configuration change, not incident",
      "Module inferred from 'OCR template' references",
      "Effort estimated from ticket activity span",
    ],
  },
  {
    id: "HD-48155",
    title: "New joiner access request – SCM approvals",
    requester: "P. Menon · HR Shared Services",
    assignee: "R. Iyer",
    priority: "medium",
    status: "AI Analyzed",
    openedAt: "Yesterday, 16:41",
    updatedAt: "Today, 09:48",
    updatedAgo: "2h ago",
    channel: "Helpdesk · Chat",
    project: "ERP Support – SCM",
    description: "Provision approval role for 6 new joiners in the SCM approval hierarchy.",
    workDone:
      "Created role bundle, assigned 6 users, validated approval routing in UAT and moved config to production.",
    comments: [
      { author: "P. Menon", at: "16:41", body: "6 new joiners start Monday, access needed before then." },
    ],
    aiSummary:
      "Provisioned SCM approval roles for 6 new joiners and validated approval routing before production release.",
    aiConfidence: 88,
    aiRationale:
      "Matches the standard service-request template for role provisioning. User count extracted directly from the ticket body; low-risk mapping with a high template match score.",
    suggested: {
      project: "ERP Support – SCM",
      module: "Access Management",
      category: "Service Request",
      task: "Role provisioning",
      hours: "1.0",
      date: "2026-08-07",
      notes: "Role bundle validated in UAT before production move.",
    },
    aiSignals: [
      "Recognised standard service-request pattern",
      "User count extracted from ticket body",
      "Low-risk mapping, high template match",
    ],
  },
  {
    id: "HD-48090",
    title: "Dashboard latency after data model release",
    requester: "A. Verma · BI Team",
    assignee: "You (D. Sharma)",
    priority: "low",
    status: "Needs Review",
    openedAt: "2 days ago",
    updatedAt: "Today, 10:04",
    updatedAgo: "2h ago",
    channel: "Helpdesk · Email",
    project: "Analytics Platform",
    description: "Executive dashboards load in 14s after the latest semantic model deployment.",
    workDone:
      "Profiled queries, added aggregate table, refreshed incremental partitions; load time down to 2.8s.",
    comments: [
      { author: "A. Verma", at: "Wed 15:20", body: "Leadership review tomorrow, dashboards unusable." },
      { author: "D. Sharma", at: "Thu 09:40", body: "Aggregate table added, measuring improvement." },
    ],
    aiSummary:
      "Optimised dashboard query performance with an aggregate table and partition refresh, cutting load time from 14s to 2.8s.",
    aiConfidence: 62,
    aiRationale:
      "Performance metrics were parsed from the worklog, but the ticket spans two days with sparse notes, so the hour estimate is uncertain. Confidence is below the configured threshold — manual review required.",
    suggested: {
      project: "Analytics Platform",
      module: "Reporting Layer",
      category: "Performance Tuning",
      task: "Query & aggregation optimisation",
      hours: "4.0",
      date: "2026-08-06",
      notes: "Load time 14s → 2.8s after aggregation change.",
    },
    aiSignals: [
      "Performance metrics parsed from worklog",
      "Mapped to Reporting Layer module",
      "Hour estimate uncertain — multi-day ticket",
    ],
  },
  {
    id: "HD-48061",
    title: "Integration bus retry storm on GRN events",
    requester: "M. Fernandes · Warehouse IT",
    assignee: "K. Rao",
    priority: "high",
    status: "Failed",
    openedAt: "2 days ago",
    updatedAt: "Today, 08:32",
    updatedAgo: "4h ago",
    channel: "Helpdesk · Monitoring",
    project: "ERP Support – SCM",
    description:
      "Goods-receipt events replayed 40k times overnight, saturating the integration bus queue.",
    workDone:
      "Disabled faulty retry policy, purged duplicate events, added idempotency key on GRN publisher.",
    comments: [
      { author: "K. Rao", at: "06:12", body: "Retry policy disabled, purging duplicates." },
    ],
    aiSummary:
      "Stopped a GRN event retry storm by disabling the faulty retry policy, purging duplicates and adding an idempotency key.",
    aiConfidence: 79,
    aiRationale:
      "Incident classification is confident, but the OPM project code returned a validation error on submission (closed period). Values need review before retry.",
    suggested: {
      project: "ERP Support – SCM",
      module: "Integration Bus",
      category: "Incident Resolution",
      task: "Root cause documentation",
      hours: "5.5",
      date: "2026-08-05",
      notes: "Idempotency key added to GRN publisher.",
    },
    aiSignals: [
      "Monitoring alert linked to ticket",
      "Duplicate event count extracted: 40,000",
      "Submission rejected by OPM period lock",
    ],
    error: "OPM rejected the entry: posting period 2026-08-05 is locked for project ERP Support – SCM.",
  },
  {
    id: "HD-48044",
    title: "Bank reconciliation report missing FX column",
    requester: "L. Dsouza · Treasury",
    assignee: "R. Iyer",
    priority: "medium",
    status: "Draft",
    openedAt: "3 days ago",
    updatedAt: "Yesterday, 17:20",
    updatedAgo: "1d ago",
    channel: "Helpdesk · Portal",
    project: "Analytics Platform",
    description: "Daily reconciliation extract dropped the FX revaluation column after release 24.6.",
    workDone: "Restored column mapping in the extract definition and back-filled 3 days of reports.",
    comments: [{ author: "L. Dsouza", at: "Mon 11:02", body: "Treasury sign-off is blocked." }],
    aiSummary:
      "Restored the FX revaluation column in the reconciliation extract and back-filled three days of reports.",
    aiConfidence: 85,
    aiRationale:
      "Change is scoped to a report definition, mapping to the Reporting Layer module and an Enhancement category. Saved as a draft by the assignee pending hour confirmation.",
    suggested: {
      project: "Analytics Platform",
      module: "Reporting Layer",
      category: "Enhancement",
      task: "Query & aggregation optimisation",
      hours: "1.5",
      date: "2026-08-06",
      notes: "Back-filled 3 days of reconciliation reports.",
    },
    aiSignals: [
      "Report definition change detected",
      "Back-fill scope extracted: 3 days",
      "Draft saved by assignee",
    ],
  },
  {
    id: "HD-48012",
    title: "Duplicate purchase requisition numbers",
    requester: "T. Bhatt · Procurement",
    assignee: "Unassigned",
    priority: "low",
    status: "New",
    openedAt: "Today, 09:58",
    updatedAt: "Today, 09:58",
    updatedAgo: "2h ago",
    channel: "Helpdesk · Portal",
    project: "ERP Support – SCM",
    description: "Two requisitions were issued the same document number in the APAC number range.",
    workDone: "",
    comments: [],
    aiSummary: "",
    aiConfidence: 0,
    aiRationale: "Not analysed yet — ticket was synced in the latest run and is queued for AI analysis.",
    suggested: {
      project: "",
      module: "",
      category: "",
      task: "",
      hours: "",
      date: "2026-08-07",
      notes: "",
    },
    aiSignals: [],
  },
];

export const opmOptions = {
  project: [
    "ERP Support – Payroll",
    "ERP Support – SCM",
    "Finance Automation",
    "Analytics Platform",
  ],
  module: [
    "Payroll Engine",
    "Invoice Capture",
    "Access Management",
    "Reporting Layer",
    "Integration Bus",
  ],
  category: [
    "Incident Resolution",
    "Configuration Change",
    "Service Request",
    "Performance Tuning",
    "Enhancement",
  ],
  task: [
    "Batch job failure analysis & rerun",
    "OCR template mapping update",
    "Role provisioning",
    "Query & aggregation optimisation",
    "Root cause documentation",
  ],
};

export const assignees = ["You (D. Sharma)", "R. Iyer", "K. Rao", "Unassigned"];

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/30" },
  medium: { label: "Medium", className: "bg-primary/15 text-primary border-primary/30" },
  low: { label: "Low", className: "bg-cyan/12 text-cyan border-cyan/25" },
};

export const statusMeta: Record<TicketStatus, string> = {
  New: "border-border bg-surface-2 text-muted-foreground",
  "AI Analyzed": "border-primary/30 bg-primary/12 text-primary",
  "Needs Review": "border-warning/35 bg-warning/12 text-warning",
  "Pending Approval": "border-cyan/30 bg-cyan/12 text-cyan",
  Submitted: "border-success/35 bg-success/15 text-success",
  Failed: "border-destructive/35 bg-destructive/15 text-destructive",
  Draft: "border-border bg-surface-2 text-foreground/70",
  Rejected: "border-destructive/25 bg-destructive/10 text-destructive/90",
};

export type TimelineStep = {
  label: string;
  detail: string;
  state: "done" | "active" | "pending";
};

export const automationSteps: TimelineStep[] = [
  { label: "Helpdesk sync", detail: "24 tickets pulled · 4 new", state: "done" },
  { label: "AI understanding", detail: "Work-done summaries generated", state: "done" },
  { label: "OPM mapping", detail: "Fields suggested, awaiting review", state: "active" },
  { label: "Validation", detail: "Rule engine checks pending", state: "pending" },
  { label: "User approval", detail: "Manual confirmation required", state: "pending" },
  { label: "OPM submission", detail: "Runs only after approval", state: "pending" },
];

export const workflowStages = [
  "Ticket",
  "AI Analysis",
  "Mapping",
  "User Review",
  "Approval",
  "Submit",
  "Success",
];

export type HistoryAction =
  | "Synced"
  | "AI analyzed"
  | "Edited"
  | "Approved"
  | "Rejected"
  | "Submitted"
  | "Failed";

export type HistoryEntry = {
  id: string;
  time: string;
  date: string;
  ticket: string;
  action: HistoryAction;
  user: string;
  status: "success" | "pending" | "blocked";
  opmRef: string;
  detail: string;
};

export const historyLog: HistoryEntry[] = [
  {
    id: "h1",
    time: "11:52",
    date: "2026-08-07",
    ticket: "HD-48213",
    action: "Submitted",
    user: "D. Sharma",
    status: "success",
    opmRef: "OPM-2026-118342",
    detail: "3.5 h logged to ERP Support – Payroll · Payroll Engine",
  },
  {
    id: "h2",
    time: "11:50",
    date: "2026-08-07",
    ticket: "HD-48213",
    action: "Approved",
    user: "D. Sharma",
    status: "success",
    opmRef: "—",
    detail: "Mapping approved after editing hours 4.0 → 3.5",
  },
  {
    id: "h3",
    time: "11:41",
    date: "2026-08-07",
    ticket: "HD-48213",
    action: "Edited",
    user: "D. Sharma",
    status: "success",
    opmRef: "—",
    detail: "Hours adjusted, notes added",
  },
  {
    id: "h4",
    time: "11:20",
    date: "2026-08-07",
    ticket: "HD-48198",
    action: "AI analyzed",
    user: "Assistant",
    status: "pending",
    opmRef: "—",
    detail: "Mapping suggested at 91% confidence · awaiting approval",
  },
  {
    id: "h5",
    time: "10:47",
    date: "2026-08-07",
    ticket: "HD-48155",
    action: "AI analyzed",
    user: "Assistant",
    status: "pending",
    opmRef: "—",
    detail: "Mapping suggested at 88% confidence",
  },
  {
    id: "h6",
    time: "10:04",
    date: "2026-08-07",
    ticket: "HD-48090",
    action: "AI analyzed",
    user: "Assistant",
    status: "blocked",
    opmRef: "—",
    detail: "Confidence 62% below threshold · marked Needs Review",
  },
  {
    id: "h7",
    time: "08:32",
    date: "2026-08-07",
    ticket: "HD-48061",
    action: "Failed",
    user: "K. Rao",
    status: "blocked",
    opmRef: "—",
    detail: "OPM rejected entry · posting period locked",
  },
  {
    id: "h8",
    time: "09:31",
    date: "2026-08-07",
    ticket: "—",
    action: "Synced",
    user: "Assistant",
    status: "success",
    opmRef: "—",
    detail: "Helpdesk sync completed · 24 tickets, 4 new",
  },
  {
    id: "h9",
    time: "17:20",
    date: "2026-08-06",
    ticket: "HD-48044",
    action: "Edited",
    user: "R. Iyer",
    status: "pending",
    opmRef: "—",
    detail: "Saved as draft pending hour confirmation",
  },
  {
    id: "h10",
    time: "16:02",
    date: "2026-08-06",
    ticket: "HD-47990",
    action: "Rejected",
    user: "R. Iyer",
    status: "blocked",
    opmRef: "—",
    detail: "AI mapping rejected · wrong project suggested",
  },
];

export type Notification = {
  id: string;
  kind: "ticket" | "ai" | "approval" | "success" | "error" | "connection";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    kind: "approval",
    title: "2 mappings need your approval",
    detail: "HD-48198 and HD-48155 are ready for review.",
    time: "11:20",
    unread: true,
  },
  {
    id: "n2",
    kind: "error",
    title: "Submission failed · HD-48061",
    detail: "OPM posting period is locked for 2026-08-05.",
    time: "08:32",
    unread: true,
  },
  {
    id: "n3",
    kind: "ai",
    title: "AI analysis completed",
    detail: "4 new tickets analysed, 1 below confidence threshold.",
    time: "10:04",
    unread: true,
  },
  {
    id: "n4",
    kind: "success",
    title: "Submitted to OPM · HD-48213",
    detail: "Reference OPM-2026-118342 · 3.5 h.",
    time: "11:52",
    unread: false,
  },
  {
    id: "n5",
    kind: "ticket",
    title: "4 new tickets synced",
    detail: "Latest helpdesk sync pulled 24 tickets.",
    time: "09:31",
    unread: false,
  },
  {
    id: "n6",
    kind: "connection",
    title: "OPM session refreshed",
    detail: "Connection restored after a 40s timeout.",
    time: "07:15",
    unread: false,
  },
];

export const connections = {
  helpdesk: {
    label: "Helpdesk",
    status: "Connected" as "Connected" | "Disconnected",
    detail: "servicedesk.acme-corp.com · API v3",
  },
  opm: {
    label: "OPM",
    status: "Connected" as "Connected" | "Disconnected",
    detail: "opm.acme-corp.com · session valid 42m",
  },
  lastSync: "Today, 09:31 (2h 58m ago)",
  nextSync: "Today, 12:31",
  health: {
    label: "Automation healthy",
    detail: "6/6 checks passing · 1 submission needs attention",
    state: "warning" as "healthy" | "warning" | "down",
  },
};

export const summaryCards = [
  { label: "New tickets", value: "4", trend: "since 09:31 sync", tone: "cyan" as const },
  { label: "Pending AI review", value: "3", trend: "avg 84% confidence", tone: "primary" as const },
  { label: "Pending your approval", value: "2", trend: "no auto-submit", tone: "primary" as const },
  { label: "Submitted today", value: "5", trend: "12.5 h logged", tone: "success" as const },
  { label: "Failed / needs attention", value: "2", trend: "action required", tone: "destructive" as const },
];

export const AI_DISCLAIMER = "AI-generated mappings require user review before submission.";

export const defaultSettings = {
  helpdeskUrl: "https://servicedesk.acme-corp.com",
  helpdeskKey: "••••••••••••8f2a",
  opmUrl: "https://opm.acme-corp.com",
  opmKey: "••••••••••••41cd",
  aiProvider: "Lovable AI Gateway",
  aiModel: "google/gemini-2.5-flash",
  aiKey: "••••••••••••b7e0",
  defaultProject: "ERP Support – Payroll",
  defaultCategory: "Incident Resolution",
  syncInterval: "Every 3 hours",
  confidenceThreshold: 75,
  theme: "Dark (default)",
  notify: {
    newTickets: true,
    aiComplete: true,
    approvalRequired: true,
    submissionSuccess: false,
    submissionFailed: true,
    connectionIssues: true,
  },
};

export function buildMappingFields(t: Ticket): MappingField[] {
  const c = t.aiConfidence;
  return [
    { key: "project", label: "Project", aiValue: t.suggested.project, userValue: t.suggested.project, confidence: Math.min(99, c + 2), kind: "select" },
    { key: "module", label: "Module", aiValue: t.suggested.module, userValue: t.suggested.module, confidence: c, kind: "select" },
    { key: "task", label: "Task / Activity", aiValue: t.suggested.task, userValue: t.suggested.task, confidence: Math.max(35, c - 6), kind: "select" },
    { key: "category", label: "OPM category", aiValue: t.suggested.category, userValue: t.suggested.category, confidence: Math.max(40, c - 3), kind: "select" },
    { key: "workDone", label: "Work done", aiValue: t.aiSummary, userValue: t.aiSummary, confidence: c, kind: "textarea" },
    { key: "hours", label: "Hours", aiValue: t.suggested.hours, userValue: t.suggested.hours, confidence: Math.max(30, c - 14), kind: "number" },
    { key: "date", label: "Date", aiValue: t.suggested.date, userValue: t.suggested.date, confidence: Math.min(99, c + 3), kind: "date" },
    { key: "notes", label: "Notes", aiValue: t.suggested.notes, userValue: t.suggested.notes, confidence: Math.max(30, c - 20), kind: "text" },
  ];
}
