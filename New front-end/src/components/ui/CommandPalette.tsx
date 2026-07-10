"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { users } from "@/data/mockData";
import { Search, LayoutDashboard, Users, FileText, CreditCard, BadgeCheck, UserCog, Settings, HelpCircle, Bell, FileStack, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

const pages = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/users", icon: Users },
  { label: "Medical Records", href: "/medical-records", icon: FileText },
  { label: "Staff Directory", href: "/staff", icon: UserCog },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Subscriptions", href: "/subscriptions", icon: BadgeCheck },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "CMS / Pages", href: "/cms", icon: FileStack },
  { label: "App Configuration", href: "/app-config", icon: SlidersHorizontal },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!commandOpen) setQuery("");
  }, [commandOpen]);

  useEffect(() => {
    if (!commandOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  if (!commandOpen) return null;

  const q = query.toLowerCase();
  const filteredPages = pages.filter((p) => p.label.toLowerCase().includes(q));
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(q) || u.phone.includes(q)).slice(0, 5);

  const navigate = (href: string) => {
    setCommandOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[15vh] px-4" onClick={() => setCommandOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface-card shadow-2xl animate-fade-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, users... (Ctrl+K)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredPages.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Pages</p>
              {filteredPages.map((p) => (
                <button key={p.href} onClick={() => navigate(p.href)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-elevated transition-colors">
                  <p.icon className="h-4 w-4 text-brand-600" />
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {filteredUsers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Users</p>
              {filteredUsers.map((u) => (
                <button key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-surface-elevated transition-colors">
                  <Users className="h-4 w-4 text-brand-600" />
                  <span>{u.name}</span>
                  <span className="ml-auto font-mono text-xs text-text-muted">{u.phone}</span>
                </button>
              ))}
            </div>
          )}
          {!filteredPages.length && !filteredUsers.length && (
            <p className="px-3 py-6 text-center text-sm text-text-muted">No results found</p>
          )}
        </div>
      </div>
    </div>
  );
}
