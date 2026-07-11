"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LOGO_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Menu } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: "dashboard" },
  { label: "Users", href: "/users", icon: "manage_accounts" },
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
  fillHeight = false,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** When true, main does not scroll — children manage their own scroll/footer layout */
  fillHeight?: boolean;
}) {
  const pathname = usePathname();
  const { role, adminEmail, logout, sidebarOpen, setSidebarOpen } = useApp();
  const visibleNav = navItems.filter((item) => !item.roles || item.roles.includes(role));

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
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-outline-variant bg-surface-card/90 backdrop-blur-md px-4 py-3 lg:px-6 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-elevated" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          {(title || subtitle) && (
            <div className="flex-1 min-w-0 hidden sm:block">
              {title && <h1 className="text-base font-bold truncate">{title}</h1>}
              {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
            </div>
          )}
          {!title && <div className="flex-1" />}

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

        <div className="bg-primary text-white text-center text-xs py-1.5 font-medium flex items-center justify-center gap-2 shrink-0">
          <MaterialIcon name="science" size={14} />
          SehatVaani Admin — UI prototype with mock data for team review
        </div>

        <main
          className={cn(
            "flex-1 min-h-0",
            fillHeight ? "flex flex-col overflow-hidden" : "overflow-y-auto p-6 lg:p-8"
          )}
        >
          {fillHeight ? <div className="flex min-h-0 flex-1 flex-col">{children}</div> : children}
        </main>
      </div>
    </div>
  );
}
