"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function AccordionSection({
  title,
  icon,
  badge,
  action,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  badge?: string | number;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-outline-variant/50 bg-surface-card overflow-hidden">
      <div className="flex items-center justify-between p-4 hover:bg-surface-low/50 transition-colors">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-3 text-left min-w-0"
        >
          <MaterialIcon name={icon} size={20} className="text-primary shrink-0" />
          <span className="font-semibold text-sm">{title}</span>
          {badge !== undefined && (
            <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            className="text-text-muted p-1 rounded-lg hover:bg-surface-low/80 transition-colors"
          >
            <MaterialIcon name="expand_more" size={20} className={cn("transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>
      {open && <div className="px-4 pb-4 border-t border-outline-variant/30">{children}</div>}
    </div>
  );
}
