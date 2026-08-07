import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { connections, tickets } from "@/lib/opm-data";
import { Btn, Chip, Confidence, PriorityBadge, StatusBadge } from "@/components/opm/ui";

export function ExtensionPopup() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(connections.lastSync);

  const pending = tickets.filter(
    (t) => t.status === "Pending Approval" || t.status === "Needs Review",
  );
  const recent = tickets.slice(0, 4);

  return (
    <div className="flex h-[640px] w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-background">
      {/* Header */}
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg brand-gradient">
            <Zap className="size-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold">Smart OPM Assistant</p>
            <p className="text-[10px] text-muted-foreground">Quick actions</p>
          </div>
          <button
            aria-label="Notifications"
            className="relative ml-auto grid size-7 place-items-center rounded-lg glass-soft"
          >
            <Bell className="size-3.5" />
            <span className="absolute -right-0.5 -top-0.5 grid size-3.5 place-items-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
              3
            </span>
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Chip
            className={cn(
              connections.helpdesk.status === "Connected"
                ? "border-success/30 bg-success/12 text-success"
                : "border-destructive/30 bg-destructive/12 text-destructive",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" /> Helpdesk
          </Chip>
          <Chip className="border-success/30 bg-success/12 text-success">
            <span className="size-1.5 rounded-full bg-current" /> OPM
          </Chip>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {syncing ? "syncing…" : lastSync}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 scroll-slim">
        <Btn
          variant="primary"
          className="w-full"
          disabled={syncing}
          onClick={() => {
            setSyncing(true);
            setTimeout(() => {
              setSyncing(false);
              setLastSync("Just now");
            }, 1100);
          }}
        >
          {syncing ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Sync in progress…
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5" /> Sync now
            </>
          )}
        </Btn>

        <div className="rounded-xl border border-primary/25 bg-primary/10 px-3 py-2">
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-foreground/85">
            <Sparkles className="mt-px size-3 shrink-0 text-cyan" />
            AI-generated mappings require user review before submission.
          </p>
        </div>

        {/* Pending approvals */}
        <section className="rounded-xl glass-soft p-3">
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold">
              <CheckCircle2 className="size-3.5 text-cyan" /> Pending approvals
            </p>
            <span className="ml-auto rounded-full bg-cyan/15 px-1.5 text-[10px] font-semibold text-cyan">
              {pending.length}
            </span>
          </div>
          <ul className="mt-2 space-y-2">
            {pending.map((t) => (
              <li key={t.id} className="rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                  <span className="ml-auto">
                    <Confidence value={t.aiConfidence} showBar={false} />
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-snug">{t.title}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <StatusBadge status={t.status} />
                  <Link
                    to="/approvals"
                    className="ml-auto text-[10px] font-semibold text-cyan hover:underline"
                  >
                    Review
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent tickets */}
        <section className="rounded-xl glass-soft p-3">
          <p className="text-[11px] font-semibold">Recent tickets</p>
          <ul className="mt-2 divide-y divide-border/50">
            {recent.map((t) => (
              <li key={t.id} className="py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan">{t.id}</span>
                  <span className="ml-auto text-[9px] text-muted-foreground">{t.updatedAgo}</span>
                </div>
                <Link
                  to="/tickets/$id"
                  params={{ id: t.id }}
                  className="mt-0.5 block line-clamp-1 text-[11px] leading-snug hover:text-cyan"
                >
                  {t.title}
                </Link>
                <div className="mt-1 flex items-center gap-1.5">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-border/70 px-4 py-3">
        <Link to="/">
          <Btn className="w-full">
            <ExternalLink className="size-3.5" /> Open full dashboard
            <ArrowUpRight className="size-3" />
          </Btn>
        </Link>
        <p className="mt-2 text-center text-[9px] text-muted-foreground">
          No OPM entry is ever submitted without your approval.
        </p>
      </div>
    </div>
  );
}
