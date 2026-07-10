"use client";

import { useRef, useState } from "react";
import { MEDIA_LIBRARY } from "@/data/cmsData";
import { Modal } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function MediaUploader({ label, value, onChange, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-text-muted">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) readFile(file);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-4 transition-colors text-center",
          dragging ? "border-primary bg-primary-fixed/20" : "border-outline-variant/60 bg-surface-low/40"
        )}
      >
        {value ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="mx-auto h-28 w-full max-w-xs object-cover rounded-lg border border-outline-variant/40" />
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-semibold text-primary hover:underline">Replace</button>
              <button type="button" onClick={() => setLibraryOpen(true)} className="text-xs font-semibold text-primary hover:underline">Library</button>
              <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
            </div>
            <p className="text-[10px] text-text-muted">Optimized preview · drag to replace</p>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <MaterialIcon name="cloud_upload" size={28} className="text-text-muted mx-auto" />
            <p className="text-sm text-text-muted">Drag & drop image, or</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-primary text-white text-xs font-semibold px-3 py-1.5">Upload</button>
              <button type="button" onClick={() => setLibraryOpen(true)} className="rounded-lg border border-outline-variant text-xs font-semibold px-3 py-1.5 hover:bg-surface-elevated">Media Library</button>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
          }}
        />
      </div>
      <input
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL"
        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs outline-none focus:border-primary"
      />
      {hint && <p className="text-[10px] text-amber-600">{hint}</p>}

      <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)} title="Media Library" size="lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MEDIA_LIBRARY.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange(m.url); setLibraryOpen(false); }}
              className="rounded-lg border border-outline-variant/50 overflow-hidden hover:border-primary transition-colors text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.name} className="h-24 w-full object-cover" />
              <p className="p-2 text-xs font-medium truncate">{m.name}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export function GalleryUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-text-muted">Additional Media / Gallery</label>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-outline-variant/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded text-[10px] px-1"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-16 w-16 rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-text-muted hover:border-primary"
          aria-label="Add gallery image"
        >
          <MaterialIcon name="add" size={20} />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => onChange([...images, String(reader.result)]);
            reader.readAsDataURL(file);
          });
        }}
      />
    </div>
  );
}
