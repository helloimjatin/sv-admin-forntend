"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "brand",
  loading,
  valueClassName,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "brand" | "green" | "violet" | "sky" | "amber" | "red" | "teal" | "indigo";
  loading?: boolean;
  valueClassName?: string;
  trend?: string;
}) {
  const iconColors: Record<string, string> = {
    brand: "bg-primary-fixed text-on-primary-fixed",
    green: "bg-green-100 text-green-700",
    violet: "bg-violet-100 text-violet-700",
    sky: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    teal: "bg-teal-100 text-teal-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };

  return (
    <div className="stat-card bg-surface-card border border-outline-variant/50 rounded-lg px-5 py-5 flex items-center gap-3">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-[10px] shrink-0", iconColors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted leading-none">{label}</p>
        {loading ? (
          <div className="mt-3 h-9 w-14 rounded shimmer" />
        ) : (
          <p className={cn("mt-2.5 text-[32px] font-bold leading-none tracking-tight", valueClassName)}>{value}</p>
        )}
        {trend && !loading && <p className="mt-1.5 text-xs text-primary font-medium">{trend}</p>}
      </div>
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" }) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    purple: "bg-violet-100 text-violet-800",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold", variants[variant])}>
      <span className="w-1.5 h-1.5 mr-1 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, size = "md" }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn("w-full rounded-xl border border-outline-variant bg-surface-card shadow-2xl animate-fade-in max-h-[90vh] flex flex-col", sizes[size])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/50 px-6 py-4 bg-surface-low">
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-1 rounded-lg"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function FilterPills({ options, active, onChange }: { options: { label: string; value: string }[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors",
            active === o.value
              ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
              : "bg-surface-card text-text-muted border-outline-variant hover:bg-surface-elevated"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBar({ value, onChange, onSearch, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; onSearch: () => void; placeholder?: string }) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
      />
      <button onClick={onSearch} className="rounded-lg bg-primary text-white px-6 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container transition-colors shrink-0">
        Search
      </button>
    </div>
  );
}

export function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-surface-low border-y border-outline-variant/50">
            {headers.map((h) => (
              <th key={h} className="p-4 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-text">{children}</tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title }: { title: string }) {
  return <h1 className="text-[32px] font-bold leading-tight tracking-tight text-text">{title}</h1>;
}

export function TableCard({ title, toolbar, filters, children }: { title: string; toolbar?: React.ReactNode; filters?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-outline-variant/50 bg-surface-card flex flex-col">
      <div className="p-6 border-b border-outline-variant/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {toolbar}
      </div>
      {filters && <div className="px-6 py-3 border-b border-outline-variant/50">{filters}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ProgressBar({ label, used, limit, colorClass }: { label: string; used: number; limit: number; colorClass?: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = colorClass || (pct > 80 ? "bg-amber-500" : pct > 50 ? "bg-primary" : "bg-green-500");
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="font-mono text-xs">{used} / {limit}</span>
      </div>
      <div className="h-2.5 rounded-full bg-surface-elevated overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MethodBadge({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded border border-outline-variant/50 text-[11px] font-bold uppercase text-text-muted">
      {method}
    </span>
  );
}
