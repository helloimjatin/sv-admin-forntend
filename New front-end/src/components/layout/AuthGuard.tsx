"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function AuthGuard({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, role } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
    else if (roles && !roles.includes(role)) router.replace("/dashboard");
  }, [isAuthenticated, role, roles, router]);

  if (!isAuthenticated) return null;
  if (roles && !roles.includes(role)) return null;
  return <>{children}</>;
}
