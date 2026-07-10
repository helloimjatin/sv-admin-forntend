"use client";

import { Badge } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  SubscriptionPlan,
  billingCycleLabel,
  effectivePrice,
  getFeatureLabel,
} from "@/data/subscriptionPlansData";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const colorMap: Record<string, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  teal: "bg-teal-100 text-teal-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  violet: "bg-violet-100 text-violet-700",
  green: "bg-green-100 text-green-700",
};

function statusVariant(status: SubscriptionPlan["status"]): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const map = {
    active: "success" as const,
    draft: "default" as const,
    hidden: "info" as const,
    archived: "warning" as const,
    disabled: "danger" as const,
  };
  return map[status];
}

function badgeVariant(badge: SubscriptionPlan["recommendation"]["badge"]): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  if (badge === "recommended") return "success";
  if (badge === "popular") return "purple";
  if (badge === "best_value") return "warning";
  if (badge === "new") return "info";
  return "default";
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-inherit rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

type Props = {
  plan: SubscriptionPlan;
  searchQuery?: string;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onToggleActive: () => void;
  onSetRecommended: () => void;
  onRankUp: () => void;
  onRankDown: () => void;
  onViewSubscribers: () => void;
  onAnalytics: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
};

export function PlanCard({
  plan,
  searchQuery = "",
  dragHandleProps,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onArchive,
  onToggleActive,
  onSetRecommended,
  onRankUp,
  onRankDown,
  onViewSubscribers,
  onAnalytics,
  menuOpen,
  onMenuToggle,
}: Props) {
  const price = effectivePrice(plan);
  const enabledFeatures = plan.features.filter((f) => f.enabled);
  const shown = enabledFeatures.slice(0, 5);
  const more = enabledFeatures.length - shown.length;
  const badge = plan.recommendation.badge;

  return (
    <article
      className={cn(
        "relative rounded-lg border border-outline-variant/50 bg-surface-card p-5 flex flex-col gap-4 transition-shadow hover:shadow-md",
        plan.recommendation.is_recommended && "ring-1 ring-primary/30"
      )}
      aria-label={`${plan.name} plan`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            className="mt-1 text-text-muted hover:text-text cursor-grab active:cursor-grabbing p-0.5"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            {...dragHandleProps}
          >
            <MaterialIcon name="drag_indicator" size={20} />
          </button>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", colorMap[plan.display_color] || colorMap.primary)}>
            <MaterialIcon name={plan.icon} size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-text-muted">#{plan.rank}</span>
              <Badge variant={statusVariant(plan.status)}>{plan.status}</Badge>
              {badge !== "none" && <Badge variant={badgeVariant(badge)}>{badge.replace("_", " ")}</Badge>}
            </div>
            <h3 className="text-base font-semibold truncate">{highlight(plan.name, searchQuery)}</h3>
            <p className="text-[11px] font-mono text-text-muted mt-0.5">
              {highlight(plan.plan_id, searchQuery)} · {plan.slug}
            </p>
          </div>
        </div>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            className="p-1.5 rounded-lg border border-outline-variant text-text-muted hover:bg-surface-elevated"
            aria-label="Plan actions"
            aria-expanded={menuOpen}
          >
            <MaterialIcon name="more_vert" size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 w-48 rounded-lg border border-outline-variant bg-surface-card shadow-lg py-1 text-sm animate-fade-in max-h-72 overflow-y-auto">
              {[
                { label: "View", action: onView },
                { label: "Edit", action: onEdit },
                { label: "Duplicate", action: onDuplicate },
                { label: plan.status === "active" ? "Deactivate" : "Activate", action: onToggleActive },
                { label: "Archive", action: onArchive },
                { label: "Set Recommended", action: onSetRecommended },
                { label: "Move Rank Up", action: onRankUp },
                { label: "Move Rank Down", action: onRankDown },
                { label: "View Subscribers", action: onViewSubscribers },
                { label: "Analytics", action: onAnalytics },
                { label: "Delete", action: onDelete, danger: true },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 hover:bg-surface-elevated",
                    "danger" in item && item.danger ? "text-red-600" : "text-text"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-text-muted line-clamp-2">{plan.description}</p>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{formatCurrency(price)}</span>
            {plan.pricing.discounted_price != null && plan.pricing.discounted_price < plan.pricing.price && (
              <span className="text-sm text-text-muted line-through">{formatCurrency(plan.pricing.price)}</span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {billingCycleLabel(plan.pricing.billing_cycle)}
            {plan.pricing.trial_days > 0 ? ` · ${plan.pricing.trial_days}-day trial` : ""}
          </p>
        </div>
        <p className="text-xs text-text-muted text-right">
          {plan.analytics.active_subscribers} subscribers
        </p>
      </div>

      <ul className="space-y-1.5">
        {shown.map((f) => (
          <li key={f.key} className="flex items-center gap-2 text-xs text-text">
            <MaterialIcon name="check_circle" size={14} className="text-green-600 shrink-0" />
            <span className="truncate">{getFeatureLabel(f.key, f.customLabel)}</span>
          </li>
        ))}
        {more > 0 && <li className="text-xs text-text-muted pl-5">+{more} more features</li>}
        {shown.length === 0 && <li className="text-xs text-text-muted">No features enabled</li>}
      </ul>

      <div className="grid grid-cols-2 gap-2 text-[11px] text-text-muted border-t border-outline-variant/40 pt-3">
        <div>
          <span className="font-semibold text-text">Devices</span>
          <p>{plan.limits.max_devices}</p>
        </div>
        <div>
          <span className="font-semibold text-text">Consultations</span>
          <p>{plan.limits.consultation_credits}/cycle</p>
        </div>
        <div>
          <span className="font-semibold text-text">AI Credits</span>
          <p>{plan.limits.ai_credits}</p>
        </div>
        <div>
          <span className="font-semibold text-text">Storage</span>
          <p>{plan.limits.storage_limit_mb >= 1024 ? `${(plan.limits.storage_limit_mb / 1024).toFixed(1)} GB` : `${plan.limits.storage_limit_mb} MB`}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-muted border-t border-outline-variant/40 pt-3">
        <span>Created {formatDate(plan.created_at)}</span>
        <span>Updated {formatDate(plan.updated_at)}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wide py-2.5 hover:bg-primary-container transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onAnalytics}
          className="flex-1 rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide py-2.5 hover:bg-surface-elevated transition-colors"
        >
          Analytics
        </button>
      </div>
    </article>
  );
}
