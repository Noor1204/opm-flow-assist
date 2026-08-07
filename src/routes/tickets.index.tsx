import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Search, Ticket as TicketIcon } from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import {
  AiNotice,
  Btn,
  Card,
  Confidence,
  Input,
  Label,
  PriorityBadge,
  SectionTitle,
  Select,
  SkeletonRow,
  StateBlock,
  StatusBadge,
} from "@/components/opm/ui";
import { assignees, defaultSettings, opmOptions, statusMeta, tickets } from "@/lib/opm-data";

export const Route = createFileRoute("/tickets/")({
  head: () => ({
    meta: [
      { title: "Ticket Queue — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Search, filter and sort synced helpdesk tickets by status, priority, project, assignee, date and AI confidence before OPM mapping.",
      },
      { property: "og:title", content: "Ticket Queue — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Enterprise ticket queue with status badges, AI confidence and bulk selection — never auto-submitting.",
      },
    ],
  }),
  component: TicketQueue,
});

const statuses = Object.keys(statusMeta);
const sortOptions = [
  "Last updated (newest)",
  "Last updated (oldest)",
  "Priority (high → low)",
  "AI confidence (low → high)",
];
const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;

function TicketQueue() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");
  const [date, setDate] = useState("");
  const [minConf, setMinConf] = useState(0);
  const [sort, setSort] = useState(sortOptions[0]!);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const rows = useMemo(() => {
    const out = tickets.filter((t) => {
      const text = `${t.id} ${t.title} ${t.project} ${t.requester}`.toLowerCase();
      return (
        text.includes(q.toLowerCase()) &&
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (!project || t.project === project) &&
        (!assignee || t.assignee === assignee) &&
        (!date || t.suggested.date === date) &&
        t.aiConfidence >= minConf
      );
    });
    return out.sort((a, b) => {
      if (sort === sortOptions[2]) return priorityRank[a.priority] - priorityRank[b.priority];
      if (sort === sortOptions[3]) return a.aiConfidence - b.aiConfidence;
      if (sort === sortOptions[1]) return a.updatedAt.localeCompare(b.updatedAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [q, status, priority, project, assignee, date, minConf, sort]);

  const filtersActive = Boolean(q || status || priority || project || assignee || date || minConf);
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <TicketIcon className="size-5 text-cyan" /> Ticket queue
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          24 tickets synced today · {rows.length} shown
        </p>

        <AiNotice className="mt-4" />

        <Card className="mt-5">
          <SectionTitle
            icon={Filter}
            right={
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQ("");
                  setStatus("");
                  setPriority("");
                  setProject("");
                  setAssignee("");
                  setDate("");
                  setMinConf(0);
                }}
              >
                Reset filters
              </Btn>
            }
          >
            Search & filters
          </SectionTitle>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ticket ID, title, project or requester"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Sort by</Label>
              <Select value={sort} onChange={setSort} options={sortOptions} placeholder="Sort" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onChange={setStatus} options={statuses} placeholder="Any status" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={priority}
                onChange={setPriority}
                options={["critical", "high", "medium", "low"]}
                placeholder="Any priority"
              />
            </div>
            <div>
              <Label>Project</Label>
              <Select
                value={project}
                onChange={setProject}
                options={opmOptions.project}
                placeholder="Any project"
              />
            </div>
            <div>
              <Label>Assignee</Label>
              <Select
                value={assignee}
                onChange={setAssignee}
                options={assignees}
                placeholder="Anyone"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Minimum AI confidence · {minConf}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minConf}
                onChange={(e) => setMinConf(Number(e.target.value))}
                className="w-full accent-[var(--cyan)]"
                aria-label="Minimum AI confidence"
              />
            </div>
          </div>
        </Card>

        <Card className="mt-5">
          <SectionTitle
            right={
              <>
                <span className="text-[11px] text-muted-foreground">
                  {selected.length} selected
                </span>
                <Btn size="sm" disabled={!selected.length}>
                  Run AI analysis
                </Btn>
                <Btn size="sm" disabled={!selected.length}>
                  Assign to me
                </Btn>
                <Btn size="sm" disabled={!selected.length}>
                  Send to review
                </Btn>
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 900);
                  }}
                >
                  Refresh
                </Btn>
              </>
            }
          >
            Tickets
          </SectionTitle>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Bulk actions never submit OPM entries — submission always requires per-ticket approval.
          </p>

          {loading ? (
            <div className="mt-4 divide-y divide-border/50">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="mt-4">
              <StateBlock
                kind={filtersActive ? "no-results" : "empty"}
                title={filtersActive ? "No tickets match your filters" : "No tickets synced yet"}
                detail={
                  filtersActive
                    ? "Try widening the confidence range or clearing status and project filters."
                    : "Run a helpdesk sync to pull the latest resolved and in-progress tickets."
                }
                action={<Btn variant="primary" size="sm">Sync now</Btn>}
              />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto scroll-slim">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/70 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="w-8 py-2">
                      <input
                        type="checkbox"
                        aria-label="Select all tickets"
                        checked={allSelected}
                        onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                        className="size-3.5 accent-[var(--cyan)]"
                      />
                    </th>
                    <th className="py-2">Ticket</th>
                    <th className="py-2">Project</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">AI confidence</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 align-top">
                      <td className="py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${t.id}`}
                          checked={selected.includes(t.id)}
                          onChange={(e) =>
                            setSelected((prev) =>
                              e.target.checked ? [...prev, t.id] : prev.filter((x) => x !== t.id),
                            )
                          }
                          className="size-3.5 accent-[var(--cyan)]"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                        <Link
                          to="/tickets/$id"
                          params={{ id: t.id }}
                          className="block max-w-[320px] text-[12px] font-medium leading-snug hover:text-cyan"
                        >
                          {t.title}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">{t.assignee}</p>
                      </td>
                      <td className="py-3 pr-4 text-[11px] text-muted-foreground">{t.project}</td>
                      <td className="py-3 pr-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 pr-4">
                        <Confidence
                          value={t.aiConfidence}
                          threshold={defaultSettings.confidenceThreshold}
                        />
                      </td>
                      <td className="py-3 text-[11px] text-muted-foreground">{t.updatedAgo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </AppShell>
  );
}
