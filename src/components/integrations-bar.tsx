"use client";

import { Cpu, Server, ShieldCheck, Sparkles, Table } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { IntegrationDTO } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  sheets: Table,
  gemini: Sparkles,
  agent: Cpu,
  proxy: ShieldCheck,
};

const STATUS_STYLES: Record<
  IntegrationDTO["status"],
  { wrap: string; dot: string; label: string }
> = {
  connected: {
    wrap: "border-emerald-500/30 bg-emerald-500/[0.07] hover:border-emerald-400/60",
    dot: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(16,185,129,0.7)]",
    label: "text-emerald-300",
  },
  degraded: {
    wrap: "border-amber-500/30 bg-amber-500/[0.07] hover:border-amber-400/60",
    dot: "bg-amber-400 shadow-[0_0_10px_2px_rgba(245,158,11,0.6)]",
    label: "text-amber-300",
  },
  offline: {
    wrap: "border-rose-500/30 bg-rose-500/[0.07] hover:border-rose-400/60",
    dot: "bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.6)]",
    label: "text-rose-300",
  },
};

export default function IntegrationsBar({
  integrations,
}: {
  integrations: IntegrationDTO[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {integrations.map((item) => {
        const Icon = ICONS[item.key] ?? Server;
        const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.connected;
        return (
          <div
            key={item.key}
            className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition ${style.wrap}`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-700/60 bg-slate-950/60">
              <Icon className={`size-4 ${style.label}`} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${style.dot}`} />
                <p className="truncate text-[13px] font-medium text-slate-100">{item.label}</p>
              </div>
              <p className="truncate font-mono text-[10px] tracking-wide text-slate-500">
                {item.detail ?? "—"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-mono text-[10px] font-semibold uppercase ${style.label}`}>
                {item.status}
              </p>
              <p className="font-mono text-[10px] text-slate-600">{item.latencyMs}ms</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
