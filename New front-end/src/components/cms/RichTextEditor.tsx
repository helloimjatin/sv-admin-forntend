"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const TOOLS: { label: string; icon: string; wrap: [string, string]; title: string }[] = [
  { label: "H1", icon: "title", wrap: ["<h1>", "</h1>"], title: "Heading 1" },
  { label: "H2", icon: "format_size", wrap: ["<h2>", "</h2>"], title: "Heading 2" },
  { label: "P", icon: "notes", wrap: ["<p>", "</p>"], title: "Paragraph" },
  { label: "B", icon: "format_bold", wrap: ["<strong>", "</strong>"], title: "Bold" },
  { label: "I", icon: "format_italic", wrap: ["<em>", "</em>"], title: "Italic" },
  { label: "UL", icon: "format_list_bulleted", wrap: ["<ul>\n  <li>", "</li>\n</ul>"], title: "Bullet list" },
  { label: "OL", icon: "format_list_numbered", wrap: ["<ol>\n  <li>", "</li>\n</ol>"], title: "Numbered list" },
  { label: "Link", icon: "link", wrap: ['<a href="https://">', "</a>"], title: "Hyperlink" },
  { label: "Quote", icon: "format_quote", wrap: ["<blockquote>", "</blockquote>"], title: "Quote" },
  { label: "Code", icon: "code", wrap: ["<pre><code>", "</code></pre>"], title: "Code block" },
  { label: "Callout", icon: "info", wrap: ['<div class="callout">', "</div>"], title: "Callout box" },
  { label: "HR", icon: "horizontal_rule", wrap: ["<hr />", ""], title: "Divider" },
  { label: "Btn", icon: "smart_button", wrap: ['<a class="btn" href="#">', "</a>"], title: "Button" },
  { label: "Img", icon: "image", wrap: ['<img src="" alt="" />', ""], title: "Image" },
  { label: "Video", icon: "videocam", wrap: ['<video src="" controls></video>', ""], title: "Video" },
  { label: "Table", icon: "table", wrap: ["<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></td></tr></table>", ""], title: "Table" },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  disabled?: boolean;
};

export function RichTextEditor({ value, onChange, error, id = "rich-editor", disabled = false }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const insert = (before: string, after: string) => {
    const el = ref.current;
    if (!el) {
      onChange(value + before + after);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-2">
      <div className={cn("flex flex-wrap gap-1 rounded-lg border border-outline-variant/50 bg-surface-low p-2", disabled && "opacity-60 pointer-events-none")} role="toolbar" aria-label="Rich text formatting">
        {TOOLS.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            onClick={() => insert(t.wrap[0], t.wrap[1])}
            className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-text-muted hover:bg-surface-elevated hover:text-primary transition-colors flex items-center gap-0.5"
          >
            <MaterialIcon name={t.icon} size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
      <textarea
        id={id}
        ref={ref}
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-colors",
          error && "border-red-500",
          disabled && "bg-surface-elevated cursor-default"
        )}
        placeholder="Write page content… Use the toolbar for headings, lists, links, quotes, and more."
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[10px] text-text-muted">{value.length} characters · HTML supported</p>
    </div>
  );
}
