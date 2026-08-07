import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  Clock,
  History,
  Plug,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell, ConnectionChip } from "@/components/opm/AppShell";
import {
  AiNotice,
  Btn,
  Card,
  Chip,
  Confidence,
  PriorityBadge,
  SectionTitle,
  StatusBadge,
} from "@/components/opm/ui";
import {
  automationSteps,
  connections,
  defaultSettings,
  historyLog,
  summaryCards,
  tickets,
} from "@/lib/opm-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Enterprise control dashboard: helpdesk and OPM connection status, sync health, AI review queue, approvals pending and tickets needing attention.",
      },
      { property: "og:title", content: "Dashboard — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Connection status, sync health, AI mapping queue, approvals pending and failed submissions in one enterprise view.",
      },
    ],
  }),
  component: Dashboard,
});

const toneClass = {
  cyan: "text-cyan",
  primary: "text-primary",
  success: "text-success",
  destructive: "text-destructive",
} as const;

function Dashboard() {
  const attention = tickets.filter(
    (t) => t.status === "Failed" || t.status === "Needs Review" || t.status === "New",
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-10">
        <span className="inline-flex items-center gap-1.5 rounded-full glass-soft px-3 py-1 text-[11px] text-cyan">
          <Sparkles className="size-3" /> AI-assisted, human-approved
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.15] sm:text-4xl">
          Helpdesk work turned into <span className="brand-text">clean OPM entries</span>
        </h1>

        {/* Connection strip */}
        <Card className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <ConnectionChip label="Helpdesk" status={connections.helpdesk.status} />
              <ConnectionChip label="OPM" status={connections.opm.status} />
              <Chip
                className={cn(
                  "font-medium",
                  connections.health.state === "healthy"
                    ? "border-success/30 bg-success/12 text-success"
                    : "border-warning/35 bg-warning/12 text-warning",
                )}
              >
                <Activity className="size-2.5" /> {connections.health.label}
              </Chip>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <p className="text-[11px] text-muted-foreground">
                <Clock className="mr-1 inline size-3" /> Last sync: {connections.lastSync} · next{" "}
                {connections.nextSync}
              </p>
              <Btn variant="primary">
                <RefreshCw className="size-3.5" /> Sync now
              </Btn>
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-[11px] text-muted-foreground sm:grid-cols-3">
            <p>
              <Plug className="mr-1 inline size-3 text-cyan" /> {connections.helpdesk.detail}
            </p>
            <p>
              <Plug className="mr-1 inline size-3 text-cyan" /> {connections.opm.detail}
            </p>
            <p>
              <ShieldCheck className="mr-1 inline size-3 text-cyan" /> {connections.health.detail}
            </p>
          </div>
        </Card>

        {/* Summary cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((s) => (
            <div key={s.label} className="rounded-2xl glass p-4">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className={cn("mt-2 text-3xl font-semibold", toneClass[s.tone])}>{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.trend}</p>
            </div>
          ))}
        </div>

        <AiNotice className="mt-4" />

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {/* Needs attention */}
            <Card>
              <SectionTitle
                icon={AlertTriangle}
                right={
                  <Link
                    to="/tickets"
                    className="flex items-center gap-1 text-[11px] text-cyan hover:underline"
                  >
                    Open queue <ArrowUpRight className="size-3" />
                  </Link>
                }
              >
                Needs your attention
              </SectionTitle>
              <div className="mt-4 divide-y divide-border/60">
                {attention.map((t) => (
                  <div key={t.id} className="grid gap-2 py-3 sm:grid-cols-[auto_1fr_auto]">
                    <span className="font-mono text-[11px] text-cyan sm:w-20">{t.id}</span>
                    <div className="min-w-0">
                      <Link
                        to="/tickets/$id"
                        params={{ id: t.id }}
                        className="text-sm font-medium leading-snug hover:text-cyan"
                      >
                        {t.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t.project} · {t.assignee} · updated {t.updatedAgo}
                      </p>
                      {t.error && (
                        <p className="mt-1 text-[11px] leading-snug text-destructive">{t.error}</p>
                      )}
                      {t.status === "Needs Review" && (
                        <p className="mt-1 text-[11px] leading-snug text-warning">
                          AI confidence {t.aiConfidence}% is below the{" "}
                          {defaultSettings.confidenceThreshold}% threshold — manual review required.
                        </p>
                      )}
                      {t.status === "New" && (
                        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                          Not analysed yet — queued for AI analysis.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <SectionTitle icon={Activity}>Automation progress</SectionTitle>
                <ol className="mt-4 space-y-3">
                  {automationSteps.map((s, i) => (
                    <li key={s.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full border",
                            s.state === "done" && "border-success/40 bg-success/20 text-success",
                            s.state === "active" &&
                              "border-cyan/50 bg-cyan/20 text-cyan animate-pulse",
                            s.state === "pending" &&
                              "border-border bg-surface-2 text-muted-foreground",
                          )}
                        >
                          {s.state === "done" ? <Check className="size-3" /> : null}
                        </span>
                        {i < automationSteps.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-1.5">
                        <p className="text-sm font-medium leading-tight">{s.label}</p>
                        <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card>
                <SectionTitle
                  icon={History}
                  right={
                    <Link to="/history" className="text-[11px] text-cyan hover:underline">
                      Full history
                    </Link>
                  }
                >
                  Recent activity
                </SectionTitle>
                <ul className="mt-4 divide-y divide-border/60">
                  {historyLog.slice(0, 6).map((h) => (
                    <li key={h.id} className="flex items-start gap-2.5 py-2.5">
                      <span className="font-mono text-[11px] text-muted-foreground">{h.time}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] leading-snug">
                          <span className="font-medium">{h.action}</span> · {h.detail}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {h.ticket} · {h.user}
                        </p>
                      </div>
                      <Chip
                        className={cn(
                          "mt-0.5",
                          h.status === "success" && "border-success/30 bg-success/15 text-success",
                          h.status === "pending" && "border-cyan/25 bg-cyan/12 text-cyan",
                          h.status === "blocked" &&
                            "border-destructive/30 bg-destructive/15 text-destructive",
                        )}
                      >
                        {h.status}
                      </Chip>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Right rail */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <SectionTitle icon={Bot}>AI review queue</SectionTitle>
              <ul className="mt-4 space-y-3">
                {tickets
                  .filter((t) => t.aiConfidence > 0)
                  .slice(0, 4)
                  .map((t) => (
                    <li key={t.id} className="rounded-xl border border-border/60 bg-surface-2/30 p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                        <span className="ml-auto">
                          <Confidence
                            value={t.aiConfidence}
                            threshold={defaultSettings.confidenceThreshold}
                          />
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] font-medium leading-snug">{t.title}</p>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {t.aiSummary}
                      </p>
                    </li>
                  ))}
              </ul>
            </Card>

            <Card>
              <SectionTitle icon={CheckCircle2}>Quick actions</SectionTitle>
              <div className="mt-4 grid gap-2">
                <Link to="/approvals">
                  <Btn className="w-full justify-start">Review pending approvals (2)</Btn>
                </Link>
                <Link to="/mapping">
                  <Btn className="w-full justify-start">Open OPM mapping editor</Btn>
                </Link>
                <Link to="/tickets">
                  <Btn className="w-full justify-start">Browse ticket queue</Btn>
                </Link>
                <Link to="/extension">
                  <Btn className="w-full justify-start">Preview extension popup</Btn>
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
