import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildMappingFields,
  defaultSettings,
  opmOptions,
  workflowStages,
  type MappingField,
  type Ticket,
} from "@/lib/opm-data";
import {
  AiNotice,
  Btn,
  Card,
  Chip,
  Confidence,
  Input,
  Label,
  SectionTitle,
  Select,
  StatusBadge,
  Textarea,
} from "@/components/opm/ui";

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Phase = "editing" | "approved" | "submitting" | "success" | "failed" | "draft" | "rejected";

export function WorkflowStepper({ stage }: { stage: Stage }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {workflowStages.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
              i < stage && "border-success/35 bg-success/12 text-success",
              i === stage && "border-cyan/40 bg-cyan/12 text-cyan",
              i > stage && "border-border bg-surface-2/60 text-muted-foreground",
            )}
          >
            {s}
          </span>
          {i < workflowStages.length - 1 && (
            <span className="h-px w-3 bg-border" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}

function optionsFor(key: MappingField["key"]) {
  if (key === "project") return opmOptions.project;
  if (key === "module") return opmOptions.module;
  if (key === "task") return opmOptions.task;
  if (key === "category") return opmOptions.category;
  return [];
}

export function MappingEditor({ ticket }: { ticket: Ticket }) {
  const threshold = defaultSettings.confidenceThreshold;
  const [fields, setFields] = useState<MappingField[]>(() => buildMappingFields(ticket));
  const [approved, setApproved] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>(
    ticket.status === "Failed" ? "failed" : ticket.status === "Draft" ? "draft" : "editing",
  );
  const [edited, setEdited] = useState(false);

  const value = (k: MappingField["key"]) => fields.find((f) => f.key === k)?.userValue ?? "";
  const set = (k: MappingField["key"], v: string) => {
    setEdited(true);
    setFields((prev) => prev.map((f) => (f.key === k ? { ...f, userValue: v } : f)));
  };

  const validation = useMemo(() => {
    const issues: { level: "error" | "warn" | "ok"; text: string }[] = [];
    const missing = fields.filter((f) => f.key !== "notes" && !f.userValue.trim());
    if (missing.length)
      issues.push({
        level: "error",
        text: `${missing.length} required field(s) empty: ${missing.map((m) => m.label).join(", ")}`,
      });
    const hours = Number(value("hours"));
    if (hours > 8)
      issues.push({ level: "warn", text: `Hours (${hours}) exceed the 8 h daily cap for one entry` });
    const aiHours = Number(ticket.suggested.hours || 0);
    if (aiHours && hours && Math.abs(hours - aiHours) / aiHours > 0.25)
      issues.push({
        level: "warn",
        text: `Hours deviate ${Math.round((Math.abs(hours - aiHours) / aiHours) * 100)}% from the AI estimate (${aiHours} h)`,
      });
    const low = fields.filter((f) => f.confidence && f.confidence < threshold);
    if (low.length)
      issues.push({
        level: "warn",
        text: `Low AI confidence on: ${low.map((l) => l.label).join(", ")} — verify manually`,
      });
    if (ticket.aiConfidence && ticket.aiConfidence < threshold)
      issues.push({
        level: "warn",
        text: `Overall confidence ${ticket.aiConfidence}% is below the ${threshold}% threshold — marked "Needs Review"`,
      });
    if (!issues.length) issues.push({ level: "ok", text: "All rule-engine checks passed" });
    return issues;
  }, [fields, ticket, threshold, value]);

  const blocking = validation.some((v) => v.level === "error");
  const stage: Stage =
    phase === "success" ? 6 : phase === "submitting" ? 5 : approved ? 4 : edited ? 3 : 2;

  const submitted = {
    Ticket: `${ticket.id} · ${ticket.title}`,
    Project: value("project"),
    Module: value("module"),
    Activity: value("task"),
    Category: value("category"),
    "Work done": value("workDone"),
    Hours: value("hours"),
    Date: value("date"),
    Notes: value("notes") || "—",
  };

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          icon={ShieldCheck}
          right={
            <>
              <StatusBadge status={ticket.status} />
              <Confidence value={ticket.aiConfidence} threshold={threshold} />
            </>
          }
        >
          Approval workflow · {ticket.id}
        </SectionTitle>
        <div className="mt-4">
          <WorkflowStepper stage={stage} />
        </div>
        <AiNotice className="mt-4" />
      </Card>

      <Card>
        <SectionTitle icon={Pencil}>OPM mapping editor</SectionTitle>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Every field is editable. Fields with confidence below {threshold}% are highlighted.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {fields.map((f) => {
            const low = f.confidence > 0 && f.confidence < threshold;
            const changed = f.userValue !== f.aiValue;
            return (
              <div
                key={f.key}
                className={cn(
                  "rounded-xl border p-3",
                  low ? "border-warning/40 bg-warning/[0.06]" : "border-border/70 bg-surface-2/30",
                  f.key === "workDone" && "md:col-span-2",
                )}
              >
                <Label
                  hint={
                    <span className="ml-auto flex items-center gap-2">
                      {low && (
                        <Chip className="border-warning/35 bg-warning/12 text-warning">
                          <AlertTriangle className="size-2.5" /> Low confidence
                        </Chip>
                      )}
                      <Confidence value={f.confidence} threshold={threshold} showBar={false} />
                    </span>
                  }
                >
                  {f.label}
                </Label>

                {f.kind === "select" ? (
                  <Select
                    value={f.userValue}
                    onChange={(v) => set(f.key, v)}
                    options={optionsFor(f.key)}
                  />
                ) : f.kind === "textarea" ? (
                  <Textarea
                    value={f.userValue}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder="Describe the work done…"
                  />
                ) : (
                  <Input
                    type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : "text"}
                    step={f.kind === "number" ? "0.5" : undefined}
                    value={f.userValue}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.kind === "number" ? "0.0" : "—"}
                  />
                )}

                <div className="mt-2 grid gap-1 text-[10px] leading-snug">
                  <p className="flex gap-1.5 text-muted-foreground">
                    <Sparkles className="mt-px size-2.5 shrink-0 text-cyan" />
                    <span className="truncate">AI suggested: {f.aiValue || "—"}</span>
                  </p>
                  <p className={cn("truncate", changed ? "text-cyan" : "text-muted-foreground")}>
                    User selected: {f.userValue || "—"}
                    {changed ? " · edited" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={Eye}>Entry preview</SectionTitle>
          <dl className="mt-4 divide-y divide-border/60">
            {Object.entries(submitted).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-2">
                <dt className="text-[11px] text-muted-foreground">{k}</dt>
                <dd className="text-[12px] leading-snug">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <SectionTitle icon={AlertTriangle}>Validation summary</SectionTitle>
          <ul className="mt-4 space-y-2">
            {validation.map((v, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] leading-relaxed",
                  v.level === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
                  v.level === "warn" && "border-warning/30 bg-warning/10 text-warning",
                  v.level === "ok" && "border-success/30 bg-success/10 text-success",
                )}
              >
                {v.level === "ok" ? (
                  <Check className="mt-px size-3 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-px size-3 shrink-0" />
                )}
                {v.text}
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-surface-2/40 p-3">
            <label className="flex items-start gap-2 text-[11px] leading-snug">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => {
                  setApproved(e.target.checked);
                  setPhase(e.target.checked ? "approved" : "editing");
                }}
                className="mt-0.5 size-3.5 accent-[var(--cyan)]"
              />
              I have reviewed this mapping and approve it for OPM submission.
            </label>

            <div className="flex flex-wrap gap-2">
              <Btn
                variant="success"
                size="sm"
                onClick={() => {
                  setApproved(true);
                  setPhase("approved");
                }}
              >
                <CheckCircle2 className="size-3.5" /> Approve
              </Btn>
              <Btn size="sm" onClick={() => setPhase("editing")}>
                <Pencil className="size-3.5" /> Edit
              </Btn>
              <Btn
                variant="danger"
                size="sm"
                onClick={() => {
                  setApproved(false);
                  setPhase("rejected");
                }}
              >
                <XCircle className="size-3.5" /> Reject
              </Btn>

              <Btn size="sm" onClick={() => setPhase("draft")}>
                <Save className="size-3.5" /> Save draft
              </Btn>
              <Btn size="sm" onClick={() => setPreviewOpen(true)}>
                <Eye className="size-3.5" /> Preview
              </Btn>
              <Btn
                variant="primary"
                size="sm"
                disabled={!approved || blocking}
                onClick={() => setPreviewOpen(true)}
              >
                <Send className="size-3.5" /> Submit to OPM
              </Btn>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {blocking
                ? "Submission blocked until required fields are filled."
                : approved
                  ? "Submit opens a final confirmation screen — nothing is sent yet."
                  : "Approve the mapping to enable submission. No auto-submit."}
            </p>
          </div>

          {phase === "rejected" && (
            <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
              Mapping rejected. The ticket returns to the AI review queue with your feedback.
            </p>
          )}
          {phase === "draft" && (
            <p className="mt-3 rounded-xl border border-border bg-surface-2/50 px-3 py-2 text-[11px] text-muted-foreground">
              Draft saved locally. Nothing has been submitted to OPM.
            </p>
          )}
        </Card>
      </div>

      {(phase === "success" || phase === "failed" || phase === "submitting") && (
        <SubmissionResult
          phase={phase}
          ticket={ticket}
          submitted={submitted}
          onRetry={() => setPhase("submitting")}
          onEdit={() => setPhase("editing")}
          onDraft={() => setPhase("draft")}
        />
      )}

      {previewOpen && (
        <PreviewDialog
          submitted={submitted}
          confirmChecked={confirmChecked}
          setConfirmChecked={setConfirmChecked}
          canSubmit={approved && !blocking}
          onClose={() => setPreviewOpen(false)}
          onConfirm={() => {
            setPreviewOpen(false);
            setPhase("submitting");
            setTimeout(() => setPhase(ticket.status === "Failed" ? "failed" : "success"), 1200);
          }}
        />
      )}
    </div>
  );
}

function PreviewDialog({
  submitted,
  confirmChecked,
  setConfirmChecked,
  canSubmit,
  onClose,
  onConfirm,
}: {
  submitted: Record<string, string>;
  confirmChecked: boolean;
  setConfirmChecked: (v: boolean) => void;
  canSubmit: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pre-submission confirmation"
        className="w-full max-w-lg rounded-2xl glass p-5"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Confirm OPM submission</h3>
          <button onClick={onClose} aria-label="Close" className="ml-auto">
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2 text-[11px] font-semibold text-warning">
          <AlertTriangle className="mt-px size-3.5 shrink-0" /> Review carefully before submitting.
        </p>

        <dl className="mt-4 max-h-[300px] divide-y divide-border/60 overflow-y-auto scroll-slim">
          {Object.entries(submitted).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-2">
              <dt className="text-[11px] text-muted-foreground">{k}</dt>
              <dd className="text-[12px] leading-snug">{v || "—"}</dd>
            </div>
          ))}
        </dl>

        <label className="mt-4 flex items-start gap-2 text-[11px] leading-snug">
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            className="mt-0.5 size-3.5 accent-[var(--cyan)]"
          />
          I confirm these values are correct and authorise submission to OPM.
        </label>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Btn size="sm" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="primary" size="sm" disabled={!confirmChecked || !canSubmit} onClick={onConfirm}>
            <Send className="size-3.5" /> Submit now
          </Btn>
        </div>
      </div>
    </div>
  );
}

function SubmissionResult({
  phase,
  ticket,
  submitted,
  onRetry,
  onEdit,
  onDraft,
}: {
  phase: "success" | "failed" | "submitting";
  ticket: Ticket;
  submitted: Record<string, string>;
  onRetry: () => void;
  onEdit: () => void;
  onDraft: () => void;
}) {
  if (phase === "submitting") {
    return (
      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="size-4 animate-spin text-cyan" /> Submission in progress…
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Posting the approved entry to OPM. Do not close the extension.
        </p>
      </Card>
    );
  }

  const ok = phase === "success";
  return (
    <Card className={cn(ok ? "border-success/25" : "border-destructive/25")}>
      <SectionTitle icon={ok ? CheckCircle2 : XCircle}>
        {ok ? "Submission successful" : "Submission failed"}
      </SectionTitle>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <dl className="divide-y divide-border/60">
          <Row k="Status" v={ok ? "Success" : "Failed"} tone={ok ? "success" : "error"} />
          <Row k="OPM reference" v={ok ? ticket.opmRef ?? "OPM-2026-118377" : "—"} />
          <Row k="Timestamp" v={ok ? ticket.submittedAt ?? "Today, 11:52" : "Today, 08:32"} />
          <Row k="Ticket ID" v={ticket.id} />
        </dl>
        <dl className="divide-y divide-border/60">
          {Object.entries(submitted)
            .filter(([k]) => k !== "Ticket")
            .map(([k, v]) => (
              <Row key={k} k={k} v={v || "—"} />
            ))}
        </dl>
      </div>

      {!ok && (
        <>
          <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] leading-relaxed text-destructive">
            {ticket.error ?? "OPM rejected the entry. Check the project period and try again."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="primary" size="sm" onClick={onRetry}>
              <RotateCcw className="size-3.5" /> Retry submission
            </Btn>
            <Btn size="sm" onClick={onEdit}>
              <Pencil className="size-3.5" /> Edit mapping
            </Btn>
            <Btn size="sm" onClick={onDraft}>
              <FileText className="size-3.5" /> Save as draft
            </Btn>
          </div>
        </>
      )}
    </Card>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: "success" | "error" }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{k}</dt>
      <dd
        className={cn(
          "text-[12px] leading-snug",
          tone === "success" && "font-semibold text-success",
          tone === "error" && "font-semibold text-destructive",
        )}
      >
        {v}
      </dd>
    </div>
  );
}
