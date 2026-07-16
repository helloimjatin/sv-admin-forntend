"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard, Badge, FilterPills, SearchBar, DataTable, TableCard } from "@/components/ui/Primitives";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { users, dashboardStats, activityFeed, chartData } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { toggleUserBlock } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import {
  Users, UserCheck, Crown, User, UserPlus, FileText, Bot, IndianRupee,
  AlertTriangle, HeartPulse, TrendingUp, Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-text mb-2">Welcome to SehatVaani Admin</h1>
          <p className="text-sm text-text-muted">Manage your users, plans, static pages, and system events from the left sidebar.</p>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
