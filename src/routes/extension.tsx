import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Zap } from "lucide-react";
import { ExtensionPopup } from "@/components/opm/ExtensionPopup";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Extension Popup — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Chrome extension popup for the Smart OPM Automation Assistant: sync helpdesk tickets, review AI work-done summaries, map OPM fields and approve submissions.",
      },
      { property: "og:title", content: "Extension Popup — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Ticket list, AI understanding card, OPM mapping with preview, validation summary and approval dialog.",
      },
    ],
  }),
  component: ExtensionPage,
});

function ExtensionPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] aura" />
      <div className="relative mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl brand-gradient glow-ring">
            <Zap className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chrome extension popup</h1>
            <p className="text-xs text-muted-foreground">
              400 × 640 popup surface · toolbar action view
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[420px_1fr]">
          <div className="rounded-3xl glass p-4">
            <div className="mb-3 flex items-center gap-1.5 px-1">
              <span className="size-2 rounded-full bg-destructive/70" />
              <span className="size-2 rounded-full bg-warning/70" />
              <span className="size-2 rounded-full bg-success/70" />
              <span className="ml-2 text-[10px] text-muted-foreground">
                chrome://extension popup
              </span>
            </div>
            <div className="relative">
              <ExtensionPopup />
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                t: "1 · Sync helpdesk tickets",
                d: "One click pulls the latest resolved and in-progress tickets with priority badges.",
              },
              {
                t: "2 · Ticket details",
                d: "Requester, channel, status and the engineer worklog in one compact panel.",
              },
              {
                t: "3 · AI understanding",
                d: "A confidence-scored summary of the work actually done, with the signals used.",
              },
              {
                t: "4 · OPM mapping + preview",
                d: "Project, module, task category, task and hours — pre-filled, fully editable, with a live entry preview.",
              },
              {
                t: "5 · Validation summary",
                d: "Missing fields, hour-cap warnings and AI-estimate deviations surface before submission.",
              },
              {
                t: "6 · Approval required",
                d: "A checkbox plus a confirmation dialog gate every submission. No auto-submit, ever.",
              },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl glass p-4">
                <p className="text-sm font-semibold">{s.t}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
