"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchLeads, createLead, updateLeadStatus, deleteLead, ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Lead, LeadCreatePayload, LeadStatus } from "@/types/lead";
import Sidebar from "@/components/Sidebar";
import LeadsTable from "@/components/LeadsTable";
import AddLeadModal from "@/components/AddLeadModal";

export default function LeadsPage() {
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
      setError(err instanceof Error ? err.message : "Could not load CRM leads");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload: LeadCreatePayload) {
    const lead = await createLead(payload);
    setLeads((prev) => [lead, ...prev]);
  }

  async function handleUpdateLead(id: number, payload: Partial<Lead>) {
    // Update local state with modified lead profile
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

  async function handleUpdateStatus(id: number, status: LeadStatus) {
    try {
      const updated = await updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
      } else {
        alert(err instanceof Error ? err.message : "Could not update status");
      }
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
      } else {
        alert(err instanceof Error ? err.message : "Could not delete lead");
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-void text-white">
      <Sidebar />

      <main className="flex-1 px-8 py-9 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white animate-fadeIn">
                CRM Pipeline
              </h1>
              <p className="mt-1.5 text-sm text-ash">
                Manage, follow-up, and track progress of your prospective leads.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-forge px-4.5 py-2.5 text-sm font-semibold text-void shadow-ember transition-opacity hover:opacity-90 active:scale-95"
            >
              + Create Lead
            </button>
          </div>

          {/* CRM Leads Table */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-surface-line border-t-forge" />
                <p className="text-xs text-ash select-none">Loading pipeline database...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-forge/20 bg-forge/5 px-5 py-4 text-sm text-forge">
                {error}
              </div>
            ) : (
              <LeadsTable
                leads={leads}
                onDelete={handleDelete}
                onUpdateStatus={handleUpdateStatus}
                onUpdateLead={handleUpdateLead}
              />
            )}
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
