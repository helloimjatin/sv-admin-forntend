"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEMO_CREDENTIALS } from "@/data/mockData";

type AdminRole = "Super Admin" | "Admin" | "Support" | "Moderator";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

type AppContextValue = {
  isAuthenticated: boolean;
  authReady: boolean;
  role: AdminRole;
  adminEmail: string;
  darkMode: boolean;
  sidebarOpen: boolean;
  toasts: Toast[];
  notificationsOpen: boolean;
  commandOpen: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type?: Toast["type"]) => void;
  setNotificationsOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  refreshKey: number;
  bumpRefresh: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [role, setRole] = useState<AdminRole>("Super Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // UI prototype: never restore a session so testers always land on login
    localStorage.removeItem("sv-auth");
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("sv-theme");
    setAuthReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setRole("Super Admin");
      setAdminEmail(email);
      return true;
    }
    if (email === "rajesh@sehatvaani.com" && password === "admin123") {
      setIsAuthenticated(true);
      setRole("Admin");
      setAdminEmail(email);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setAdminEmail("");
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("sv-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo(
    () => ({
      isAuthenticated, authReady, role, adminEmail, darkMode, sidebarOpen, toasts,
      notificationsOpen, commandOpen, login, logout, toggleDarkMode,
      setSidebarOpen, addToast, setNotificationsOpen, setCommandOpen, refreshKey, bumpRefresh,
    }),
    [isAuthenticated, authReady, role, adminEmail, darkMode, sidebarOpen, toasts, notificationsOpen, commandOpen, login, logout, toggleDarkMode, addToast, refreshKey, bumpRefresh]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
