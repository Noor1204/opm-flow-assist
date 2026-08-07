import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bot, MessageSquare, Sparkles, TicketCheck } from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import { MappingEditor } from "@/components/opm/MappingEditor";
import {
  AiNotice,
  Card,
  Confidence,
  PriorityBadge,
  SectionTitle,
  StateBlock,
  StatusBadge,
} from "@/components/opm/ui";
import { defaultSettings, tickets, type Ticket } from "@/lib/opm-data";

export const Route = createFileRoute("/tickets/$id")({
  head: () => ({
    meta: [
      { title: "Ticket Review — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Side-by-side helpdesk ticket detail and AI analysis panel with editable OPM mapping, confidence score and mapping rationale.",
      },
      { property: "og:title", content: "Ticket Review — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Review the original helpdesk ticket next to the AI work-done summary and edit every suggested value before approval.",
      },
    ],
  }),
  loader: ({ params }) => {
    const ticket = tickets.find((t) => t.id === params.id);
    if (!ticket) throw notFound();
    return { ticket };
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <StateBlock kind="error" title="Ticket failed to load" detail={error.message} />
      </div>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <StateBlock
          kind="empty"
          title="Ticket not found"
          detail="This ticket is no longer in the synced queue. Return to the queue and run a fresh sync."
        />
      </div>
    </AppShell>
  ),
  component: TicketDetail,
});

function TicketDetail() {
  const { ticket } = Route.useLoaderData() as { ticket: Ticket };
  const threshold = defaultSettings.confidenceThreshold;
  const low = ticket.aiConfidence > 0 && ticket.aiConfidence < threshold;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to queue
        </Link>

        <div className="mt-4 flex flex-wrap items-start gap-3">
          <div>
            <p className="font-mono text-[11px] text-cyan">{ticket.id}</p>
            <h1 className="mt-1 max-w-2xl text-2xl font-bold leading-snug">{ticket.title}</h1>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <Confidence value={ticket.aiConfidence} threshold={threshold} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <SectionTitle icon={TicketCheck}>Helpdesk ticket</SectionTitle>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Requester", ticket.requester],
                ["Assignee", ticket.assignee],
                ["Project", ticket.project],
                ["Channel", ticket.channel],
                ["Opened", ticket.openedAt],
                ["Last updated", ticket.updatedAt],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-border/60 bg-surface-2/30 p-2.5">
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-[12px] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed">{ticket.description}</p>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Engineer worklog
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed">
                {ticket.workDone || "No worklog captured yet."}
              </p>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <MessageSquare className="size-3" /> Comments & activity
              </p>
              {ticket.comments.length ? (
                <ul className="mt-2 space-y-2">
                  {ticket.comments.map((c, i) => (
                    <li key={i} className="rounded-xl border border-border/60 bg-surface-2/30 p-2.5">
                      <p className="text-[11px] font-medium">
                        {c.author} <span className="text-muted-foreground">· {c.at}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug">{c.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2">
                  <StateBlock
                    kind="empty"
                    title="No comments yet"
                    detail="This ticket has no helpdesk activity beyond the original request."
                  />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Bot}>AI analysis</SectionTitle>
            {ticket.aiConfidence === 0 ? (
              <div className="mt-4">
                <StateBlock
                  kind="loading"
                  title="AI analysis queued"
                  detail="This ticket was pulled in the latest sync and has not been analysed yet."
                />
              </div>
            ) : (
              <>
                {low && (
                  <p className="mt-3 rounded-xl border border-warning/35 bg-warning/10 px-3 py-2 text-[11px] font-semibold text-warning">
                    Confidence {ticket.aiConfidence}% is below the {threshold}% threshold — marked
                    “Needs Review”. Silent submission is disabled.
                  </p>
                )}
                <div className="mt-4 rounded-xl border border-border/60 bg-surface-2/30 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Work done summary
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed">{ticket.aiSummary}</p>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    ["Suggested project", ticket.suggested.project],
                    ["Suggested module", ticket.suggested.module],
                    ["Suggested activity", ticket.suggested.task],
                    ["Suggested OPM category", ticket.suggested.category],
                    ["Suggested hours", `${ticket.suggested.hours} h`],
                    ["Suggested date", ticket.suggested.date],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border/60 bg-surface-2/30 p-2.5">
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="mt-0.5 text-[12px] leading-snug">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-3 rounded-xl border border-primary/25 bg-primary/10 p-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Sparkles className="size-3 text-cyan" /> Why this mapping?
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">
                    {ticket.aiRationale}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {ticket.aiSignals.map((s) => (
                      <li key={s} className="text-[10px] leading-snug text-muted-foreground">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <AiNotice className="mt-3" />
              </>
            )}
          </Card>
        </div>

        <div className="mt-6">
          <MappingEditor ticket={ticket} />
        </div>
      </main>
    </AppShell>
  );
}
