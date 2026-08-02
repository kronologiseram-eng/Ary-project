"use client";

import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BotConfigDTO,
  BotMode,
  LogDTO,
  StateResponse,
  StatsDTO,
} from "@/lib/types";
import ControlPanel, { type FormErrors, type FormState } from "./control-panel";
import HeaderBar from "./header-bar";
import IntegrationsBar from "./integrations-bar";
import LogMonitor from "./log-monitor";
import ModeSelector from "./mode-selector";
import {
  ExtractedPanel,
  RunHistoryPanel,
  StatsPanel,
  TelemetryPanel,
} from "./side-panels";

const FALLBACK_CONFIG: BotConfigDTO = {
  power: false,
  mode: "bulk",
  targetUrl: "https://books.toscrape.com/catalogue/category/books/fiction_10/index.html",
  scrollCount: 10,
  delayMin: 3,
  delayMax: 7,
  headless: true,
  aiCleaning: true,
  sheetsSync: true,
};

const FALLBACK_STATS: StatsDTO = {
  totalRuns: 0,
  totalItems: 0,
  rowsSynced: 0,
  aiTokens: 0,
  successRate: 100,
};

const POLL_ACTIVE_MS = 550;
const POLL_IDLE_MS = 1600;
const MAX_LOGS = 700;

type Toast = { kind: "error" | "success" | "info"; text: string } | null;

function parseDelayRange(value: string): { min: number; max: number } | null {
  const match = value
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)$/i);
  if (!match) return null;
  const min = Number.parseFloat(match[1]);
  const max = Number.parseFloat(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min <= 0 || max <= 0 || min > max || max > 120) return null;
  return { min, max };
}

function formFromConfig(config: BotConfigDTO): FormState {
  return {
    targetUrl: config.targetUrl,
    scrollCount: String(config.scrollCount),
    delayRange: `${config.delayMin}-${config.delayMax}`,
  };
}

export default function Dashboard({ initialState }: { initialState: StateResponse | null }) {
  const [snapshot, setSnapshot] = useState<StateResponse | null>(initialState);
  const [logs, setLogs] = useState<LogDTO[]>(initialState?.logs ?? []);
  const [connected, setConnected] = useState(Boolean(initialState));
  const [latency, setLatency] = useState<number | null>(null);
  const [busy, setBusy] = useState<"power" | "start" | "stop" | null>(null);
  const [pinging, setPinging] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [form, setForm] = useState<FormState>(
    formFromConfig(initialState?.config ?? FALLBACK_CONFIG),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const cursorRef = useRef<number>(
    initialState?.logs?.length ? initialState.logs[initialState.logs.length - 1].id : 0,
  );
  const runningRef = useRef<boolean>(Boolean(initialState?.activeRun));
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formReadyRef = useRef<boolean>(Boolean(initialState));

  const config = snapshot?.config ?? FALLBACK_CONFIG;
  const activeRun = snapshot?.activeRun ?? null;
  const running = Boolean(activeRun);
  runningRef.current = running;

  const flash = useCallback((kind: NonNullable<Toast>["kind"], text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  /* ----------------------------- live polling ----------------------------- */
  const poll = useCallback(async () => {
    const started = performance.now();
    try {
      const res = await fetch(`/api/bot/state?since=${cursorRef.current}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("agent bridge unreachable");
      const data = (await res.json()) as StateResponse;

      setLatency(Math.round(performance.now() - started));
      setConnected(true);
      setSnapshot(data);

      if (!formReadyRef.current) {
        setForm(formFromConfig(data.config));
        formReadyRef.current = true;
      }

      if (data.logs.length > 0) {
        cursorRef.current = data.logs[data.logs.length - 1].id;
        setLogs((prev) => {
          const merged = cursorRef.current && prev.length ? [...prev, ...data.logs] : data.logs;
          return merged.length > MAX_LOGS ? merged.slice(-MAX_LOGS) : merged;
        });
      }
    } catch {
      setConnected(false);
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const loop = async () => {
      await poll();
      if (cancelled) return;
      timer = setTimeout(loop, runningRef.current ? POLL_ACTIVE_MS : POLL_IDLE_MS);
    };

    void loop();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [poll]);

  /* ------------------------------- actions -------------------------------- */
  const post = useCallback(
    async (url: string, body?: unknown, method: "POST" | "DELETE" = "POST") => {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      return { ok: res.ok && data.ok !== false, error: data.error };
    },
    [],
  );

  const handlePower = useCallback(
    async (next: boolean) => {
      setBusy("power");
      setSnapshot((prev) =>
        prev ? { ...prev, config: { ...prev.config, power: next } } : prev,
      );
      const { ok, error } = await post("/api/bot/power", { power: next });
      if (!ok) flash("error", error ?? "Power toggle failed");
      else flash(next ? "success" : "info", next ? "Bot armed" : "Bot powered down");
      await poll();
      setBusy(null);
    },
    [flash, poll, post],
  );

  const handleStart = useCallback(async () => {
    setBusy("start");
    const { ok, error } = await post("/api/bot/start");
    if (!ok) flash("error", error ?? "Could not start automation");
    else flash("success", "Automation started");
    await poll();
    setBusy(null);
  }, [flash, poll, post]);

  const handleStop = useCallback(async () => {
    setBusy("stop");
    const { ok, error } = await post("/api/bot/stop", { emergency: true });
    if (!ok) flash("error", error ?? "No active job");
    else flash("info", "Emergency halt sent to agent");
    await poll();
    setBusy(null);
  }, [flash, poll, post]);

  const handleMode = useCallback(
    async (mode: BotMode) => {
      setSnapshot((prev) => (prev ? { ...prev, config: { ...prev.config, mode } } : prev));
      const { ok, error } = await post("/api/bot/config", { mode });
      if (!ok) flash("error", error ?? "Mode switch failed");
      await poll();
    },
    [flash, poll, post],
  );

  const handleOption = useCallback(
    async (key: "headless" | "aiCleaning" | "sheetsSync", next: boolean) => {
      setSnapshot((prev) =>
        prev ? { ...prev, config: { ...prev.config, [key]: next } } : prev,
      );
      const { ok, error } = await post("/api/bot/config", { [key]: next });
      if (!ok) flash("error", error ?? "Config update failed");
      await poll();
    },
    [flash, poll, post],
  );

  const handleClearLogs = useCallback(async () => {
    setLogs([]);
    const { ok } = await post("/api/bot/logs", undefined, "DELETE");
    if (!ok) flash("error", "Could not clear console");
    await poll();
  }, [flash, poll, post]);

  const handlePing = useCallback(async () => {
    setPinging(true);
    await post("/api/integrations");
    await poll();
    setPinging(false);
  }, [poll, post]);

  /* --------------------------- parameter editing --------------------------- */
  const handleForm = useCallback(
    (patch: Partial<FormState>) => {
      const next = { ...form, ...patch };
      setForm(next);

      const nextErrors: FormErrors = {};
      const payload: Partial<BotConfigDTO> = {};

      if (!/^https?:\/\/.+/i.test(next.targetUrl.trim())) {
        nextErrors.targetUrl = "Must be a valid http(s) URL";
      } else {
        payload.targetUrl = next.targetUrl.trim();
      }

      const scrolls = Number.parseInt(next.scrollCount, 10);
      if (!Number.isFinite(scrolls) || scrolls < 1 || scrolls > 60) {
        nextErrors.scrollCount = "1 – 60 scrolls";
      } else {
        payload.scrollCount = scrolls;
      }

      const delay = parseDelayRange(next.delayRange);
      if (!delay) {
        nextErrors.delayRange = "Use min-max, e.g. 3-7";
      } else {
        payload.delayMin = delay.min;
        payload.delayMax = delay.max;
      }

      setErrors(nextErrors);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (Object.keys(payload).length === 0) return;

      saveTimerRef.current = setTimeout(() => {
        void post("/api/bot/config", payload);
      }, 550);
    },
    [form, post],
  );

  /* ------------------------------- hotkeys -------------------------------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (!running && config.power && busy === null) void handleStart();
      }
      if (event.key === "Escape" && running && busy === null) {
        event.preventDefault();
        void handleStop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, config.power, handleStart, handleStop, running]);

  /* -------------------------------- render -------------------------------- */
  const telemetryRun = activeRun ?? snapshot?.lastRun ?? null;
  const progress = telemetryRun
    ? {
        done: telemetryRun.scrollsDone,
        total: telemetryRun.scrollCount,
        items: telemetryRun.itemsExtracted,
      }
    : null;

  const ToastIcon =
    toast?.kind === "error" ? CircleAlert : toast?.kind === "success" ? CircleCheck : Info;

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="grid-backdrop pointer-events-none fixed inset-0 -z-10" />

      <HeaderBar
        connected={connected}
        latency={latency}
        running={running}
        power={config.power}
        onPing={handlePing}
        pinging={pinging}
      />

      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 lg:px-8">
        <IntegrationsBar integrations={snapshot?.integrations ?? []} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            <ControlPanel
              config={config}
              form={form}
              errors={errors}
              running={running}
              busy={busy}
              connected={connected}
              progress={progress}
              onForm={handleForm}
              onPower={handlePower}
              onStart={handleStart}
              onStop={handleStop}
            />
            <ModeSelector
              config={config}
              disabled={running || !connected}
              onMode={handleMode}
              onOption={handleOption}
            />
          </div>

          <aside className="space-y-5 xl:col-span-4">
            <TelemetryPanel run={telemetryRun} running={running} />
            <StatsPanel stats={snapshot?.stats ?? FALLBACK_STATS} />
          </aside>
        </div>

        <LogMonitor
          logs={logs}
          running={running}
          connected={connected}
          onClear={handleClearLogs}
        />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ExtractedPanel items={snapshot?.items ?? []} runId={telemetryRun?.id ?? null} />
          </div>
          <div className="xl:col-span-5">
            <RunHistoryPanel runs={snapshot?.recentRuns ?? []} />
          </div>
        </div>

        <footer className="pb-4 text-center font-mono text-[10px] tracking-[0.18em] text-slate-700 uppercase">
          hybrid ai data extractor · postgres-backed control plane · polling{" "}
          {running ? `${POLL_ACTIVE_MS}ms` : `${POLL_IDLE_MS}ms`}
        </footer>
      </main>

      {toast ? (
        <div
          className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-xl border px-4 py-2.5 font-mono text-[12px] shadow-2xl backdrop-blur ${
            toast.kind === "error"
              ? "border-rose-500/50 bg-rose-950/80 text-rose-200"
              : toast.kind === "success"
                ? "border-emerald-500/50 bg-emerald-950/80 text-emerald-200"
                : "border-slate-700 bg-slate-900/90 text-slate-200"
          }`}
        >
          <ToastIcon className="size-4" />
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}
