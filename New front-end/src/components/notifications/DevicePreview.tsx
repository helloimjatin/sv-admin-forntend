"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export type PreviewData = {
  title: string;
  subtitle: string;
  body?: string;
  actionButton: string;
  imageUrl?: string;
};

type PreviewLayout = "row" | "stack" | "tabs";

type DevicePreviewProps = PreviewData & {
  /** row = 3-up (modals); stack = vertical; tabs = one device at a time (sidebar) */
  layout?: PreviewLayout;
};

function AndroidPreview({ title, subtitle, body, actionButton, imageUrl, compact }: PreviewData & { compact?: boolean }) {
  const text = body || subtitle;

  if (compact) {
    return (
      <div className="rounded-xl border border-outline-variant/50 bg-surface-low p-3" role="img" aria-label={`Android notification preview for ${title || "untitled"}`}>
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">SehatVaani • now</p>
        <div className="rounded-xl border border-outline-variant/50 bg-surface-card p-3 shadow-sm">
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
              <MaterialIcon name="health_and_safety" size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{title || "Notification title"}</p>
              {subtitle && <p className="text-[10px] text-primary font-medium truncate mt-0.5">{subtitle}</p>}
              <p className="text-[10px] text-text-muted mt-1 line-clamp-3 break-words">{text || "Message preview"}</p>
            </div>
          </div>
          {imageUrl && (
            <div className="mt-2 h-14 rounded-md bg-surface-elevated border border-outline-variant/40 overflow-hidden">
              {imageUrl.startsWith("data:") || imageUrl.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
          )}
          {actionButton && <p className="mt-2 text-center text-[10px] font-semibold text-primary truncate">{actionButton}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[220px]" role="img" aria-label={`Android notification preview for ${title || "untitled"}`}>
      <div className="rounded-[28px] border-2 border-outline-variant bg-surface-low p-2 shadow-lg">
        <div className="rounded-[22px] bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 text-[10px] text-text-muted border-b border-outline-variant/40">
            <span>9:41</span>
            <div className="flex gap-1">
              <MaterialIcon name="signal_cellular_alt" size={12} />
              <MaterialIcon name="wifi" size={12} />
              <MaterialIcon name="battery_full" size={12} />
            </div>
          </div>
          <div className="p-3 pb-4 space-y-3">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">SehatVaani • now</p>
            <div className="rounded-xl border border-outline-variant/50 bg-surface-card p-3 shadow-sm">
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                  <MaterialIcon name="health_and_safety" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">{title || "Notification title"}</p>
                  {subtitle && <p className="text-[10px] text-primary font-medium truncate mt-0.5">{subtitle}</p>}
                  <p className="text-[10px] text-text-muted mt-1 line-clamp-3 break-words">{text || "Message preview"}</p>
                </div>
              </div>
              {imageUrl && (
                <div className="mt-2 h-16 rounded-md bg-surface-elevated border border-outline-variant/40 flex items-center justify-center text-[10px] text-text-muted overflow-hidden">
                  {imageUrl.startsWith("data:") || imageUrl.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "Image attached"
                  )}
                </div>
              )}
              {actionButton && (
                <p className="mt-2 text-center text-[10px] font-semibold text-primary truncate">{actionButton}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-text-muted mt-2 font-medium">Android</p>
    </div>
  );
}

function IPhonePreview({ title, subtitle, body, actionButton, imageUrl, compact }: PreviewData & { compact?: boolean }) {
  const text = body || subtitle;

  if (compact) {
    return (
      <div className="rounded-2xl border border-outline-variant/50 bg-surface-card p-3 shadow-sm" role="img" aria-label={`iPhone notification preview for ${title || "untitled"}`}>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <MaterialIcon name="health_and_safety" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-text-muted">SEHATVAANI</p>
            <p className="text-xs font-bold truncate">{title || "Notification title"}</p>
            <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 break-words">{subtitle || text || "Message preview"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[220px]" role="img" aria-label={`iPhone notification preview for ${title || "untitled"}`}>
      <div className="rounded-[28px] border-2 border-outline-variant bg-surface-low p-2 shadow-lg">
        <div className="rounded-[22px] bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 text-[10px] text-text-muted border-b border-outline-variant/40">
            <span>9:41</span>
            <div className="flex gap-1">
              <MaterialIcon name="signal_cellular_alt" size={12} />
              <MaterialIcon name="wifi" size={12} />
              <MaterialIcon name="battery_full" size={12} />
            </div>
          </div>
          <div className="p-3 pb-4 space-y-3">
            <div className="rounded-2xl border border-outline-variant/50 bg-surface-card/95 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                  <MaterialIcon name="health_and_safety" size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-text-muted">SEHATVAANI</p>
                  <p className="text-xs font-bold truncate">{title || "Notification title"}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 break-words">{subtitle || text}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-card/80 p-2 opacity-50">
              <p className="text-[10px] font-semibold truncate">Earlier notification</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-text-muted mt-2 font-medium">iPhone</p>
    </div>
  );
}

function InAppPreview({ title, subtitle, body, actionButton, imageUrl, compact }: PreviewData & { compact?: boolean }) {
  return (
    <div
      className={cn("mx-auto w-full rounded-lg border border-outline-variant/50 bg-surface-card overflow-hidden shadow-sm", compact ? "max-w-none" : "max-w-[280px] shadow-lg")}
      role="img"
      aria-label={`In-app notification preview for ${title || "untitled"}`}
    >
      <div className="bg-primary-fixed/40 px-4 py-2 border-b border-outline-variant/40">
        <p className="text-[10px] font-semibold text-text-muted uppercase">In-App Notification</p>
      </div>
      <div className="p-4 space-y-3">
        {imageUrl && (
          <div className={cn("rounded-lg bg-surface-elevated border border-outline-variant/40 overflow-hidden flex items-center justify-center", compact ? "h-16" : "h-24")}>
            {imageUrl.startsWith("data:") || imageUrl.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <MaterialIcon name="image" size={32} className="text-text-muted" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold break-words">{title || "Notification title"}</p>
          {subtitle && <p className="text-xs text-primary font-medium mt-0.5 break-words">{subtitle}</p>}
          {(body || subtitle) && <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-4 break-words">{body || subtitle}</p>}
        </div>
        {actionButton && (
          <button type="button" tabIndex={-1} className="w-full rounded-lg bg-primary text-white text-xs font-semibold py-2.5 truncate">
            {actionButton}
          </button>
        )}
      </div>
      {!compact && <p className="text-center text-xs text-text-muted my-2 font-medium">In-App</p>}
    </div>
  );
}

const TABS = [
  { id: "android" as const, label: "Android" },
  { id: "iphone" as const, label: "iPhone" },
  { id: "inapp" as const, label: "In-App" },
];

export function DevicePreview({ layout = "row", ...props }: DevicePreviewProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("android");
  const compact = layout === "tabs";

  if (layout === "tabs") {
    return (
      <div className="space-y-3">
        <div className="flex rounded-lg border border-outline-variant/50 p-0.5 bg-surface-low" role="tablist" aria-label="Preview device">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors",
                tab === t.id ? "bg-surface-card text-primary shadow-sm" : "text-text-muted hover:text-text"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {tab === "android" && <AndroidPreview {...props} compact />}
          {tab === "iphone" && <IPhonePreview {...props} compact />}
          {tab === "inapp" && <InAppPreview {...props} compact />}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", layout === "stack" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
      <AndroidPreview {...props} />
      <IPhonePreview {...props} />
      <InAppPreview {...props} />
    </div>
  );
}

/** @deprecated use PreviewData fields subtitle + body */
export function DevicePreviewLegacy({
  title,
  subtitle,
  description,
  actionButton,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  description: string;
  actionButton: string;
  imageUrl?: string;
}) {
  return <DevicePreview title={title} subtitle={subtitle} body={description} actionButton={actionButton} imageUrl={imageUrl} />;
}
