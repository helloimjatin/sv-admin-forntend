"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_CREDENTIALS } from "@/data/mockData";
import { LOGO_URL } from "@/lib/constants";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const FEATURES = [
  "Real-time analytics & activity feed",
  "Command palette quick search (⌘K)",
  "Dark mode & responsive design",
  "Full user profile management",
];

export default function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (login(email, password)) router.push("/dashboard");
      else setError("Invalid email or password.");
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — sky-blue branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Image src={LOGO_URL} alt="SehatVaani" width={140} height={48} className="h-12 w-auto brightness-0 invert" unoptimized priority />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            SehatVaani Admin<br />
            <span className="text-sky-100">Healthcare Management Console</span>
          </h1>
          <p className="text-sky-100 text-lg max-w-md leading-relaxed">
            Manage patients, subscriptions, billing, and medical records from one unified dashboard.
          </p>
        </div>
        <div className="space-y-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-3 text-sky-50">
              <MaterialIcon name="check_circle" size={18} className="text-sky-200" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
        <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-white/10" />
      </div>

      {/* Right — login form (original style) */}
      <div className="flex flex-1 items-center justify-center p-6 bg-secondary-fixed">
        <main className="w-full max-w-md bg-surface-card border border-outline-variant rounded-lg p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
          <header className="flex flex-col items-center text-center gap-3 lg:hidden">
            <Image src={LOGO_URL} alt="SehatVaani Logo" width={160} height={64} className="h-16 w-auto object-contain" unoptimized />
          </header>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted text-center">Admin Console</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-center text-sm font-bold">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-text" htmlFor="email">Email</label>
              <div className="relative mt-1">
                <MaterialIcon name="mail" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded focus:outline-none focus:border-primary text-sm bg-surface-card" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-text" htmlFor="password">Password</label>
                <button type="button" className="text-xs text-primary font-semibold hover:underline" onClick={() => setError("Contact your Super Admin to reset the password.")}>Forgot password?</button>
              </div>
              <div className="relative mt-1">
                <MaterialIcon name="lock" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2 border border-outline-variant rounded focus:outline-none focus:border-primary text-sm bg-surface-card" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-label={showPass ? "Hide password" : "Show password"}>
                  <MaterialIcon name={showPass ? "visibility" : "visibility_off"} size={20} />
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" className="rounded border-outline-variant" defaultChecked /> Remember me
            </label>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              {loading ? "Signing in..." : <>Sign In <MaterialIcon name="arrow_forward" size={20} /></>}
            </button>
          </form>

          <details className="text-xs text-text-muted border border-outline-variant/50 rounded-lg p-3">
            <summary className="cursor-pointer font-semibold text-primary">Demo credentials</summary>
            <p className="mt-2">Super Admin: {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}</p>
            <p>Admin: rajesh@sehatvaani.com / admin123</p>
          </details>

          <footer className="pt-2 border-t border-outline-variant text-center">
            <p className="text-xs text-text-muted flex items-center justify-center gap-1">
              <MaterialIcon name="verified_user" size={16} /> Secure Medical Grade Authentication
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
