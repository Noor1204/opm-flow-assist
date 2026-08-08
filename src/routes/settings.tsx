import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Bot, Plug, Save, ShieldCheck, Sliders } from "lucide-react";
import { AppShell } from "@/components/opm/AppShell";
import {
  AiNotice,
  Btn,
  Card,
  Input,
  Label,
  SectionTitle,
  Select,
} from "@/components/opm/ui";
import { ConnectionChip } from "@/components/opm/AppShell";
import { connections, defaultSettings, opmOptions } from "@/lib/opm-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & AI Safety — Smart OPM Automation Assistant" },
      {
        name: "description",
        content:
          "Configure helpdesk and OPM connections, sync interval, default mappings, notification preferences and AI safety controls such as the confidence threshold.",
      },
      { property: "og:title", content: "Settings & AI Safety — Smart OPM Automation Assistant" },
      {
        property: "og:description",
        content:
          "Connection credentials, sync cadence, AI confidence threshold and human-in-the-loop guardrails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = defaultSettings;
  const [threshold, setThreshold] = useState(s.confidenceThreshold);
  const [notify, setNotify] = useState(s.notify);
  const [autoSubmit] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Connections, defaults and AI safety guardrails for the automation pipeline.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <SectionTitle
              icon={Plug}
              right={
                <>
                  <ConnectionChip label={connections.helpdesk.label} status={connections.helpdesk.status} />
                  <ConnectionChip label={connections.opm.label} status={connections.opm.status} />
                </>
              }
            >
              Connections
            </SectionTitle>
            <div className="mt-4 grid gap-3">
              <div>
                <Label>Helpdesk URL</Label>
                <Input defaultValue={s.helpdeskUrl} />
              </div>
              <div>
                <Label>Helpdesk API key</Label>
                <Input defaultValue={s.helpdeskKey} type="password" />
              </div>
              <div>
                <Label>OPM URL</Label>
                <Input defaultValue={s.opmUrl} />
              </div>
              <div>
                <Label>OPM API key</Label>
                <Input defaultValue={s.opmKey} type="password" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Keys are stored encrypted and masked in the UI. Last sync {connections.lastSync}.
              </p>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={Bot}>AI & defaults</SectionTitle>
            <div className="mt-4 grid gap-3">
              <div>
                <Label>AI provider</Label>
                <Input defaultValue={s.aiProvider} readOnly />
              </div>
              <div>
                <Label>Model</Label>
                <Input defaultValue={s.aiModel} readOnly />
              </div>
              <div>
                <Label>Default project</Label>
                <Select value={s.defaultProject} onChange={() => {}} options={opmOptions.project} />
              </div>
              <div>
                <Label>Default OPM category</Label>
                <Select value={s.defaultCategory} onChange={() => {}} options={opmOptions.category} />
              </div>
              <div>
                <Label>Sync interval</Label>
                <Select
                  value={s.syncInterval}
                  onChange={() => {}}
                  options={["Every hour", "Every 3 hours", "Every 6 hours", "Manual only"]}
                />
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle icon={ShieldCheck}>AI safety controls</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <Label hint={<span className="text-[11px] font-mono text-cyan">{threshold}%</span>}>
                  Confidence threshold
                </Label>
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-[var(--cyan)]"
                  aria-label="Confidence threshold"
                />
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Mappings below {threshold}% confidence are flagged “Needs Review” and highlighted
                  field by field in the mapping editor.
                </p>
              </div>

              <label className="flex items-start gap-2 text-[11px] leading-snug">
                <input
                  type="checkbox"
                  checked={autoSubmit}
                  disabled
                  className="mt-0.5 size-3.5 accent-[var(--cyan)]"
                />
                <span>
                  Auto-submit approved entries —{" "}
                  <span className="font-semibold text-warning">permanently disabled</span>. Every OPM
                  submission requires an explicit human approval.
                </span>
              </label>

              <label className="flex items-start gap-2 text-[11px] leading-snug">
                <input type="checkbox" defaultChecked className="mt-0.5 size-3.5 accent-[var(--cyan)]" />
                Require a written reason when rejecting an AI mapping
              </label>
              <label className="flex items-start gap-2 text-[11px] leading-snug">
                <input type="checkbox" defaultChecked className="mt-0.5 size-3.5 accent-[var(--cyan)]" />
                Show AI rationale and source signals on every suggestion
              </label>
            </div>
            <AiNotice className="mt-4" />
          </Card>

          <Card>
            <SectionTitle icon={Bell}>Notifications</SectionTitle>
            <ul className="mt-4 space-y-2">
              {(
                [
                  ["newTickets", "New tickets synced"],
                  ["aiComplete", "AI analysis completed"],
                  ["approvalRequired", "Approval required"],
                  ["submissionSuccess", "Submission succeeded"],
                  ["submissionFailed", "Submission failed"],
                  ["connectionIssues", "Connection issues"],
                ] as const
              ).map(([key, label]) => (
                <li
                  key={key}
                  className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-2/30 px-3 py-2"
                >
                  <span className="text-[12px]">{label}</span>
                  <input
                    type="checkbox"
                    checked={notify[key]}
                    onChange={(e) => setNotify({ ...notify, [key]: e.target.checked })}
                    className="ml-auto size-3.5 accent-[var(--cyan)]"
                    aria-label={label}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Btn
            variant="primary"
            size="sm"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            <Save className="size-3.5" /> Save settings
          </Btn>
          <Btn size="sm">
            <Sliders className="size-3.5" /> Reset to defaults
          </Btn>
          {saved && (
            <span className="text-[11px] font-semibold text-success">Settings saved.</span>
          )}
        </div>
      </main>
    </AppShell>
  );
}
