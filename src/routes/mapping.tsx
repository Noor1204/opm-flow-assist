import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Layers, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import { MappingEditor } from "@/components/opm/MappingEditor";
import {
  AiNotice,
  Btn,
  Card,
  Confidence,
  PriorityBadge,
  SectionTitle,
  SkeletonRow,
  StateBlock,
  StatusBadge,
} from "@/components/opm/ui";
import { defaultSettings, tickets } from "@/lib/opm-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mapping")({
  head: () => ({
    meta: [
      { title: "OPM Mapping Workspace — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Map AI-analysed helpdesk tickets to OPM projects, modules, activities and hours. Every AI suggestion stays editable and needs explicit approval.",
      },
      { property: "og:title", content: "OPM Mapping Workspace — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Pick a ticket, review the AI mapping side by side, edit any field and approve before submission.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MappingWorkspace,
});

const mappable = tickets.filter((t) => t.aiConfidence > 0 && t.status !== "Submitted");

function MappingWorkspace() {
  const [selected, setSelected] = useState<string | null>(mappable[0]?.id ?? null);
  const [analyzing, setAnalyzing] = useState(false);
  const ticket = mappable.find((t) => t.id === selected) ?? null;
  const threshold = defaultSettings.confidenceThreshold;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="text-2xl font-bold">OPM mapping workspace</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              AI analysis on the left, fully editable mapping on the right. Nothing is submitted
              without your approval.
            </p>
          </div>
          <Btn
            variant="primary"
            size="sm"
            className="ml-auto"
            disabled={analyzing}
            onClick={() => {
              setAnalyzing(true);
              setTimeout(() => setAnalyzing(false), 1400);
            }}
          >
            <RefreshCw className={cn("size-3.5", analyzing && "animate-spin")} />
            {analyzing ? "Re-analysing…" : "Re-run AI analysis"}
          </Btn>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[290px_1fr]">
          <Card className="h-fit">
            <SectionTitle icon={Layers}>Awaiting mapping</SectionTitle>
            {mappable.length === 0 ? (
              <div className="mt-4">
                <StateBlock
                  kind="empty"
                  title="Nothing to map"
                  detail="Every analysed ticket has been mapped and submitted. Run a sync to pull new tickets."
                />
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {mappable.map((t) => (
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

          <div className="space-y-5">
            {!ticket ? (
              <Card>
                <StateBlock
                  kind="empty"
                  title="No ticket selected"
                  detail="Pick a ticket from the queue to load its AI analysis and mapping editor."
                  action={
                    <Link to="/tickets">
                      <Btn size="sm">Open ticket queue</Btn>
                    </Link>
                  }
                />
              </Card>
            ) : analyzing ? (
              <Card>
                <SectionTitle icon={Bot}>AI analysis in progress</SectionTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Re-reading ticket {ticket.id}, comments and worklog to regenerate the mapping.
                </p>
                <div className="mt-3 divide-y divide-border/50">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              </Card>
            ) : (
              <>
                <Card>
                  <SectionTitle
                    icon={Sparkles}
                    right={<Confidence value={ticket.aiConfidence} threshold={threshold} />}
                  >
                    AI understanding · {ticket.id}
                  </SectionTitle>
                  <p className="mt-3 text-[12px] leading-relaxed">{ticket.aiSummary}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {ticket.aiRationale}
                  </p>
                  <Link
                    to="/tickets/$id"
                    params={{ id: ticket.id }}
                    className="mt-3 inline-block text-[11px] text-cyan hover:underline"
                  >
                    Open full ticket detail →
                  </Link>
                </Card>
                <MappingEditor key={ticket.id} ticket={ticket} />
              </>
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
