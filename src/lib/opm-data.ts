export type Priority = "critical" | "high" | "medium" | "low";

export type Ticket = {
  id: string;
  title: string;
  requester: string;
  priority: Priority;
  status: string;
  openedAt: string;
  channel: string;
  description: string;
  workDone: string;
  aiSummary: string;
  aiConfidence: number;
  suggested: {
    project: string;
    module: string;
    category: string;
    task: string;
    hours: string;
  };
  aiSignals: string[];
};

export const tickets: Ticket[] = [
  {
    id: "HD-48213",
    title: "Payroll batch job failing for APAC entities",
    requester: "N. Ramanathan · Finance Ops",
    priority: "critical",
    status: "In Progress",
    openedAt: "Today, 08:12",
    channel: "Helpdesk · Email",
    description:
      "Nightly payroll consolidation job aborted with a locking error for 3 APAC legal entities. Payslip release blocked.",
    workDone:
      "Analysed job logs, identified deadlock on staging table, re-indexed PAY_STG_BATCH, re-ran batch for 3 entities and validated 1,842 payslips.",
    aiSummary:
      "Resolved a payroll batch deadlock by re-indexing the staging table and re-running the consolidation for 3 APAC entities, then verified payslip output.",
    aiConfidence: 96,
    suggested: {
      project: "ERP Support – Payroll",
      module: "Payroll Engine",
      category: "Incident Resolution",
      task: "Batch job failure analysis & rerun",
      hours: "3.5",
    },
    aiSignals: [
      "Detected incident keywords: deadlock, batch abort",
      "Matched to Payroll Engine from log references",
      "Effort estimated from 3 worklog notes (08:20 – 11:45)",
    ],
  },
  {
    id: "HD-48198",
    title: "Vendor invoice OCR mismatch on GST fields",
    requester: "S. Kulkarni · Accounts Payable",
    priority: "high",
    status: "Awaiting OPM",
    openedAt: "Today, 07:04",
    channel: "Helpdesk · Portal",
    description:
      "OCR engine posts GST amounts to the wrong tax code for scanned invoices from 4 vendors.",
    workDone:
      "Reviewed 22 sample invoices, corrected tax-code mapping template, retrained OCR field anchors and reprocessed the queue.",
    aiSummary:
      "Fixed GST tax-code mapping in the invoice OCR template and reprocessed the pending vendor invoice queue.",
    aiConfidence: 91,
    suggested: {
      project: "Finance Automation",
      module: "Invoice Capture",
      category: "Configuration Change",
      task: "OCR template mapping update",
      hours: "2.0",
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
    priority: "medium",
    status: "Resolved",
    openedAt: "Yesterday, 16:41",
    channel: "Helpdesk · Chat",
    description: "Provision approval role for 6 new joiners in the SCM approval hierarchy.",
    workDone:
      "Created role bundle, assigned 6 users, validated approval routing in UAT and moved config to production.",
    aiSummary:
      "Provisioned SCM approval roles for 6 new joiners and validated approval routing before production release.",
    aiConfidence: 88,
    suggested: {
      project: "ERP Support – SCM",
      module: "Access Management",
      category: "Service Request",
      task: "Role provisioning",
      hours: "1.0",
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
    priority: "low",
    status: "Monitoring",
    openedAt: "2 days ago",
    channel: "Helpdesk · Email",
    description: "Executive dashboards load in 14s after the latest semantic model deployment.",
    workDone:
      "Profiled queries, added aggregate table, refreshed incremental partitions; load time down to 2.8s.",
    aiSummary:
      "Optimised dashboard query performance with an aggregate table and partition refresh, cutting load time from 14s to 2.8s.",
    aiConfidence: 84,
    suggested: {
      project: "Analytics Platform",
      module: "Reporting Layer",
      category: "Performance Tuning",
      task: "Query & aggregation optimisation",
      hours: "4.0",
    },
    aiSignals: [
      "Performance metrics parsed from worklog",
      "Mapped to Reporting Layer module",
      "Category inferred: performance tuning",
    ],
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

export const priorityMeta: Record<Priority, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/30" },
  medium: { label: "Medium", className: "bg-primary/15 text-primary border-primary/30" },
  low: { label: "Low", className: "bg-cyan/12 text-cyan border-cyan/25" },
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

export const historyLog = [
  {
    time: "11:52",
    ticket: "HD-48213",
    action: "Mapping approved & submitted to OPM",
    by: "You",
    result: "success" as const,
  },
  {
    time: "11:20",
    ticket: "HD-48198",
    action: "AI mapping generated · awaiting approval",
    by: "Assistant",
    result: "pending" as const,
  },
  {
    time: "10:47",
    ticket: "HD-48155",
    action: "Submitted 1.0 h to ERP Support – SCM",
    by: "You",
    result: "success" as const,
  },
  {
    time: "10:04",
    ticket: "HD-48090",
    action: "Validation blocked · hours exceeded daily cap",
    by: "Rule engine",
    result: "blocked" as const,
  },
  {
    time: "09:31",
    ticket: "—",
    action: "Helpdesk sync completed · 24 tickets",
    by: "Assistant",
    result: "success" as const,
  },
];
