import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Bot,
  CheckCircle2,
  Plug,
  RefreshCw,
  Ticket as TicketIcon,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { connections, notifications as seedNotifications } from "@/lib/opm-data";
import { Btn, Chip } from "@/components/opm/ui";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/tickets", label: "Tickets" },
  { to: "/mapping", label: "OPM Mapping" },
  { to: "/approvals", label: "Approvals" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
] as const;

const kindIcon = {
  ticket: TicketIcon,
  ai: Bot,
  approval: CheckCircle2,
  success: CheckCircle2,
  error: AlertTriangle,
  connection: Plug,
} as const;

export function ConnectionChip({
  label,
  status,
}: {
  label: string;
  status: "Connected" | "Disconnected";
}) {
  const ok = status === "Connected";
  return (
    <Chip
      className={cn(
        "font-medium",
        ok ? "border-success/30 bg-success/12 text-success" : "border-destructive/30 bg-destructive/12 text-destructive",
      )}
    >
      <span className={cn("size-1.5 rounded-full", ok ? "bg-success" : "bg-destructive")} />
      {label} · {status}
    </Chip>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(seedNotifications);
  const unread = items.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] aura" />

      <header className="relative z-20 border-b border-border/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl brand-gradient glow-ring">
              <Zap className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">Smart OPM Automation Assistant</p>
              <p className="text-xs text-muted-foreground">Operations control workspace</p>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ConnectionChip label="Helpdesk" status={connections.helpdesk.status} />
            <span className="hidden sm:block">
              <ConnectionChip label="OPM" status={connections.opm.status} />
            </span>

            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                className="relative grid size-9 place-items-center rounded-lg glass-soft transition hover:border-cyan/35"
              >
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 top-11 z-30 w-[330px] rounded-2xl glass p-3 scroll-slim">
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <p className="text-xs font-semibold">Notification center</p>
                    <button
                      onClick={() => setItems((p) => p.map((n) => ({ ...n, unread: false })))}
                      className="ml-auto text-[10px] text-cyan hover:underline"
                    >
                      Mark all read
                    </button>
                    <button onClick={() => setOpen(false)} aria-label="Close notifications">
                      <X className="size-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <ul className="max-h-[340px] space-y-1.5 overflow-y-auto">
                    {items.map((n) => {
                      const Icon = kindIcon[n.kind];
                      return (
                        <li
                          key={n.id}
                          className={cn(
                            "flex items-start gap-2 rounded-xl border border-border/60 p-2.5",
                            n.unread ? "bg-surface-2/60" : "bg-transparent",
                          )}
                        >
                          <Icon
                            className={cn(
                              "mt-0.5 size-3.5 shrink-0",
                              n.kind === "error"
                                ? "text-destructive"
                                : n.kind === "success"
                                  ? "text-success"
                                  : "text-cyan",
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium leading-snug">{n.title}</p>
                            <p className="text-[10px] leading-snug text-muted-foreground">
                              {n.detail}
                            </p>
                          </div>
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                            {n.time}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <Btn variant="primary" size="sm" className="gap-1.5">
              <RefreshCw className="size-3.5" /> Sync now
            </Btn>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 scroll-slim">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground data-[status=active]:bg-surface-2/70 data-[status=active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/extension"
            className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-cyan transition hover:underline"
          >
            Extension popup
          </Link>
        </nav>
      </header>

      <div className="relative">{children}</div>

      <footer className="border-t border-border/70 px-6 py-6">
        <p className="mx-auto max-w-7xl text-[11px] text-muted-foreground">
          Smart OPM Automation Assistant · AI suggestions are recommendations only. Every OPM
          submission requires explicit human approval.
        </p>
      </footer>
    </div>
  );
}
