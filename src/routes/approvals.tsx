import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  RotateCcw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import { WorkflowStepper } from "@/components/opm/MappingEditor";
import {
  AiNotice,
  Btn,
  Card,
  Confidence,
  PriorityBadge,
  SectionTitle,
  StateBlock,
  StatusBadge,
  Textarea,
} from "@/components/opm/ui";
import { buildMappingFields, defaultSettings, tickets, type Ticket } from "@/lib/opm-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Human-in-the-loop approval queue: final pre-submission preview, explicit approval, rejection with reason, and submission results with retry.",
      },
      { property: "og:title", content: "Approvals — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Approve or reject AI-mapped OPM entries. Nothing reaches OPM without an explicit confirmation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Approvals,
});

type Phase = "review" | "approved" | "submitting" | "success" | "failed" | "rejected";

const queue = tickets.filter((t) =>
  ["Pending Approval", "Needs Review", "AI Analyzed", "Failed", "Draft"].includes(t.status),
);

function Approvals() {
  const threshold = defaultSettings.confidenceThreshold;
  const [selected, setSelected] = useState<string | null>(queue[0]?.id ?? null);
  const ticket = queue.find((t) => t.id === selected) ?? null;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <h1 className="text-2xl font-bold">Approval queue</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Every entry needs an explicit human approval and a final preview before it is posted to
          OPM. Auto-submission is disabled by design.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
          <Card className="h-fit">
            <SectionTitle icon={ShieldCheck}>Waiting on you ({queue.length})</SectionTitle>
            {queue.length === 0 ? (
              <div className="mt-4">
                <StateBlock
                  kind="empty"
                  title="Approval queue is clear"
                  detail="No mapped entries are waiting for review. New tickets appear here after AI analysis."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {queue.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelected(t.id)}
                      className={cn(
                        "w-full rounded-xl border p-2.5 text-left transition",
                        t.id === selected
                          ? "border-cyan/40 bg-cyan/[0.07]"
                          : "border-border/70 bg-surface-2/30 hover:border-cyan/25",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                        <span className="ml-auto">
                          <PriorityBadge priority={t.priority} />
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug">{t.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={t.status} />
                        <Confidence value={t.aiConfidence} threshold={threshold} showBar={false} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <AiNotice className="mt-4" />
          </Card>

          {ticket ? (
            <ApprovalPanel key={ticket.id} ticket={ticket} />
          ) : (
            <Card>
              <StateBlock
                kind="empty"
                title="Select an entry"
                detail="Choose a ticket from the queue to see its final pre-submission preview."
                action={
                  <Link to="/tickets">
                    <Btn size="sm">Go to ticket queue</Btn>
                  </Link>
                }
              />
            </Card>
          )}
        </div>
      </main>
    </AppShell>
  );
}

function ApprovalPanel({ ticket }: { ticket: Ticket }) {
  const threshold = defaultSettings.confidenceThreshold;
  const [phase, setPhase] = useState<Phase>("review");
  const [approved, setApproved] = useState(false);
  const [reason, setReason] = useState("");
  const fields = useMemo(() => buildMappingFields(ticket), [ticket]);

  const run = (isRetry: boolean) => {
    setPhase("submitting");
    setTimeout(
      () => setPhase(!isRetry && ticket.status === "Failed" ? "failed" : "success"),
      1200,
    );
  };

  const stage =
    phase === "success" ? 6 : phase === "submitting" ? 5 : approved ? 4 : 3;

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          icon={Eye}
          right={<Confidence value={ticket.aiConfidence} threshold={threshold} />}
        >
          Final preview · {ticket.id}
        </SectionTitle>
        <div className="mt-4">
          <WorkflowStepper stage={stage as 0 | 1 | 2 | 3 | 4 | 5 | 6} />
        </div>

        <dl className="mt-4 divide-y divide-border/60">
          {fields.map((f) => (
            <div key={f.key} className="grid grid-cols-[120px_1fr] gap-3 py-2">
              <dt className="text-[11px] text-muted-foreground">{f.label}</dt>
              <dd className="text-[12px] leading-snug">{f.userValue || "—"}</dd>
            </div>
          ))}
        </dl>

        {ticket.aiConfidence < threshold && (
          <p className="mt-3 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2 text-[11px] font-semibold text-warning">
            Confidence {ticket.aiConfidence}% is below the {threshold}% threshold — verify each field
            in the mapping editor before approving.
          </p>
        )}

        <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-surface-2/40 p-3">
          <label className="flex items-start gap-2 text-[11px] leading-snug">
            <input
              type="checkbox"
              checked={approved}
              disabled={phase === "success" || phase === "submitting"}
              onChange={(e) => {
                setApproved(e.target.checked);
                setPhase(e.target.checked ? "approved" : "review");
              }}
              className="mt-0.5 size-3.5 accent-[var(--cyan)]"
            />
            I have reviewed every value above and approve submission of this entry to OPM.
          </label>

          <div className="flex flex-wrap gap-2">
            <Btn
              variant="primary"
              size="sm"
              disabled={!approved || phase === "submitting" || phase === "success"}
              onClick={() => run(false)}
            >
              <Send className="size-3.5" /> Approve & submit
            </Btn>
            <Link to="/mapping">
              <Btn size="sm">
                <Pencil className="size-3.5" /> Edit mapping
              </Btn>
            </Link>
            <Btn
              variant="danger"
              size="sm"
              disabled={phase === "submitting" || phase === "success"}
              onClick={() => {
                setApproved(false);
                setPhase("rejected");
              }}
            >
              <XCircle className="size-3.5" /> Reject
            </Btn>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {approved
              ? "Approved — submission runs only when you press Approve & submit."
              : "Tick the approval box to enable submission."}
          </p>
        </div>
      </Card>

      {phase === "rejected" && (
        <Card className="border-destructive/25">
          <SectionTitle icon={XCircle}>Rejected</SectionTitle>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Add a reason so the AI mapping can be corrected. The ticket returns to the mapping queue.
          </p>
          <Textarea
            className="mt-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="danger" size="sm" disabled={reason.trim().length < 5}>
              <XCircle className="size-3.5" /> Confirm rejection
            </Btn>
            <Btn size="sm" onClick={() => setPhase("review")}>
              Back to review
            </Btn>
          </div>
        </Card>
      )}

      {phase === "submitting" && (
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Loader2 className="size-4 animate-spin text-cyan" /> Submitting to OPM…
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Posting the approved entry. This usually takes a few seconds.
          </p>
        </Card>
      )}

      {phase === "success" && (
        <Card className="border-success/25">
          <SectionTitle icon={CheckCircle2}>Submitted successfully</SectionTitle>
          <p className="mt-2 text-[12px]">
            OPM reference{" "}
            <span className="font-mono text-success">{ticket.opmRef ?? "OPM-2026-118377"}</span> ·{" "}
            {ticket.submittedAt ?? "Today, 09:48"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/history">
              <Btn size="sm">View in history</Btn>
            </Link>
            <Link to="/tickets">
              <Btn size="sm">Next ticket</Btn>
            </Link>
          </div>
        </Card>
      )}

      {phase === "failed" && (
        <Card className="border-destructive/25">
          <SectionTitle icon={XCircle}>Submission failed</SectionTitle>
          <p className="mt-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] leading-relaxed text-destructive">
            {ticket.error ?? "OPM rejected the entry. Check the project period and retry."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="primary" size="sm" onClick={() => run(true)}>
              <RotateCcw className="size-3.5" /> Retry submission
            </Btn>
            <Link to="/mapping">
              <Btn size="sm">
                <Pencil className="size-3.5" /> Edit mapping
              </Btn>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
