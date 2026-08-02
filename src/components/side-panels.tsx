"use client";

import {
  Activity,
  Database,
  Download,
  Gauge,
  History,
  Sparkles,
  Table as TableIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ItemDTO, RunDTO, StatsDTO } from "@/lib/types";
import { Card, CardHeader, Pill } from "./ui";

const STATUS_TONE: Record<RunDTO["status"], "emerald" | "rose" | "amber" | "slate"> = {
  running: "emerald",
  completed: "emerald",
  halted: "rose",
  failed: "rose",
};

function elapsedLabel(startIso: string, endIso: string | null, now: number) {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : now;
  const secs = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function TelemetryPanel({
  run,
  running,
}: {
  run: RunDTO | null;
  running: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const rows: { label: string; value: string }[] = run
    ? [
        { label: "run id", value: `#${run.id}` },
        { label: "mode", value: run.mode.toUpperCase() },
        { label: "elapsed", value: now ? elapsedLabel(run.startedAt, run.finishedAt, now) : "--:--" },
        { label: "scrolls", value: `${run.scrollsDone}/${run.scrollCount}` },
        { label: "items", value: String(run.itemsExtracted) },
        { label: "sheet rows", value: String(run.rowsSynced) },
        { label: "ai tokens", value: run.aiTokens.toLocaleString("en-US") },
        { label: "status", value: run.status.toUpperCase() },
      ]
    : [];

  return (
    <Card>
      <CardHeader
        icon={Activity}
        title={running ? "Live Job Telemetry" : "Last Job Telemetry"}
        subtitle={run ? run.targetUrl : "no job recorded yet"}
        accent={running ? "emerald" : "sky"}
        right={
          run ? (
            <Pill tone={STATUS_TONE[run.status]}>
              {running ? (
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              ) : null}
              {run.status}
            </Pill>
          ) : null
        }
      />
      <div className="p-4 sm:p-5">
        {run ? (
          <dl className="grid grid-cols-2 gap-2.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2"
              >
                <dt className="font-mono text-[10px] tracking-[0.14em] text-slate-500 uppercase">
                  {row.label}
                </dt>
                <dd className="truncate font-mono text-[13px] font-semibold text-slate-100">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="font-mono text-[12px] text-slate-600">
            // waiting for the first automation run
          </p>
        )}
      </div>
    </Card>
  );
}

export function StatsPanel({ stats }: { stats: StatsDTO }) {
  const cells = [
    { label: "Runs", value: stats.totalRuns.toLocaleString("en-US"), icon: History },
    { label: "Items", value: stats.totalItems.toLocaleString("en-US"), icon: Database },
    { label: "Sheet rows", value: stats.rowsSynced.toLocaleString("en-US"), icon: TableIcon },
    { label: "AI tokens", value: stats.aiTokens.toLocaleString("en-US"), icon: Sparkles },
  ];

  return (
    <Card>
      <CardHeader
        icon={Gauge}
        title="Pipeline Totals"
        subtitle={`success rate ${stats.successRate}%`}
        accent="amber"
      />
      <div className="grid grid-cols-2 gap-2.5 p-4 sm:p-5">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-800/70 bg-gradient-to-b from-slate-900/70 to-slate-950/40 px-3 py-3"
          >
            <c.icon className="size-4 text-emerald-400/80" />
            <p className="mt-2 font-mono text-xl font-bold text-slate-50">{c.value}</p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-slate-500 uppercase">
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ExtractedPanel({ items, runId }: { items: ItemDTO[]; runId: number | null }) {
  return (
    <Card>
      <CardHeader
        icon={Database}
        title="Extracted Records"
        subtitle={runId ? `run #${runId} · newest first` : "no data yet"}
        accent="violet"
        right={
          <a
            href={`/api/export${runId ? `?runId=${runId}` : ""}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1.5 font-mono text-[10px] tracking-wider text-slate-400 uppercase transition hover:border-emerald-500/40 hover:text-emerald-300"
          >
            <Download className="size-3.5" />
            CSV
          </a>
        }
      />
      <div className="thin-scroll max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="p-5 font-mono text-[12px] text-slate-600">// dataset empty</p>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-950/95 backdrop-blur">
              <tr className="font-mono text-[10px] tracking-[0.14em] text-slate-500 uppercase">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-2 py-2 font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-800/60 transition hover:bg-slate-900/50"
                >
                  <td className="max-w-[190px] truncate px-4 py-2 text-[12px] text-slate-200">
                    {item.title}
                  </td>
                  <td className="px-2 py-2 font-mono text-[12px] text-emerald-300">
                    {item.price ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[12px] text-amber-300">
                    {item.rating?.toFixed(1) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export function RunHistoryPanel({ runs }: { runs: RunDTO[] }) {
  return (
    <Card>
      <CardHeader
        icon={History}
        title="Run History"
        subtitle="last 8 automation jobs"
        accent="sky"
      />
      <div className="thin-scroll max-h-[260px] divide-y divide-slate-800/60 overflow-y-auto">
        {runs.length === 0 ? (
          <p className="p-5 font-mono text-[12px] text-slate-600">// no runs recorded</p>
        ) : (
          runs.map((run) => (
            <div key={run.id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={`size-2 shrink-0 rounded-full ${
                  run.status === "running"
                    ? "animate-pulse bg-emerald-400"
                    : run.status === "completed"
                      ? "bg-emerald-500/70"
                      : "bg-rose-500/80"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[12px] text-slate-200">
                  #{run.id} · {run.mode.toUpperCase()} · {run.itemsExtracted} items
                </p>
                <p className="truncate font-mono text-[10px] text-slate-600">{run.targetUrl}</p>
              </div>
              <span
                className={`shrink-0 font-mono text-[10px] tracking-wider uppercase ${
                  run.status === "halted" || run.status === "failed"
                    ? "text-rose-400"
                    : run.status === "running"
                      ? "text-emerald-400"
                      : "text-slate-500"
                }`}
              >
                {run.status}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
