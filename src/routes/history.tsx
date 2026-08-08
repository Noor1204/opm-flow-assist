import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import {
  Btn,
  Card,
  Chip,
  Input,
  SectionTitle,
  Select,
  StateBlock,
} from "@/components/opm/ui";
import { historyLog, type HistoryAction } from "@/lib/opm-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Activity History — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Full audit trail of syncs, AI analyses, edits, approvals, rejections and OPM submissions with references and outcomes.",
      },
      { property: "og:title", content: "Activity History — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content: "Searchable, filterable audit log of every automated and human action.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

const actions: HistoryAction[] = [
  "Synced",
  "AI analyzed",
  "Edited",
  "Approved",
  "Rejected",
  "Submitted",
  "Failed",
];

const statusClass = {
  success: "border-success/30 bg-success/12 text-success",
  pending: "border-cyan/30 bg-cyan/12 text-cyan",
  blocked: "border-destructive/30 bg-destructive/12 text-destructive",
} as const;

function HistoryPage() {
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");

  const rows = useMemo(
    () =>
      historyLog.filter((h) => {
        const matchQ =
          !q.trim() ||
          [h.ticket, h.detail, h.opmRef, h.user].join(" ").toLowerCase().includes(q.toLowerCase());
        return matchQ && (!action || h.action === action);
      }),
    [q, action],
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <h1 className="text-2xl font-bold">Activity history</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Immutable audit trail — every AI action and every human decision, with the OPM reference
          where applicable.
        </p>

        <Card className="mt-6">
          <SectionTitle
            icon={History}
            right={
              <span className="text-[11px] text-muted-foreground">
                {rows.length} of {historyLog.length} events
              </span>
            }
          >
            Audit log
          </SectionTitle>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ticket, user, OPM reference…"
                className="pl-8"
                aria-label="Search history"
              />
            </div>
            <Select value={action} onChange={setAction} options={actions} placeholder="All actions" />
            <Btn
              size="sm"
              onClick={() => {
                setQ("");
                setAction("");
              }}
            >
              Reset
            </Btn>
          </div>

          {rows.length === 0 ? (
            <div className="mt-4">
              <StateBlock
                kind="no-results"
                title="No matching events"
                detail="No audit entries match your search and filter. Try a different ticket ID or action."
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border/60">
              {rows.map((h) => (
                <li key={h.id} className="grid gap-1 py-3 sm:grid-cols-[86px_1fr_auto]">
                  <div className="text-[11px] text-muted-foreground">
                    <p className="font-mono">{h.time}</p>
                    <p>{h.date}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium">
                      <span className="font-mono text-cyan">{h.ticket}</span> · {h.action} ·{" "}
                      <span className="text-muted-foreground">{h.user}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {h.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {h.opmRef ? (
                      <span className="font-mono text-[10px] text-muted-foreground">{h.opmRef}</span>
                    ) : null}
                    <Chip className={cn(statusClass[h.status])}>{h.status}</Chip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </AppShell>
  );
}
