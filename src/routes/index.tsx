import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Check,
  Clock,
  History,
  ShieldCheck,
  Sparkles,
  Ticket as TicketIcon,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtensionPopup } from "@/components/opm/ExtensionPopup";
import { automationSteps, historyLog, priorityMeta, tickets } from "@/lib/opm-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart OPM Automation Assistant — Control Dashboard" },
      {
        name: "description",
        content:
          "Enterprise dashboard for the Smart OPM Automation Assistant: helpdesk ticket sync, AI work-done understanding, OPM mapping with validation and human approval.",
      },
      { property: "og:title", content: "Smart OPM Automation Assistant — Control Dashboard" },
      {
        property: "og:description",
        content:
          "Sync helpdesk tickets, review AI-generated OPM mappings, and approve every submission manually.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Tickets synced today", value: "24", trend: "+4 new", icon: TicketIcon },
  { label: "AI mappings ready", value: "11", trend: "avg 92% confidence", icon: Bot },
  { label: "Awaiting your approval", value: "6", trend: "no auto-submit", icon: ShieldCheck },
  { label: "Hours logged to OPM", value: "37.5", trend: "this week", icon: Clock },
];

function Dashboard() {
  return (
    <main className="min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] aura" />

      <header className="relative border-b border-border/70">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <div className="grid size-10 place-items-center rounded-xl brand-gradient glow-ring">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Smart OPM Automation Assistant</p>
            <p className="text-xs text-muted-foreground">Operations control dashboard</p>
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              to="/extension"
              className="flex items-center gap-1.5 rounded-lg glass-soft px-3 py-2 text-xs font-medium transition hover:border-cyan/30"
            >
              Extension popup <ArrowUpRight className="size-3.5" />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-lg glass-soft px-3 py-2 text-xs text-cyan sm:flex">
              <span className="size-1.5 rounded-full bg-success" /> Helpdesk connected
            </span>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full glass-soft px-3 py-1 text-[11px] text-cyan">
          <Sparkles className="size-3" /> AI-assisted, human-approved
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] sm:text-5xl">
          Helpdesk work turned into <span className="brand-text">clean OPM entries</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The assistant reads resolved tickets, understands what work was actually done, and
          proposes a full OPM mapping. Every entry waits for your explicit approval — nothing is
          ever auto-submitted.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass p-4">
              <div className="flex items-center gap-2">
                <s.icon className="size-4 text-cyan" />
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
              <p className="mt-3 text-3xl font-semibold">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.trend}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            {/* Queue */}
            <div className="rounded-2xl glass p-5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Ticket queue</h2>
                <span className="rounded-full glass-soft px-2 py-0.5 text-[10px] text-muted-foreground">
                  synced 09:31
                </span>
              </div>
              <div className="mt-4 divide-y divide-border/60">
                {tickets.map((t) => (
                  <div key={t.id} className="grid gap-2 py-3.5 sm:grid-cols-[auto_1fr_auto]">
                    <span className="font-mono text-[11px] text-cyan sm:w-20">{t.id}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{t.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t.requester} · {t.channel} · AI est. {t.suggested.hours} h
                      </p>
                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                        <Bot className="mt-px size-3 shrink-0 text-primary" />
                        {t.aiSummary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          priorityMeta[t.priority].className,
                        )}
                      >
                        {priorityMeta[t.priority].label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Timeline */}
              <div className="rounded-2xl glass p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="size-4 text-cyan" /> Automation progress
                </h2>
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
              </div>

              {/* History */}
              <div className="rounded-2xl glass p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <History className="size-4 text-cyan" /> History log
                </h2>
                <ul className="mt-4 divide-y divide-border/60">
                  {historyLog.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 py-2.5">
                      <span className="font-mono text-[11px] text-muted-foreground">{h.time}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] leading-snug">{h.action}</p>
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
              </div>
            </div>
          </div>

          {/* Live popup */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl glass p-5">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Extension popup</h2>
                <span className="rounded-full glass-soft px-2 py-0.5 text-[10px] text-cyan">
                  live preview
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Same design language as the dashboard — click a ticket to walk the full mapping and
                approval flow.
              </p>
              <div className="mt-4 flex justify-center">
                <div className="relative">
                  <ExtensionPopup />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-border/70 px-6 py-6">
        <p className="mx-auto max-w-7xl text-[11px] text-muted-foreground">
          Smart OPM Automation Assistant · every OPM submission requires explicit human approval.
        </p>
      </footer>
    </main>
  );
}
