import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AlertTriangle, Info, Loader2, SearchX, Sparkles, WifiOff } from "lucide-react";
import { priorityMeta, statusMeta, type Priority, type TicketStatus } from "@/lib/opm-data";

export function Card({
  className,
  children,
  soft,
}: {
  className?: string;
  children: ReactNode;
  soft?: boolean;
}) {
  return (
    <div className={cn("rounded-2xl p-5", soft ? "glass-soft rounded-xl" : "glass", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  children,
  right,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        {Icon ? <Icon className="size-4 text-cyan" /> : null}
        {children}
      </h2>
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function Chip({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Chip className={statusMeta[status]}>{status}</Chip>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Chip className={priorityMeta[priority].className}>{priorityMeta[priority].label}</Chip>;
}

export function Confidence({
  value,
  threshold = 75,
  showBar = true,
}: {
  value: number;
  threshold?: number;
  showBar?: boolean;
}) {
  const low = value < threshold;
  return (
    <div className="flex items-center gap-2">
      {showBar && (
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              low ? "bg-warning" : "bg-gradient-to-r from-primary to-cyan",
            )}
            style={{ width: `${Math.max(4, value)}%` }}
          />
        </div>
      )}
      <span
        className={cn(
          "font-mono text-[11px] font-semibold",
          low ? "text-warning" : "text-cyan",
        )}
      >
        {value ? `${value}%` : "—"}
      </span>
    </div>
  );
}

type BtnProps = {
  variant?: "primary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Btn({ variant = "outline", size = "md", className, children, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs",
        variant === "primary" &&
          "brand-gradient text-primary-foreground hover:opacity-90 glow-ring",
        variant === "outline" && "glass-soft text-foreground hover:border-cyan/35",
        variant === "ghost" && "text-muted-foreground hover:text-foreground",
        variant === "danger" &&
          "border border-destructive/35 bg-destructive/15 text-destructive hover:bg-destructive/25",
        variant === "success" &&
          "border border-success/35 bg-success/15 text-success hover:bg-success/25",
        className,
      )}
    >
      {children}
    </button>
  );
}

const controlClass =
  "w-full rounded-lg border border-input bg-surface-2/60 px-2.5 py-2 text-xs text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-cyan/45 focus:ring-2 focus:ring-ring/40";

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
      </span>
      {hint}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(controlClass, "appearance-none")}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClass, "min-h-[76px]", props.className)} />;
}

export function AiNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[11px] leading-relaxed text-foreground/85",
        className,
      )}
    >
      <Sparkles className="mt-px size-3.5 shrink-0 text-cyan" />
      AI suggestions are recommendations only. AI-generated mappings require user review before
      submission — nothing is ever auto-submitted.
    </p>
  );
}

export function StateBlock({
  kind,
  title,
  detail,
  action,
}: {
  kind: "loading" | "empty" | "error" | "no-results" | "offline" | "syncing" | "submitting";
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  const Icon =
    kind === "loading" || kind === "syncing" || kind === "submitting"
      ? Loader2
      : kind === "error"
        ? AlertTriangle
        : kind === "no-results"
          ? SearchX
          : kind === "offline"
            ? WifiOff
            : Info;
  const spin = kind === "loading" || kind === "syncing" || kind === "submitting";
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <Icon
        className={cn(
          "size-5",
          spin && "animate-spin text-cyan",
          kind === "error" && "text-destructive",
          kind === "offline" && "text-warning",
          !spin && kind !== "error" && kind !== "offline" && "text-muted-foreground",
        )}
      />
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
      <div className="h-3 flex-1 animate-pulse rounded bg-surface-2" />
      <div className="h-3 w-14 animate-pulse rounded bg-surface-2" />
    </div>
  );
}
