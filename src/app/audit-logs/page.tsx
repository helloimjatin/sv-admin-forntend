"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TableCard, DataTable, Badge } from "@/components/ui/Primitives";

export default function AuditLogsPage() {
  const [activeLogs] = useState([
    { timestamp: "2026-07-11 20:10:15", admin: "Super Admin (rajesh@sehatvaani.com)", action: "Blocked user #12 (Amit Kumar)", status: "Success" },
    { timestamp: "2026-07-11 19:45:22", admin: "Admin (nitin@sehatvaani.com)", action: "Created subscription plan 'Care Lite'", status: "Success" },
    { timestamp: "2026-07-11 18:30:11", admin: "Support (priya@sehatvaani.com)", action: "Reset password for user #5 (Karan Shah)", status: "Success" }
  ]);

  const [systemErrors] = useState([
    { timestamp: "2026-07-11 15:42:01", component: "PushNotifier", message: "Failed to dispatch APNS packet to token APNS-884A", severity: "High" },
    { timestamp: "2026-07-11 14:15:33", component: "BillingEngine", message: "Webhook signature verification failed from IP 184.22.110.12", severity: "Medium" }
  ]);

  const [apiErrors] = useState([
    { timestamp: "2026-07-11 20:05:00", endpoint: "POST /api/v1/auth/otp", message: "Rate limit exceeded (10 requests/min)", client: "Android App v2.4.1" },
    { timestamp: "2026-07-11 19:22:10", endpoint: "GET /api/v1/health/summary", message: "Invalid access token provided", client: "iOS App v2.4.0" }
  ]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-xl font-bold">Audit Logs</h1>

          <TableCard title="Admin Activity Logs">
            <DataTable headers={["Timestamp", "Admin Account", "Action Performed", "Status"]}>
              {activeLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-text-muted">{log.timestamp}</td>
                  <td className="p-4 font-semibold">{log.admin}</td>
                  <td className="p-4">{log.action}</td>
                  <td className="p-4"><Badge variant="success">{log.status}</Badge></td>
                </tr>
              ))}
            </DataTable>
          </TableCard>

          <TableCard title="System Error Logs">
            <DataTable headers={["Timestamp", "Component", "Error Message", "Severity"]}>
              {systemErrors.map((err, idx) => (
                <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-text-muted">{err.timestamp}</td>
                  <td className="p-4 font-semibold text-primary">{err.component}</td>
                  <td className="p-4">{err.message}</td>
                  <td className="p-4">
                    <Badge variant={err.severity === "High" ? "danger" : "warning"}>{err.severity}</Badge>
                  </td>
                </tr>
              ))}
            </DataTable>
          </TableCard>

          <TableCard title="API Error Logs">
            <DataTable headers={["Timestamp", "API Endpoint", "Error Description", "Client Application"]}>
              {apiErrors.map((err, idx) => (
                <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-low h-12">
                  <td className="p-4 font-mono text-xs text-text-muted">{err.timestamp}</td>
                  <td className="p-4 font-semibold text-primary">{err.endpoint}</td>
                  <td className="p-4 text-red-600">{err.message}</td>
                  <td className="p-4 text-xs text-text-muted">{err.client}</td>
                </tr>
              ))}
            </DataTable>
          </TableCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
