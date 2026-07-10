"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const faqs = [
  { q: "How do I block a user?", a: "Go to Dashboard → find the user → click Block in the Actions column, or open their profile and use the Block button." },
  { q: "How do I view medical report analysis?", a: "Navigate to Medical Records → click View Analysis on any report to see biomarkers and AI clinical insights." },
  { q: "How do I manage subscriptions?", a: "Open Subscriptions from the sidebar to view, upgrade/downgrade, or cancel user subscription plans." },
  { q: "Who can access Staff Directory?", a: "Only Super Admin role can view and manage staff accounts." },
  { q: "How do I add a new user?", a: "Click the New Entry button in the sidebar, or use the Add New User form with a username." },
];

export default function HelpPage() {
  return (
    <AuthGuard>
      <DashboardLayout title="Help Center" subtitle="Guides and support for the admin console">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "menu_book", title: "Documentation", desc: "Admin panel user guide" },
            { icon: "support_agent", title: "Contact Support", desc: "support@sehatvaani.com" },
            { icon: "bug_report", title: "Report Issue", desc: "Submit a bug or feedback" },
          ].map((c) => (
            <div key={c.title} className="rounded-lg border border-outline-variant/50 bg-surface-card p-6 hover:shadow-md transition-shadow cursor-pointer">
              <MaterialIcon name={c.icon} size={28} className="text-primary mb-3" />
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-text-muted mt-1">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-outline-variant/50 bg-surface-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><MaterialIcon name="quiz" size={20} className="text-primary" /> Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-outline-variant/30 pb-4 last:border-0">
                <p className="font-semibold text-sm">{f.q}</p>
                <p className="text-sm text-text-muted mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
