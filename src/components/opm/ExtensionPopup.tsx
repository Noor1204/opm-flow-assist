import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  History,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  automationSteps,
  historyLog,
  opmOptions,
  priorityMeta,
  tickets,
  type Ticket,
} from "@/lib/opm-data";

type Mapping = {
  project: string;
  module: string;
  category: string;
  task: string;
  hours: string;
};

const emptyMapping: Mapping = { project: "", module: "", category: "", task: "", hours: "" };

function Field({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-lg border border-input bg-surface-2/70 px-3 py-2 text-xs text-foreground outline-none transition",
            "focus:border-cyan/50 focus:ring-2 focus:ring-ring/30",
            !value && "text-muted-foreground",
          )}
        >
          <option value="">Select {label.toLowerCase()}…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronLeft className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 -rotate-90 text-muted-foreground" />
      </div>
    </label>
  );
}

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  const meta = priorityMeta[priority];
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function ExtensionPopup() {
  const [synced, setSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Mapping>(emptyMapping);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [tab, setTab] = useState<"queue" | "activity">("queue");

  const ticket = tickets.find((t) => t.id === selectedId) ?? null;

  const issues = useMemo(() => {
    const list: { level: "error" | "warn" | "ok"; text: string }[] = [];
    const missing = (["project", "module", "category", "task"] as const).filter(
      (k) => !mapping[k],
    );
    if (missing.length) list.push({ level: "error", text: `${missing.length} required field(s) not mapped` });
    const hours = Number(mapping.hours);
    if (!mapping.hours) list.push({ level: "error", text: "Effort hours are required" });
    else if (Number.isNaN(hours) || hours <= 0)
      list.push({ level: "error", text: "Hours must be a positive number" });
    else if (hours > 8) list.push({ level: "warn", text: "Hours exceed the 8 h daily cap" });
    if (ticket && mapping.hours && Number(mapping.hours) !== Number(ticket.suggested.hours))
      list.push({ level: "warn", text: "Hours differ from AI estimate" });
    if (!list.some((i) => i.level === "error"))
      list.push({ level: "ok", text: "Ticket reference, project & task combination valid" });
    return list;
  }, [mapping, ticket]);

  const blocking = issues.some((i) => i.level === "error");

  function selectTicket(t: Ticket) {
    setSelectedId(t.id);
    setMapping({ ...t.suggested });
    setApproved(false);
  }

  function runSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSynced(true);
    }, 1100);
  }

  return (
    <div className="flex h-[640px] w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground">
      {/* Header */}
      <div className="relative shrink-0 overflow-hidden border-b border-border px-4 py-3.5">
        <div className="absolute inset-0 aura opacity-70" />
        <div className="relative flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl brand-gradient glow-ring">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Smart OPM Assistant</p>
            <p className="truncate text-[10px] text-muted-foreground">
              Helpdesk → OPM · human-approved
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full glass-soft px-2 py-1 text-[10px] text-cyan">
            <span className="size-1.5 rounded-full bg-success" />
            Connected
          </span>
        </div>
      </div>

      <div className="scroll-slim flex-1 space-y-3 overflow-y-auto p-3.5">
        {/* Sync */}
        <button
          onClick={runSync}
          disabled={syncing}
          className="group relative w-full overflow-hidden rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-80"
        >
          <span className="flex items-center justify-center gap-2">
            {syncing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {syncing ? "Syncing helpdesk…" : "Sync Helpdesk Tickets"}
          </span>
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          {synced ? "Last sync just now · 24 tickets · 4 need mapping" : "Last sync 09:31 · 24 tickets"}
        </p>

        <div className="flex gap-1 rounded-xl glass-soft p-1">
          {(["queue", "activity"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize transition",
                tab === t
                  ? "bg-primary/20 text-foreground glow-ring"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "queue" ? "Ticket queue" : "Progress & history"}
            </button>
          ))}
        </div>

        {tab === "activity" ? (
          <>
            <section className="rounded-xl glass p-3.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold">
                <Clock className="size-3.5 text-cyan" /> Automation progress
              </h3>
              <ol className="mt-3 space-y-2.5">
                {automationSteps.map((s, i) => (
                  <li key={s.label} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded-full border",
                          s.state === "done" && "border-success/40 bg-success/20 text-success",
                          s.state === "active" &&
                            "border-cyan/50 bg-cyan/20 text-cyan animate-pulse",
                          s.state === "pending" && "border-border bg-surface-2 text-muted-foreground",
                        )}
                      >
                        {s.state === "done" ? <Check className="size-2.5" /> : null}
                      </span>
                      {i < automationSteps.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className="text-[11px] font-medium leading-tight">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-xl glass p-3.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold">
                <History className="size-3.5 text-cyan" /> History log
              </h3>
              <ul className="mt-2.5 divide-y divide-border/60">
                {historyLog.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 py-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{h.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] leading-snug">{h.action}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {h.ticket} · {h.by}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                        h.result === "success" && "border-success/30 bg-success/15 text-success",
                        h.result === "pending" && "border-cyan/25 bg-cyan/12 text-cyan",
                        h.result === "blocked" &&
                          "border-destructive/30 bg-destructive/15 text-destructive",
                      )}
                    >
                      {h.result}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : !ticket ? (
          <section className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTicket(t)}
                className="w-full rounded-xl glass p-3 text-left transition hover:border-cyan/30 hover:glow-ring"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                  <PriorityBadge priority={t.priority} />
                  {submitted.includes(t.id) && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
                      <CheckCircle2 className="size-3" /> logged
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] font-medium leading-snug">{t.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {t.requester} · {t.openedAt}
                </p>
              </button>
            ))}
          </section>
        ) : (
          <>
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" /> Back to queue
            </button>

            {/* Ticket details */}
            <section className="rounded-xl glass p-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-cyan">{ticket.id}</span>
                <PriorityBadge priority={ticket.priority} />
                <span className="ml-auto text-[10px] text-muted-foreground">{ticket.status}</span>
              </div>
              <h3 className="mt-2 text-[13px] font-semibold leading-snug">{ticket.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {ticket.description}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                {[
                  ["Requester", ticket.requester],
                  ["Channel", ticket.channel],
                  ["Opened", ticket.openedAt],
                  ["AI estimate", `${ticket.suggested.hours} h`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-surface-2/60 px-2 py-1.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium leading-tight">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* AI understanding */}
            <section className="relative overflow-hidden rounded-xl glass p-3.5">
              <div className="absolute -right-8 -top-10 size-28 rounded-full brand-gradient opacity-20 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Bot className="size-3.5 text-cyan" />
                  <h3 className="text-xs font-semibold">AI understanding of work done</h3>
                  <span className="ml-auto rounded-full border border-cyan/25 bg-cyan/12 px-2 py-0.5 text-[9px] font-semibold text-cyan">
                    {ticket.aiConfidence}% confidence
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed">{ticket.aiSummary}</p>
                <p className="mt-2 rounded-lg bg-surface-2/60 p-2 text-[10px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Engineer worklog: </span>
                  {ticket.workDone}
                </p>
                <ul className="mt-2 space-y-1">
                  {ticket.aiSignals.map((s) => (
                    <li key={s} className="flex gap-1.5 text-[10px] text-muted-foreground">
                      <Sparkles className="mt-px size-3 shrink-0 text-primary" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* OPM mapping */}
            <section className="rounded-xl glass p-3.5">
              <h3 className="text-xs font-semibold">OPM mapping</h3>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                AI pre-filled — edit any field before approval.
              </p>
              <div className="mt-3 space-y-2.5">
                <Field
                  label="Project"
                  value={mapping.project}
                  options={opmOptions.project}
                  onChange={(v) => setMapping((m) => ({ ...m, project: v }))}
                />
                <Field
                  label="Module"
                  value={mapping.module}
                  options={opmOptions.module}
                  onChange={(v) => setMapping((m) => ({ ...m, module: v }))}
                />
                <Field
                  label="Task category"
                  value={mapping.category}
                  options={opmOptions.category}
                  onChange={(v) => setMapping((m) => ({ ...m, category: v }))}
                />
                <Field
                  label="Task"
                  value={mapping.task}
                  options={opmOptions.task}
                  onChange={(v) => setMapping((m) => ({ ...m, task: v }))}
                />
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Hours
                  </span>
                  <input
                    value={mapping.hours}
                    onChange={(e) => setMapping((m) => ({ ...m, hours: e.target.value }))}
                    inputMode="decimal"
                    placeholder="0.0"
                    className="mt-1 w-full rounded-lg border border-input bg-surface-2/70 px-3 py-2 text-xs outline-none transition focus:border-cyan/50 focus:ring-2 focus:ring-ring/30"
                  />
                </label>
              </div>

              {/* Preview */}
              <div className="mt-3 rounded-lg border border-dashed border-cyan/25 bg-surface-2/40 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan">
                  OPM entry preview
                </p>
                <div className="mt-2 space-y-1 font-mono text-[10px]">
                  {[
                    ["ticket", ticket.id],
                    ["project", mapping.project || "—"],
                    ["module", mapping.module || "—"],
                    ["category", mapping.category || "—"],
                    ["task", mapping.task || "—"],
                    ["hours", mapping.hours || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="w-16 shrink-0 text-muted-foreground">{k}</span>
                      <span className="truncate">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Validation summary */}
            <section className="rounded-xl glass p-3.5">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold">
                <ShieldCheck className="size-3.5 text-cyan" /> Validation summary
              </h3>
              <ul className="mt-2 space-y-1.5">
                {issues.map((i) => (
                  <li key={i.text} className="flex gap-1.5 text-[10px] leading-snug">
                    {i.level === "error" ? (
                      <AlertTriangle className="mt-px size-3 shrink-0 text-destructive" />
                    ) : i.level === "warn" ? (
                      <Info className="mt-px size-3 shrink-0 text-warning" />
                    ) : (
                      <CheckCircle2 className="mt-px size-3 shrink-0 text-success" />
                    )}
                    <span
                      className={cn(
                        i.level === "error" && "text-destructive",
                        i.level === "warn" && "text-warning",
                        i.level === "ok" && "text-muted-foreground",
                      )}
                    >
                      {i.text}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <label className="flex items-start gap-2 rounded-xl glass-soft p-3">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="mt-0.5 size-3.5 accent-[oklch(0.82_0.14_197)]"
              />
              <span className="text-[10px] leading-snug text-muted-foreground">
                I reviewed the AI mapping and confirm it reflects the work done. Nothing is
                submitted to OPM automatically.
              </span>
            </label>

            <button
              disabled={blocking || !approved}
              onClick={() => setConfirmOpen(true)}
              className="w-full rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review & submit to OPM
            </button>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmOpen && ticket && (
        <div className="absolute inset-0 z-20 flex items-end rounded-2xl bg-background/70 p-3 backdrop-blur-sm">
          <div className="w-full rounded-xl glass p-4">
            <h4 className="text-sm font-semibold">Confirm OPM submission</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {mapping.hours} h will be logged against{" "}
              <span className="text-foreground">{mapping.task}</span> in {mapping.project} for
              ticket {ticket.id}. This action is recorded in the history log.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-border bg-surface-2/70 px-3 py-2 text-xs font-medium transition hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSubmitted((s) => [...s, ticket.id]);
                  setConfirmOpen(false);
                  setSelectedId(null);
                }}
                className="flex-1 rounded-lg brand-gradient px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Approve & submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
