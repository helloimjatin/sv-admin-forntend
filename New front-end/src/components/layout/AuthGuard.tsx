"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function AuthGuard({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, authReady, role } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) router.replace("/");
    else if (roles && !roles.includes(role)) router.replace("/dashboard");
  }, [authReady, isAuthenticated, role, roles, router]);

  if (!authReady || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    );
  }
  if (roles && !roles.includes(role)) return null;
  return <>{children}</>;
}
