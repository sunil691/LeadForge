"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchLeads, createLead, updateLeadStatus, deleteLead, ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Lead, LeadCreatePayload, LeadStatus } from "@/types/lead";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import AddLeadModal from "@/components/AddLeadModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload: LeadCreatePayload) {
    const lead = await createLead(payload);
    setLeads((prev) => [lead, ...prev]);
  }

  async function handleUpdateLead(id: number, payload: Partial<Lead>) {
    // Local updates
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...payload };
          return updated;
        }
        return l;
      })
    );
  }

  async function handleAdvance(id: number, status: LeadStatus) {
    try {
      const updated = await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.replace("/login");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.replace("/login");
    }
  }

  // Statistics calculation
  const stats = useMemo(() => {
    const total = leads.length;

    // Generated Today
    const today = new Date().toDateString();
    const todayCount = leads.filter(
      (l) => new Date(l.created_at).toDateString() === today
    ).length;

    // Qualified: qualified, proposal_sent, closed_won
    const qualifiedCount = leads.filter(
      (l) =>
        l.status === "qualified" ||
        l.status === "proposal_sent" ||
        l.status === "closed_won"
    ).length;

    // Converted: closed_won or converted
    const convertedCount = leads.filter(
      (l) => l.status === "closed_won" || l.status === "qualified" // qualified/won
    ).length;

    const rate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;

    return { total, todayCount, qualifiedCount, rate };
  }, [leads]);

  // Lead Sources Data for Donut Chart
  const sourceChartData = useMemo(() => {
    const sourcesCount: Record<string, number> = {
      "Google Maps": 0,
      "Website": 0,
      "Manual": 0,
    };

    leads.forEach((l) => {
      const src = l.source || "Manual";
      if (src.toLowerCase().includes("maps") || src.toLowerCase().includes("google")) {
        sourcesCount["Google Maps"] += 1;
      } else if (src.toLowerCase().includes("web") || src.toLowerCase().includes("site")) {
        sourcesCount["Website"] += 1;
      } else {
        sourcesCount["Manual"] += 1;
      }
    });

    return [
      { name: "Google Maps", value: sourcesCount["Google Maps"] },
      { name: "Website", value: sourcesCount["Website"] },
      { name: "Manual", value: sourcesCount["Manual"] },
    ].filter((d) => d.value > 0);
  }, [leads]);

  const COLORS = ["#FF6B2C", "#5B8AA6", "#FFA07A"];

  // Funnel calculations
  const funnelData = useMemo(() => {
    const total = leads.length || 1;
    const newCount = leads.filter((l) => l.status === "new").length;
    const contactedCount = leads.filter((l) => l.status === "contacted").length;
    const qualifiedCount = leads.filter(
      (l) => l.status === "qualified" || l.status === "proposal_sent"
    ).length;
    const convertedCount = leads.filter(
      (l) => l.status === "closed_won" || l.status === "closed_lost"
    ).length;

    return [
      { label: "New", count: newCount, pct: Math.round((newCount / total) * 100), color: "bg-forge" },
      { label: "Contacted", count: contactedCount, pct: Math.round((contactedCount / total) * 100), color: "bg-amber-400" },
      { label: "Qualified", count: qualifiedCount, pct: Math.round((qualifiedCount / total) * 100), color: "bg-teal-400" },
      { label: "Converted", count: convertedCount, pct: Math.round((convertedCount / total) * 100), color: "bg-emerald-400" },
    ];
  }, [leads]);

  // Top 5 recent leads
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [leads]);

  return (
    <div className="flex min-h-screen bg-void text-white">
      <Sidebar />

      <main className="flex-1 px-8 py-9 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                Dashboard
              </h1>
              <p className="mt-1.5 text-sm text-ash">
                Welcome back. Here is your LeadForge AI pipeline status.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-forge px-4.5 py-2.5 text-sm font-semibold text-void shadow-ember transition-opacity hover:opacity-90 active:scale-95"
            >
              + Add Lead
            </button>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-riseIn">
            <StatCard label="Total Leads" value={stats.total} accent="warm" />
            <StatCard label="Generated Today" value={stats.todayCount} accent="forge" />
            <StatCard label="Qualified Leads" value={stats.qualifiedCount} accent="steel" />
            <StatCard label="Conversion Rate" value={stats.rate} suffix="%" accent="warm" />
          </div>

          {/* Visualizations Row */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Lead Sources Pie Chart */}
            <div className="rounded-xl border border-surface-line bg-surface p-6">
              <h2 className="text-base font-semibold text-white mb-4">Lead Sources</h2>
              <div className="h-[220px] flex items-center justify-center">
                {sourceChartData.length === 0 ? (
                  <p className="text-sm text-ash">No sources data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E2025",
                          borderColor: "#25272C",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Lead Funnel Progress */}
            <div className="rounded-xl border border-surface-line bg-surface p-6">
              <h2 className="text-base font-semibold text-white mb-4">Lead Funnel</h2>
              <div className="space-y-4">
                {funnelData.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-ash">{item.label}</span>
                      <span className="text-white">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${Math.max(item.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leads Table */}
          <div className="mt-8 rounded-xl border border-surface-line bg-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Leads</h2>
              <button
                onClick={() => router.push("/leads")}
                className="text-xs font-semibold text-forge hover:underline"
              >
                View all leads →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-line text-xs font-medium text-ash">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 px-4">Business</th>
                    <th className="pb-3 px-4">Phone</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-line/50">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-ash text-sm">
                        No leads created yet. Get started by adding a lead!
                      </td>
                    </tr>
                  ) : (
                    recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-surface-raised/20 transition-colors">
                        <td className="py-3.5 pr-4">
                          <button
                            onClick={() => router.push(`/leads/${lead.id}`)}
                            className="font-medium text-white hover:text-forge hover:underline text-left"
                          >
                            {lead.name}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-white/95">
                          {lead.company || <span className="text-ash/60 italic">N/A</span>}
                        </td>
                        <td className="py-3.5 px-4 text-ash">
                          {lead.phone || <span className="text-ash/60 italic">—</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="py-3.5 pl-4 text-right text-xs text-ash font-mono">
                          {new Date(lead.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      <AddLeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
