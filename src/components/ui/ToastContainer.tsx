"use client";

import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "border-brand-200 bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200 dark:border-brand-800",
  error: "border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
};

export function ToastContainer() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg animate-fade-in min-w-[280px]", colors[t.type])}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <X className="h-4 w-4 opacity-50" />
          </div>
        );
      })}
    </div>
  );
}
