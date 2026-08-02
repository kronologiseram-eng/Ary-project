"use client";

import { Bot, Radio, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Pill } from "./ui";

export default function HeaderBar({
  connected,
  latency,
  running,
  power,
  onPing,
  pinging,
}: {
  connected: boolean;
  latency: number | null;
  running: boolean;
  power: boolean;
  onPing: () => void;
  pinging: boolean;
}) {
  const [clock, setClock] = useState<string>("--:--:--");

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-[#08090c]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-500/0">
            <Bot className="size-6 text-emerald-400" />
            {running ? (
              <span className="absolute -right-1 -top-1 size-3 animate-pulse-ring rounded-full bg-emerald-400" />
            ) : null}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              Hybrid AI Data Extractor
            </h1>
            <p className="truncate font-mono text-[11px] text-slate-500">
              python-agent v2.4.1 · playwright + gemini · console {clock}
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Pill tone={power ? "emerald" : "slate"}>
            <Radio className={`size-3 ${power ? "text-emerald-400" : "text-slate-500"}`} />
            {power ? "Armed" : "Standby"}
          </Pill>

          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] font-medium tracking-wide transition ${
              connected
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}
          >
            <span className="relative flex size-2">
              {connected ? (
                <span className="absolute inline-flex size-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
              ) : null}
              <span
                className={`relative inline-flex size-2 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-rose-500"
                }`}
              />
            </span>
            {connected ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            <span>{connected ? "CONNECTED" : "DISCONNECTED"}</span>
            {connected && latency !== null ? (
              <span className="text-emerald-500/70">{latency}ms</span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onPing}
            className="grid size-9 place-items-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300 active:scale-95"
            title="Re-check integrations"
          >
            <RefreshCw className={`size-4 ${pinging ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
