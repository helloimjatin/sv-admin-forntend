"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { LOGO_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Menu } from "lucide-react";

const navItems: { label: string; href: string; icon: string; roles?: string[] }[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "User Management", href: "/users", icon: "manage_accounts" },
  { label: "Subscription Management", href: "/subscriptions", icon: "card_membership" },
  { label: "Payment Management", href: "/billing", icon: "payments" },
  { label: "Notification Center", href: "/notifications", icon: "notifications" },
  { label: "Content Management", href: "/cms", icon: "article" },
  { label: "Settings", href: "/settings", icon: "settings" },
  { label: "Audit Logs", href: "/audit-logs", icon: "assignment" },
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

        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-outline-variant/40">
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-1.5 mb-2 bg-surface-card">
            <div className="h-7 w-7 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-xs font-bold shrink-0">
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold leading-tight truncate">{role}</p>
              <p className="text-text-muted truncate max-w-[150px]">{adminEmail}</p>
            </div>
          </div>
          <button onClick={logout} className="text-text-muted hover:bg-surface-elevated p-3 rounded-lg flex items-center gap-3 text-sm transition-all w-full text-left">
            <MaterialIcon name="logout" size={20} /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
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
