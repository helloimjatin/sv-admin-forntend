"use client";

import { ContentBlock, ContentBlockType, BLOCK_TYPE_OPTIONS } from "@/data/cmsData";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition-colors";

function newBlock(type: ContentBlockType): ContentBlock {
  const defaults: Record<ContentBlockType, Record<string, unknown>> = {
    rich_text: { html: "<p>Enter content here…</p>" },
    heading: { level: "h2", text: "Section heading" },
    image: { url: "", alt: "", caption: "" },
    video: { url: "", title: "" },
    faq: { items: [{ q: "Question?", a: "Answer." }] },
    accordion: { items: [{ title: "Section", body: "Content" }] },
    table: { headers: ["Column 1", "Column 2"], rows: [["A", "B"]] },
    list: { items: ["Item 1", "Item 2"], ordered: false },
    quote: { text: "Quote text", cite: "" },
    code: { code: "// code", language: "javascript" },
    callout: { text: "Important healthcare notice", tone: "info" },
    divider: {},
    button: { label: "Learn More", link: "#" },
    embed: { url: "", title: "Embedded content" },
    cta: { title: "Call to Action", button: "Learn More", link: "" },
    card: { title: "Card Title", body: "Card description", image: "" },
    html: { html: "<!-- Admin only custom HTML -->" },
  };
  return { id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, data: defaults[type] };
}

export function ContentBlocksEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const addBlock = (type: ContentBlockType) => onChange([...blocks, newBlock(type)]);
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));
  const update = (id: string, data: Record<string, unknown>) =>
    onChange(blocks.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => addBlock(opt.value)}
            className="rounded-full px-3 py-1 text-xs font-semibold border border-outline-variant bg-surface-card hover:bg-surface-elevated transition-colors"
          >
            + {opt.label}
          </button>
        ))}
      </div>

      {blocks.length === 0 && (
        <p className="text-sm text-text-muted text-center py-6 border border-dashed border-outline-variant rounded-lg">
          No content blocks yet. Add a block above.
        </p>
      )}

      {blocks.map((block, idx) => (
        <div key={block.id} className="rounded-lg border border-outline-variant/50 bg-surface-low p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase text-text-muted">
              {BLOCK_TYPE_OPTIONS.find((o) => o.value === block.type)?.label}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-surface-elevated disabled:opacity-30" aria-label="Move up">
                <MaterialIcon name="arrow_upward" size={16} />
              </button>
              <button type="button" onClick={() => move(idx, 1)} disabled={idx === blocks.length - 1} className="p-1 rounded hover:bg-surface-elevated disabled:opacity-30" aria-label="Move down">
                <MaterialIcon name="arrow_downward" size={16} />
              </button>
              <button type="button" onClick={() => remove(block.id)} className="p-1 rounded text-red-600 hover:bg-red-50" aria-label="Remove block">
                <MaterialIcon name="delete" size={16} />
              </button>
            </div>
          </div>

          {block.type === "rich_text" && (
            <textarea
              rows={4}
              value={String(block.data.html ?? "")}
              onChange={(e) => update(block.id, { html: e.target.value })}
              className={inputClass}
              placeholder="HTML or rich text content"
            />
          )}
          {block.type === "image" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={String(block.data.url ?? "")} onChange={(e) => update(block.id, { url: e.target.value })} className={inputClass} placeholder="Image URL" />
              <input value={String(block.data.alt ?? "")} onChange={(e) => update(block.id, { alt: e.target.value })} className={inputClass} placeholder="Alt text" />
              <input value={String(block.data.caption ?? "")} onChange={(e) => update(block.id, { caption: e.target.value })} className={cn(inputClass, "sm:col-span-2")} placeholder="Caption" />
            </div>
          )}
          {block.type === "video" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={String(block.data.url ?? "")} onChange={(e) => update(block.id, { url: e.target.value })} className={inputClass} placeholder="Video URL" />
              <input value={String(block.data.title ?? "")} onChange={(e) => update(block.id, { title: e.target.value })} className={inputClass} placeholder="Title" />
            </div>
          )}
          {block.type === "cta" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={String(block.data.title ?? "")} onChange={(e) => update(block.id, { title: e.target.value })} className={inputClass} placeholder="Title" />
              <input value={String(block.data.button ?? "")} onChange={(e) => update(block.id, { button: e.target.value })} className={inputClass} placeholder="Button text" />
              <input value={String(block.data.link ?? "")} onChange={(e) => update(block.id, { link: e.target.value })} className={inputClass} placeholder="Link" />
            </div>
          )}
          {block.type === "card" && (
            <div className="space-y-2">
              <input value={String(block.data.title ?? "")} onChange={(e) => update(block.id, { title: e.target.value })} className={inputClass} placeholder="Card title" />
              <textarea value={String(block.data.body ?? "")} onChange={(e) => update(block.id, { body: e.target.value })} className={inputClass} rows={2} placeholder="Card body" />
            </div>
          )}
          {block.type === "list" && (
            <textarea
              value={((block.data.items as string[]) ?? []).join("\n")}
              onChange={(e) => update(block.id, { items: e.target.value.split("\n").filter(Boolean) })}
              className={inputClass}
              rows={3}
              placeholder="One item per line"
            />
          )}
          {(block.type === "faq" || block.type === "accordion") && (
            <textarea
              value={JSON.stringify(block.data.items ?? [], null, 2)}
              onChange={(e) => {
                try { update(block.id, { items: JSON.parse(e.target.value) }); } catch { /* ignore invalid json while typing */ }
              }}
              className={cn(inputClass, "font-mono text-xs")}
              rows={4}
            />
          )}
          {block.type === "table" && (
            <textarea
              value={JSON.stringify({ headers: block.data.headers, rows: block.data.rows }, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  update(block.id, parsed);
                } catch { /* ignore */ }
              }}
              className={cn(inputClass, "font-mono text-xs")}
              rows={4}
            />
          )}
          {block.type === "html" && (
            <textarea
              value={String(block.data.html ?? "")}
              onChange={(e) => update(block.id, { html: e.target.value })}
              className={cn(inputClass, "font-mono text-xs")}
              rows={4}
              placeholder="Custom HTML (admin only)"
            />
          )}
          {block.type === "heading" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select value={String(block.data.level ?? "h2")} onChange={(e) => update(block.id, { level: e.target.value })} className={inputClass}>
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
              </select>
              <input value={String(block.data.text ?? "")} onChange={(e) => update(block.id, { text: e.target.value })} className={cn(inputClass, "sm:col-span-2")} placeholder="Heading text" />
            </div>
          )}
          {block.type === "quote" && (
            <div className="space-y-2">
              <textarea value={String(block.data.text ?? "")} onChange={(e) => update(block.id, { text: e.target.value })} className={inputClass} rows={2} placeholder="Quote" />
              <input value={String(block.data.cite ?? "")} onChange={(e) => update(block.id, { cite: e.target.value })} className={inputClass} placeholder="Citation" />
            </div>
          )}
          {block.type === "code" && (
            <textarea value={String(block.data.code ?? "")} onChange={(e) => update(block.id, { code: e.target.value })} className={cn(inputClass, "font-mono text-xs")} rows={3} />
          )}
          {block.type === "callout" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select value={String(block.data.tone ?? "info")} onChange={(e) => update(block.id, { tone: e.target.value })} className={inputClass}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
              <input value={String(block.data.text ?? "")} onChange={(e) => update(block.id, { text: e.target.value })} className={cn(inputClass, "sm:col-span-2")} placeholder="Callout text" />
            </div>
          )}
          {block.type === "divider" && <p className="text-xs text-text-muted">Horizontal divider — no settings</p>}
          {block.type === "button" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={String(block.data.label ?? "")} onChange={(e) => update(block.id, { label: e.target.value })} className={inputClass} placeholder="Button label" />
              <input value={String(block.data.link ?? "")} onChange={(e) => update(block.id, { link: e.target.value })} className={inputClass} placeholder="Link URL" />
            </div>
          )}
          {block.type === "embed" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input value={String(block.data.url ?? "")} onChange={(e) => update(block.id, { url: e.target.value })} className={inputClass} placeholder="Embed URL" />
              <input value={String(block.data.title ?? "")} onChange={(e) => update(block.id, { title: e.target.value })} className={inputClass} placeholder="Title" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
