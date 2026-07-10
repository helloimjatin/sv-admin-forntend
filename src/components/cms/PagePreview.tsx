"use client";

import { useState } from "react";
import { StaticPage, PageFormData, getPublicUrl, PageVersion } from "@/data/cmsData";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type PreviewDevice = "desktop" | "tablet" | "mobile";

function renderBlocks(blocks: StaticPage["blocks"] | PageFormData["blocks"]) {
  return blocks.map((block) => {
    switch (block.type) {
      case "rich_text":
        return <div key={block.id} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: String(block.data.html ?? "") }} />;
      case "heading": {
        const text = String(block.data.text ?? "");
        const level = String(block.data.level ?? "h2");
        if (level === "h1") return <h1 key={block.id} className="text-xl font-bold">{text}</h1>;
        if (level === "h3") return <h3 key={block.id} className="text-base font-semibold">{text}</h3>;
        return <h2 key={block.id} className="text-lg font-semibold">{text}</h2>;
      }
      case "cta":
      case "button":
        return (
          <div key={block.id} className="rounded-lg bg-primary-fixed/40 p-4 text-center">
            <p className="font-semibold text-sm">{String(block.data.title ?? block.data.label)}</p>
            <span className="inline-block mt-2 rounded-lg bg-primary text-white text-xs font-semibold px-4 py-2">
              {String(block.data.button ?? block.data.label ?? "Action")}
            </span>
          </div>
        );
      case "list":
        return (
          <ul key={block.id} className="list-disc pl-5 text-sm space-y-1">
            {((block.data.items as string[]) ?? []).map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        );
      case "faq":
        return (
          <div key={block.id} className="space-y-2">
            {((block.data.items as { q: string; a: string }[]) ?? []).map((item, i) => (
              <div key={i} className="rounded-lg border border-outline-variant/50 p-3">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="text-xs text-text-muted mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        );
      case "quote":
        return (
          <blockquote key={block.id} className="border-l-4 border-primary pl-3 text-sm italic text-text-muted">
            {String(block.data.text)}
            {block.data.cite ? <cite className="block text-xs mt-1 not-italic">— {String(block.data.cite)}</cite> : null}
          </blockquote>
        );
      case "callout":
        return (
          <div key={block.id} className="rounded-lg bg-primary-fixed/30 border border-primary-fixed/50 p-3 text-sm">
            {String(block.data.text)}
          </div>
        );
      case "divider":
        return <hr key={block.id} className="border-outline-variant/50" />;
      case "code":
        return (
          <pre key={block.id} className="rounded-lg bg-surface-low p-3 text-xs font-mono overflow-x-auto">
            {String(block.data.code)}
          </pre>
        );
      default:
        return (
          <div key={block.id} className="rounded-lg border border-outline-variant/40 bg-surface-low p-3 text-xs text-text-muted">
            [{block.type} block]
          </div>
        );
    }
  });
}

export function PagePreview({
  page,
  device: controlledDevice,
}: {
  page: PageFormData | StaticPage;
  device?: PreviewDevice;
}) {
  const [device, setDevice] = useState<PreviewDevice>(controlledDevice ?? "desktop");
  const active = controlledDevice ?? device;
  const title = page.title || "Untitled Page";
  const slug = "slug" in page ? page.slug : "";
  const blocks = page.blocks ?? [];
  const gallery = "gallery" in page ? page.gallery : [];

  const widths: Record<PreviewDevice, string> = {
    desktop: "w-full",
    tablet: "w-full max-w-[640px] mx-auto",
    mobile: "w-full max-w-[360px] mx-auto",
  };

  return (
    <div className="space-y-3" role="region" aria-label="Page preview">
      {!controlledDevice && (
        <div className="flex gap-1 justify-center" role="tablist" aria-label="Preview device">
          {([
            ["desktop", "desktop_windows"],
            ["tablet", "tablet_mac"],
            ["mobile", "smartphone"],
          ] as const).map(([d, icon]) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={active === d}
              onClick={() => setDevice(d)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize flex items-center gap-1 border transition-colors",
                active === d
                  ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                  : "border-outline-variant text-text-muted hover:bg-surface-elevated"
              )}
            >
              <MaterialIcon name={icon} size={14} />
              {d}
            </button>
          ))}
        </div>
      )}

      <div className={cn("transition-all duration-300", widths[active])}>
        <div className="rounded-lg border border-outline-variant/50 bg-surface-card overflow-hidden shadow-sm">
          {page.banner_image && (
            <div className={cn("bg-surface-elevated overflow-hidden", active === "mobile" ? "h-20" : "h-32")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.banner_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={cn("space-y-4 overflow-y-auto", active === "mobile" ? "p-4 max-h-[55vh]" : "p-6 max-h-[70vh]")}>
            <div className="text-[10px] text-text-muted font-mono break-all">{getPublicUrl(slug, page.language)}</div>
            <h1 className={cn("font-bold", active === "mobile" ? "text-lg" : "text-2xl")}>{title}</h1>
            {page.short_description && <p className="text-sm text-text-muted">{page.short_description}</p>}
            {page.featured_image && (
              <div className="rounded-lg overflow-hidden border border-outline-variant/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={page.featured_image} alt="" className="w-full max-h-48 object-cover" />
              </div>
            )}
            {page.content && (
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
            )}
            <div className="space-y-4">{renderBlocks(blocks)}</div>
            {gallery && gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {gallery.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt="" className="rounded-lg h-20 w-full object-cover border border-outline-variant/40" />
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-outline-variant/40 flex items-center gap-2 text-[10px] text-text-muted">
              <MaterialIcon name="health_and_safety" size={14} className="text-primary" />
              SehatVaani · {page.language.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VersionHistoryPanel({
  versions,
  onRestore,
  onCompare,
}: {
  versions: PageVersion[];
  onRestore: (version: number) => void;
  onCompare?: (version: PageVersion) => void;
}) {
  if (!versions.length) {
    return <p className="text-sm text-text-muted text-center py-4">No version history yet. Saves will create versions.</p>;
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {versions.map((v) => (
        <div key={v.version} className="flex items-start justify-between gap-3 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-low/50">
          <div className="min-w-0">
            <p className="text-sm font-semibold">v{v.version} — {v.title}</p>
            <p className="text-xs text-text-muted">{v.change_summary}</p>
            {v.revision_notes && <p className="text-xs text-primary mt-0.5">{v.revision_notes}</p>}
            <p className="text-[10px] text-text-muted mt-1">{v.editor_name} · {new Date(v.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {onCompare && (
              <button type="button" onClick={() => onCompare(v)} className="text-xs font-semibold text-text-muted hover:text-primary">
                View
              </button>
            )}
            <button type="button" onClick={() => onRestore(v.version)} className="text-xs font-semibold text-primary hover:underline">
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
