"use client";

import { Layers, MousePointerClick, Sparkles, Table, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BotConfigDTO, BotMode } from "@/lib/types";
import { Card, CardHeader } from "./ui";

const MODES: {
  id: BotMode;
  label: string;
  icon: LucideIcon;
  blurb: string;
  meta: string;
}[] = [
  {
    id: "bulk",
    label: "Bulk Mode",
    icon: Layers,
    blurb: "Harvest every list item found in the feed while scrolling.",
    meta: "selector: [data-list-item] · auto-paginate",
  },
  {
    id: "choose",
    label: "Choose Mode",
    icon: MousePointerClick,
    blurb: "Only extract the specific nodes the operator clicks in the browser.",
    meta: "click-listener · targeted DOM capture",
  },
];

function OptionToggle({
  icon: Icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3.5 py-3 text-left transition hover:border-slate-700 disabled:opacity-60"
    >
      <Icon className={`size-4 shrink-0 ${checked ? "text-emerald-400" : "text-slate-500"}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-slate-200">{label}</span>
        <span className="block truncate font-mono text-[10px] text-slate-500">{description}</span>
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-500/80" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function ModeSelector({
  config,
  disabled,
  onMode,
  onOption,
}: {
  config: BotConfigDTO;
  disabled: boolean;
  onMode: (mode: BotMode) => void;
  onOption: (key: "headless" | "aiCleaning" | "sheetsSync", next: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader
        icon={Layers}
        title="Extraction Mode"
        subtitle="how the robot decides what to grab"
        accent="violet"
      />
      <div className="space-y-4 p-4 sm:p-5">
        <div
          role="tablist"
          aria-label="Extraction mode"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {MODES.map((mode) => {
            const active = config.mode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => onMode(mode.id)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                  active
                    ? "border-emerald-400/50 bg-emerald-500/10 glow-emerald"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid size-9 place-items-center rounded-lg ${
                      active
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-slate-800/80 text-slate-400"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold tracking-[0.16em] uppercase ${
                      active ? "text-emerald-300" : "text-slate-600"
                    }`}
                  >
                    {active ? "● active" : "select"}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-100">{mode.label}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{mode.blurb}</p>
                <p className="mt-2 font-mono text-[10px] tracking-wide text-slate-600">
                  {mode.meta}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <OptionToggle
            icon={Terminal}
            label="Headless Browser"
            description="chromium --headless=new"
            checked={config.headless}
            disabled={disabled}
            onChange={(v) => onOption("headless", v)}
          />
          <OptionToggle
            icon={Sparkles}
            label="Gemini Cleaning"
            description="normalize → schema v3"
            checked={config.aiCleaning}
            disabled={disabled}
            onChange={(v) => onOption("aiCleaning", v)}
          />
          <OptionToggle
            icon={Table}
            label="Sheets Sync"
            description="append HybridExtract!A:F"
            checked={config.sheetsSync}
            disabled={disabled}
            onChange={(v) => onOption("sheetsSync", v)}
          />
        </div>
      </div>
    </Card>
  );
}
