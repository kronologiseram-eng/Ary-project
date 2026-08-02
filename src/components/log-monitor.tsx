"use client";

import { ArrowDownToLine, Download, Terminal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LogDTO, LogLevel } from "@/lib/types";

const LEVEL_STYLES: Record<LogLevel, { tag: string; text: string }> = {
  SYS: { tag: "text-violet-300 bg-violet-500/10 border-violet-500/30", text: "text-violet-200/90" },
  INFO: { tag: "text-sky-300 bg-sky-500/10 border-sky-500/30", text: "text-slate-300" },
  SUCCESS: {
    tag: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-200/90",
  },
  AI: {
    tag: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30",
    text: "text-fuchsia-200/90",
  },
  SHEETS: { tag: "text-teal-300 bg-teal-500/10 border-teal-500/30", text: "text-teal-200/90" },
  WARN: { tag: "text-amber-300 bg-amber-500/10 border-amber-500/30", text: "text-amber-200/90" },
  ERROR: { tag: "text-rose-300 bg-rose-500/10 border-rose-500/30", text: "text-rose-200" },
};

const FILTERS: ("ALL" | LogLevel)[] = [
  "ALL",
  "INFO",
  "SUCCESS",
  "AI",
  "SHEETS",
  "WARN",
  "ERROR",
];

function stamp(iso: string) {
  // UTC-stable so server and client markup always match
  return iso.slice(11, 23);
}

export default function LogMonitor({
  logs,
  running,
  connected,
  onClear,
}: {
  logs: LogDTO[];
  running: boolean;
  connected: boolean;
  onClear: () => void;
}) {
  const [filter, setFilter] = useState<"ALL" | LogLevel>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const boxRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => (filter === "ALL" ? logs : logs.filter((l) => l.level === filter)),
    [logs, filter],
  );

  useEffect(() => {
    if (!autoScroll) return;
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length, autoScroll]);

  const handleScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    setAutoScroll(atBottom);
  };

  const download = () => {
    const text = logs
      .map((l) => `${stamp(l.createdAt)} [${l.level}] ${l.message}`)
      .join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `hybrid-extractor-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => {
    const map: Partial<Record<LogLevel, number>> = {};
    for (const l of logs) map[l.level] = (map[l.level] ?? 0) + 1;
    return map;
  }, [logs]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#05060a] shadow-[0_18px_50px_-28px_rgba(0,0,0,1)]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-800/80 bg-slate-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <Terminal className="ml-1 size-4 text-emerald-400" />
          <h2 className="font-mono text-[12px] font-semibold tracking-wide text-slate-200">
            live_log_monitor
          </h2>
          <span
            className={`font-mono text-[10px] tracking-wider ${
              running ? "text-emerald-400" : connected ? "text-slate-500" : "text-rose-400"
            }`}
          >
            {running ? "● streaming" : connected ? "○ idle" : "○ offline"}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md border px-2 py-1 font-mono text-[10px] tracking-wider transition ${
                filter === f
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300"
              }`}
            >
              {f}
              {f !== "ALL" && counts[f as LogLevel] ? (
                <span className="ml-1 text-slate-600">{counts[f as LogLevel]}</span>
              ) : null}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-slate-800" />
          <button
            type="button"
            onClick={() => {
              setAutoScroll(true);
              const el = boxRef.current;
              if (el) el.scrollTop = el.scrollHeight;
            }}
            title="Jump to latest"
            className={`grid size-7 place-items-center rounded-md border transition ${
              autoScroll
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300"
            }`}
          >
            <ArrowDownToLine className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={download}
            title="Download log"
            className="grid size-7 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-500 transition hover:text-slate-300"
          >
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onClear}
            title="Clear console"
            className="grid size-7 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-500 transition hover:border-rose-500/40 hover:text-rose-300"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={boxRef}
        onScroll={handleScroll}
        className="thin-scroll h-[380px] overflow-y-auto bg-[#05060a] px-3 py-3 font-mono text-[12px] leading-[1.65] xl:h-[420px]"
      >
        {visible.length === 0 ? (
          <p className="px-1 text-slate-600">
            {connected
              ? "// no log output yet — power the bot and start an automation job"
              : "// agent bridge unreachable — retrying…"}
          </p>
        ) : (
          visible.map((log) => {
            const style = LEVEL_STYLES[log.level] ?? LEVEL_STYLES.INFO;
            return (
              <div
                key={log.id}
                className="animate-log-in group flex items-start gap-2 rounded px-1 py-[1px] hover:bg-slate-800/30"
              >
                <span className="shrink-0 text-slate-600 tabular-nums">{stamp(log.createdAt)}</span>
                <span
                  className={`w-[74px] shrink-0 rounded border text-center text-[10px] font-bold tracking-wider ${style.tag}`}
                >
                  {log.level}
                </span>
                <span className={`min-w-0 break-words ${style.text}`}>{log.message}</span>
              </div>
            );
          })
        )}
        {running ? (
          <div className="flex items-center gap-2 px-1 pt-1 text-emerald-400">
            <span>agent@hybrid:~$</span>
            <span className="inline-block h-3.5 w-2 animate-caret bg-emerald-400" />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/80 px-4 py-2 font-mono text-[10px] tracking-wide text-slate-600">
        <span>
          {visible.length} / {logs.length} lines · filter {filter.toLowerCase()}
        </span>
        <span>{autoScroll ? "autoscroll on" : "autoscroll paused"}</span>
      </div>
    </section>
  );
}
