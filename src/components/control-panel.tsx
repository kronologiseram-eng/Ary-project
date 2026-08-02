"use client";

import {
  ArrowDownWideNarrow,
  Globe,
  Loader2,
  OctagonX,
  Play,
  Power,
  SlidersHorizontal,
  Timer,
} from "lucide-react";
import type { BotConfigDTO } from "@/lib/types";
import { Card, CardHeader, Field, inputClass, Pill } from "./ui";

export type FormState = {
  targetUrl: string;
  scrollCount: string;
  delayRange: string;
};

export type FormErrors = {
  targetUrl?: string | null;
  scrollCount?: string | null;
  delayRange?: string | null;
};

function PowerSwitch({
  on,
  busy,
  onToggle,
}: {
  on: boolean;
  busy: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Bot power"
      disabled={busy}
      onClick={() => onToggle(!on)}
      className={`group relative flex h-[64px] w-[168px] shrink-0 items-center rounded-2xl border p-1.5 transition-all duration-300 disabled:opacity-70 ${
        on
          ? "border-emerald-400/50 bg-emerald-500/15 glow-emerald"
          : "border-slate-700 bg-slate-900/80 hover:border-slate-600"
      }`}
    >
      <span
        className={`absolute inset-y-0 flex items-center font-mono text-[11px] font-bold tracking-[0.2em] transition-all duration-300 ${
          on ? "left-5 text-emerald-300" : "right-5 text-slate-500"
        }`}
      >
        {on ? "ON" : "OFF"}
      </span>
      <span
        className={`grid size-[52px] place-items-center rounded-xl transition-all duration-300 ease-out ${
          on
            ? "translate-x-[100px] bg-emerald-400 text-emerald-950 shadow-[0_0_24px_2px_rgba(16,185,129,0.65)]"
            : "translate-x-0 bg-slate-700 text-slate-300"
        }`}
      >
        {busy ? <Loader2 className="size-6 animate-spin" /> : <Power className="size-6" />}
      </span>
    </button>
  );
}

export default function ControlPanel({
  config,
  form,
  errors,
  running,
  busy,
  connected,
  progress,
  onForm,
  onPower,
  onStart,
  onStop,
}: {
  config: BotConfigDTO;
  form: FormState;
  errors: FormErrors;
  running: boolean;
  busy: "power" | "start" | "stop" | null;
  connected: boolean;
  progress: { done: number; total: number; items: number } | null;
  onForm: (patch: Partial<FormState>) => void;
  onPower: (next: boolean) => void;
  onStart: () => void;
  onStop: () => void;
}) {
  const canStart = connected && config.power && !running;
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.done / progress.total) * 100))
    : 0;

  return (
    <Card>
      <CardHeader
        icon={SlidersHorizontal}
        title="Control Panel"
        subtitle="agent://localhost:8765 · runtime control"
        right={
          <Pill tone={running ? "emerald" : config.power ? "amber" : "slate"}>
            {running ? "RUNNING" : config.power ? "IDLE · ARMED" : "POWERED DOWN"}
          </Pill>
        }
      />

      <div className="space-y-5 p-4 sm:p-5">
        {/* power + actions */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <PowerSwitch on={config.power} busy={busy === "power"} onToggle={onPower} />
            <div>
              <p className="text-sm font-semibold text-slate-100">Bot Power</p>
              <p className="max-w-[220px] font-mono text-[11px] leading-relaxed text-slate-500">
                {config.power
                  ? "Agent armed. Browser driver ready to accept jobs."
                  : "Agent disarmed. Automation cannot be started."}
              </p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:justify-end">
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart || busy !== null}
              className={`group relative flex h-[58px] items-center justify-center gap-2.5 overflow-hidden rounded-xl border px-5 text-sm font-bold tracking-wide uppercase transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                running
                  ? "border-emerald-400/60 bg-emerald-500 text-emerald-950 glow-emerald"
                  : canStart
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500 hover:text-emerald-950 hover:glow-emerald"
                    : "border-slate-800 bg-slate-900/70 text-slate-600"
              }`}
            >
              {running ? (
                <>
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-scan" />
                  <Loader2 className="size-5 animate-spin" />
                  Automation Live
                </>
              ) : (
                <>
                  {busy === "start" ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Play className="size-5 fill-current" />
                  )}
                  Start Automation
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onStop}
              disabled={!running || busy !== null}
              className={`flex h-[58px] items-center justify-center gap-2.5 rounded-xl border px-5 text-sm font-bold tracking-wide uppercase transition-all active:scale-[0.98] disabled:cursor-not-allowed ${
                running
                  ? "border-rose-400/60 bg-rose-600 text-white glow-red hover:bg-rose-500"
                  : "border-slate-800 bg-slate-900/70 text-slate-600"
              }`}
            >
              {busy === "stop" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <OctagonX className="size-5" />
              )}
              Emergency Halt
            </button>
          </div>
        </div>

        {/* progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-slate-500">
            <span>
              SCROLL PROGRESS ·{" "}
              <span className="text-slate-300">
                {progress ? `${progress.done}/${progress.total}` : `0/${config.scrollCount}`}
              </span>
            </span>
            <span>
              {progress ? progress.items : 0} items ·{" "}
              <span className={running ? "text-emerald-400" : "text-slate-400"}>{pct}%</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-900">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                running
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_14px_1px_rgba(16,185,129,0.7)]"
                  : "bg-slate-700"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* parameters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Field label="Target URL" icon={Globe} error={errors.targetUrl}>
              <input
                className={inputClass}
                value={form.targetUrl}
                spellCheck={false}
                placeholder="https://example.com/listings"
                onChange={(e) => onForm({ targetUrl: e.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Scroll Count"
            hint="e.g. 10"
            icon={ArrowDownWideNarrow}
            error={errors.scrollCount}
          >
            <input
              className={inputClass}
              value={form.scrollCount}
              inputMode="numeric"
              placeholder="10"
              onChange={(e) => onForm({ scrollCount: e.target.value })}
            />
          </Field>

          <Field
            label="Min-Max Random Delay"
            hint="e.g. 3-7 seconds"
            icon={Timer}
            error={errors.delayRange}
          >
            <input
              className={inputClass}
              value={form.delayRange}
              placeholder="3-7"
              onChange={(e) => onForm({ delayRange: e.target.value })}
            />
          </Field>
        </div>

        <p className="font-mono text-[11px] text-slate-600">
          Parameters auto-save to the agent config.{" "}
          <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-slate-400">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-slate-400">
            Enter
          </kbd>{" "}
          starts a job ·{" "}
          <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-slate-400">
            Esc
          </kbd>{" "}
          halts it.
        </p>
      </div>
    </Card>
  );
}
