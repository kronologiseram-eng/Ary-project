import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  icon: Icon,
  title,
  subtitle,
  accent = "emerald",
  right,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: "emerald" | "sky" | "rose" | "amber" | "violet";
  right?: ReactNode;
}) {
  const accents: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30",
    sky: "text-sky-400 bg-sky-500/10 ring-sky-500/30",
    rose: "text-rose-400 bg-rose-500/10 ring-rose-500/30",
    amber: "text-amber-400 bg-amber-500/10 ring-amber-500/30",
    violet: "text-violet-400 bg-violet-500/10 ring-violet-500/30",
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-800/70 px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg ring-1 ${accents[accent]}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-wide text-slate-100">
            {title}
          </h2>
          {subtitle ? (
            <p className="truncate font-mono text-[11px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "slate",
  className = "",
}: {
  children: ReactNode;
  tone?: "slate" | "emerald" | "rose" | "amber" | "sky" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: "border-slate-700/70 bg-slate-800/50 text-slate-300",
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    sky: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    violet: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
        {Icon ? <Icon className="size-3.5 text-slate-500" /> : null}
        {label}
        {hint ? <span className="text-slate-600 normal-case">· {hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block font-mono text-[11px] text-rose-400">{error}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2.5 font-mono text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-emerald-500/60 focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20";
