"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Modal,
  PageHeader,
  StatCard,
} from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PlanCard } from "@/components/subscriptions/PlanCard";
import {
  SubscriptionPlan,
  archivePlan,
  billingCycleLabel,
  changePlanRank,
  duplicatePlan,
  effectivePrice,
  getActivePlans,
  getFeatureLabel,
  getPlanStats,
  reorderPlans,
  setPlanStatus,
  setRecommendedPlan,
  softDeletePlan,
  BILLING_CYCLES,
  PLAN_STATUSES,
  VISIBILITY_OPTIONS,
} from "@/data/subscriptionPlansData";
import { subscriptions } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { CreditCard, Users, FileEdit, TrendingUp } from "lucide-react";

type SortKey = "price" | "popularity" | "created";

export function PlansPanel() {
  const router = useRouter();
  const { addToast, bumpRefresh, refreshKey, adminEmail } = useApp();
  const editor = adminEmail || "admin@sehatvaani.com";

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);

  const [viewPlan, setViewPlan] = useState<SubscriptionPlan | null>(null);
  const [analyticsPlan, setAnalyticsPlan] = useState<SubscriptionPlan | null>(null);
  const [subscribersPlan, setSubscribersPlan] = useState<SubscriptionPlan | null>(null);
  const [confirm, setConfirm] = useState<{ type: "delete" | "archive"; plan: SubscriptionPlan } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [refreshKey]);

  useEffect(() => {
    if (menuOpenId == null) return;
    const close = () => setMenuOpenId(null);
    // Defer so the opening click doesn't immediately close
    const t = window.setTimeout(() => window.addEventListener("click", close), 0);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("click", close);
    };
  }, [menuOpenId]);

  const stats = useMemo(() => getPlanStats(), [refreshKey]);

  const plans = useMemo(() => {
    let list = getActivePlans();
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.plan_id.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.internal_code.toLowerCase().includes(q)
      );
    }
    if (cycleFilter !== "all") list = list.filter((p) => p.pricing.billing_cycle === cycleFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (visibilityFilter !== "all") list = list.filter((p) => p.visibility.visibility === visibilityFilter);

    list = [...list].sort((a, b) => {
      if (sortKey === "price") return effectivePrice(a) - effectivePrice(b);
      if (sortKey === "popularity") return b.analytics.active_subscribers - a.analytics.active_subscribers;
      if (sortKey === "created") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return a.rank - b.rank;
    });
    return list;
  }, [query, cycleFilter, statusFilter, visibilityFilter, sortKey, refreshKey]);

  const planSubscribers = useMemo(() => {
    if (!subscribersPlan) return [];
    return subscriptions.filter(
      (s) =>
        s.current_plan_id === subscribersPlan.id ||
        s.plan.toLowerCase().includes(subscribersPlan.name.toLowerCase().split(" ")[0])
    );
  }, [subscribersPlan]);

  function run(action: () => boolean | SubscriptionPlan | null, success: string, error = "Action failed") {
    const result = action();
    if (result) {
      addToast(success, "success");
      bumpRefresh();
    } else {
      addToast(error, "error");
    }
    setMenuOpenId(null);
  }

  function onDropReorder(targetId: number) {
    if (dragId == null || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = getActivePlans().map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    reorderPlans(ids, editor);
    addToast("Plan order updated", "success");
    bumpRefresh();
    setDragId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <PageHeader title="Subscription Plans" />
          <p className="text-sm text-text-muted mt-1 max-w-2xl">
            Create and manage pricing tiers, feature entitlements, trials, and plan visibility for SehatVaani.
          </p>
        </div>
        <Link
          href="/subscriptions/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-primary-container transition-colors shrink-0"
        >
          <MaterialIcon name="add" size={18} />
          Create New Plan
        </Link>
      </div>

      <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex flex-1 gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
              placeholder="Search by plan name or plan ID…"
              className="flex-1 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-sm outline-none focus:border-primary"
              aria-label="Search plans"
            />
            <button
              type="button"
              onClick={() => setQuery(search)}
              className="rounded-lg bg-primary text-white px-5 py-2 text-xs font-semibold uppercase tracking-wide hover:bg-primary-container"
            >
              Search
            </button>
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            aria-label="Sort plans"
          >
            <option value="created">Sort by creation date</option>
            <option value="price">Sort by price</option>
            <option value="popularity">Sort by popularity</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
            aria-label="Filter by billing cycle"
          >
            <option value="all">All billing cycles</option>
            {BILLING_CYCLES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {PLAN_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
            aria-label="Filter by visibility"
          >
            <option value="all">All visibility</option>
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-lg border border-outline-variant/50 shimmer" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-card p-12 text-center">
          <MaterialIcon name="card_membership" size={40} className="text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No plans found</h3>
          <p className="text-sm text-text-muted mt-1 mb-4">Adjust filters or create a new subscription plan.</p>
          <Link
            href="/subscriptions/create"
            className="inline-flex rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wide px-6 py-2.5 hover:bg-primary-container"
          >
            Create New Plan
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-outline-variant/50 bg-surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-surface-low border-y border-outline-variant/50 text-[11px] uppercase tracking-wider text-text-muted">
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Active Subscribers</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-outline-variant/30 hover:bg-surface-elevated/40 cursor-pointer h-14"
                    onClick={() => setViewPlan(plan)}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-primary">{plan.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{plan.plan_id}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold">
                      {formatCurrency(effectivePrice(plan))}
                    </td>
                    <td className="p-4 capitalize text-xs">
                      {billingCycleLabel(plan.pricing.billing_cycle)}
                    </td>
                    <td className="p-4">
                      <Badge variant={plan.status === "active" ? "success" : "default"}>
                        {plan.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-xs text-text-muted">
                      {plan.analytics.active_subscribers}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewPlan(plan)}
                          className="rounded bg-primary text-white text-xs font-semibold px-3 py-1.5 hover:bg-primary-container"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/subscriptions/create?edit=${plan.id}`)}
                          className="rounded border border-outline-variant text-xs font-semibold px-3 py-1.5 hover:bg-surface-elevated"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View modal */}
      <Modal open={!!viewPlan} onClose={() => setViewPlan(null)} title={viewPlan?.name || "Plan"} size="lg">
        {viewPlan && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{viewPlan.plan_id}</Badge>
              <Badge>{viewPlan.status}</Badge>
              <Badge>{billingCycleLabel(viewPlan.pricing.billing_cycle)}</Badge>
              <Badge>{viewPlan.visibility.visibility}</Badge>
            </div>
            <p className="text-text-muted">{viewPlan.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-low p-3">
                <p className="text-xs text-text-muted">Price</p>
                <p className="font-semibold">{formatCurrency(effectivePrice(viewPlan))}</p>
              </div>
              <div className="rounded-lg bg-surface-low p-3">
                <p className="text-xs text-text-muted">Trial</p>
                <p className="font-semibold">{viewPlan.pricing.trial_days} days</p>
              </div>
              <div className="rounded-lg bg-surface-low p-3">
                <p className="text-xs text-text-muted">Devices / Family</p>
                <p className="font-semibold">{viewPlan.limits.max_devices} / {viewPlan.limits.max_family_members}</p>
              </div>
              <div className="rounded-lg bg-surface-low p-3">
                <p className="text-xs text-text-muted">AI / Consultations</p>
                <p className="font-semibold">{viewPlan.limits.ai_credits} / {viewPlan.limits.consultation_credits}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Features</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {viewPlan.features.filter((f) => f.enabled).map((f) => (
                  <li key={f.key} className="flex items-center gap-2 text-xs">
                    <MaterialIcon name="check" size={14} className="text-green-600" />
                    {getFeatureLabel(f.key, f.customLabel)}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-text-muted">
              Created {formatDateTime(viewPlan.created_at)} · Updated {formatDateTime(viewPlan.updated_at)} · v{viewPlan.version}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/subscriptions/create?edit=${viewPlan.id}`)}
                className="rounded-lg bg-primary text-white text-xs font-semibold uppercase tracking-wide px-5 py-2.5"
              >
                Edit Plan
              </button>
              <button
                type="button"
                onClick={() => setViewPlan(null)}
                className="rounded-lg border border-outline-variant text-xs font-semibold uppercase tracking-wide px-5 py-2.5"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Analytics modal */}
      <Modal open={!!analyticsPlan} onClose={() => setAnalyticsPlan(null)} title={`${analyticsPlan?.name || ""} Analytics`} size="lg">
        {analyticsPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Active Subscribers", value: analyticsPlan.analytics.active_subscribers },
                { label: "New Subscribers", value: analyticsPlan.analytics.new_subscribers },
                { label: "Revenue", value: formatCurrency(analyticsPlan.analytics.revenue) },
                { label: "Renewal Rate", value: `${analyticsPlan.analytics.renewal_rate}%` },
                { label: "Churn Rate", value: `${analyticsPlan.analytics.churn_rate}%` },
                { label: "Conversion Rate", value: `${analyticsPlan.analytics.conversion_rate}%` },
                { label: "Avg Duration", value: `${analyticsPlan.analytics.avg_duration_days} days` },
                { label: "Monthly Growth", value: `${analyticsPlan.analytics.monthly_growth}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border border-outline-variant/50 bg-surface-low p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{m.label}</p>
                  <p className="text-lg font-bold mt-1">{m.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Most Used Features</p>
              {analyticsPlan.analytics.most_used_features.length === 0 ? (
                <p className="text-sm text-text-muted">No usage data yet.</p>
              ) : (
                <ul className="space-y-2">
                  {analyticsPlan.analytics.most_used_features.map((f) => (
                    <li key={f.feature}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{f.feature}</span>
                        <span className="font-mono">{f.usage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${f.usage}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Subscribers modal */}
      <Modal open={!!subscribersPlan} onClose={() => setSubscribersPlan(null)} title={`${subscribersPlan?.name || ""} Subscribers`} size="lg">
        {subscribersPlan && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted">
              Showing linked mock subscribers for this plan ({planSubscribers.length}).
            </p>
            {planSubscribers.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">No subscribers found for this plan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-text-muted border-b border-outline-variant/50">
                      <th className="py-2 pr-3">Customer</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Start</th>
                      <th className="py-2">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planSubscribers.map((s) => (
                      <tr key={s.id} className="border-b border-outline-variant/30">
                        <td className="py-2.5 pr-3">
                          <p className="font-medium">{s.customer_name}</p>
                          <p className="text-xs text-text-muted">{s.customer_email}</p>
                        </td>
                        <td className="py-2.5 pr-3"><Badge variant={s.status === "active" ? "success" : "warning"}>{s.status}</Badge></td>
                        <td className="py-2.5 pr-3 text-xs">{formatDate(s.start_date)}</td>
                        <td className="py-2.5 text-xs">{formatDate(s.expiry_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.type === "delete" ? "Delete plan?" : "Archive plan?"}
        size="sm"
      >
        {confirm && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              {confirm.type === "delete"
                ? `Soft-delete “${confirm.plan.name}”? Existing subscribers keep access until expiry.`
                : `Archive “${confirm.plan.name}”? It will be hidden from new purchases.`}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm.type === "delete") {
                    softDeletePlan(confirm.plan.id, editor);
                    addToast("Plan deleted", "success");
                  } else {
                    archivePlan(confirm.plan.id, editor);
                    addToast("Plan archived", "success");
                  }
                  bumpRefresh();
                  setConfirm(null);
                }}
                className="rounded-lg bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
