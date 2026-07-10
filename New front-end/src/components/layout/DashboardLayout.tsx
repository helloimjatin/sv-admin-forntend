"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { LOGO_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { notifications } from "@/data/mockData";
import { Menu, Moon, Sun, Search, Bell } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Users", href: "/users", icon: "manage_accounts" },
  { label: "Medical Records", href: "/medical-records", icon: "clinical_notes" },
  { label: "Staff Directory", href: "/staff", icon: "group", roles: ["Super Admin"] },
  { label: "Billing", href: "/billing", icon: "payments" },
  { label: "Subscriptions", href: "/subscriptions", icon: "card_membership" },
  { label: "Notifications", href: "/notifications", icon: "notifications" },
  { label: "CMS / Pages", href: "/cms", icon: "article" },
  { label: "App Config", href: "/app-config", icon: "tune", roles: ["Super Admin", "Admin"] },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const {
    role, adminEmail, darkMode, toggleDarkMode, logout,
    sidebarOpen, setSidebarOpen, setCommandOpen,
    notificationsOpen, setNotificationsOpen,
  } = useApp();
  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));
  const unread = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotificationsOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [notificationsOpen, setNotificationsOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant bg-surface-low p-6 transition-transform lg:static lg:translate-x-0 overflow-y-auto shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col gap-2 mb-8">
          <Image src={LOGO_URL} alt="SehatVaani Logo" width={120} height={40} className="h-10 w-auto object-contain" unoptimized priority />
          <span className="text-text-muted text-sm mt-1">Healthcare Management</span>
        </div>

        <Link href="/users/new" className="bg-primary text-white text-xs font-semibold uppercase tracking-wide px-4 py-3 rounded-lg w-full mb-6 hover:bg-primary-container transition-colors flex justify-center items-center gap-2">
          <MaterialIcon name="add" size={18} /> New Entry
        </Link>

        <nav className="flex flex-col gap-2 flex-1">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "p-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all",
                  active ? "bg-primary-fixed text-on-primary-fixed" : "text-text-muted hover:bg-surface-elevated"
                )}
              >
                <MaterialIcon name={item.icon} size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link href="/help" className="text-text-muted hover:bg-surface-elevated p-3 rounded-lg flex items-center gap-3 text-sm transition-all">
            <MaterialIcon name="help" size={20} /> Help Center
          </Link>
          <button onClick={logout} className="text-text-muted hover:bg-surface-elevated p-3 rounded-lg flex items-center gap-3 text-sm transition-all w-full text-left">
            <MaterialIcon name="logout" size={20} /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar — premium features */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-outline-variant bg-surface-card/90 backdrop-blur-md px-4 py-3 lg:px-6 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          {(title || subtitle) && (
            <div className="flex-1 min-w-0 hidden sm:block">
              {title && <h1 className="text-base font-bold truncate">{title}</h1>}
              {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
            </div>
          )}
          {!title && <div className="flex-1" />}

          <button
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-low px-3 py-2 text-sm text-text-muted hover:border-primary/40 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Quick search...</span>
            <kbd className="ml-1 rounded border border-outline-variant px-1.5 text-[10px]">⌘K</kbd>
          </button>

          <button onClick={toggleDarkMode} className="rounded-lg p-2.5 hover:bg-surface-elevated transition-colors" title="Toggle dark mode" aria-label="Toggle dark mode">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-lg p-2.5 hover:bg-surface-elevated transition-colors"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-outline-variant bg-surface-card shadow-xl z-50 animate-fade-in" role="menu">
                <div className="border-b border-outline-variant px-4 py-3 font-semibold text-sm">Notifications</div>
                {notifications.map((n) => (
                  <div key={n.id} className={cn("border-b border-outline-variant px-4 py-3 last:border-0", !n.read && "bg-primary-fixed/30")}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-text-muted mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-1.5">
            <div className="h-7 w-7 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="text-xs">
              <p className="font-semibold leading-tight">{role}</p>
              <p className="text-text-muted truncate max-w-[120px]">{adminEmail}</p>
            </div>
          </div>
        </header>

        {/* Sky-blue prototype banner */}
        <div className="bg-primary text-white text-center text-xs py-1.5 font-medium flex items-center justify-center gap-2 shrink-0">
          <MaterialIcon name="science" size={14} />
          SehatVaani Admin — UI prototype with mock data for team review
        </div>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col gap-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
