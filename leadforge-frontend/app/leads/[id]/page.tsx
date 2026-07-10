"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetchLeadById, updateLeadStatus } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Lead, LeadStatus } from "@/types/lead";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const leadId = Number(params.id);

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes and Status states
  const [notes, setNotes] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  async function loadLead() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeadById(leadId);
      setLead(data);
      setNotes(data.notes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load lead detail workspace");
    } finally {
      setLoading(false);
    }
  }

  // Update Status wrapper
  async function handleStatusChange(nextStatus: LeadStatus) {
    if (!lead) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateLeadStatus(lead.id, nextStatus);
      setLead(updated);
    } catch (err) {
      alert("Could not update lead status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Save Note details (in-memory only — persists until page reload)
  async function handleSaveNote() {
    if (!lead) return;
    setSavingNote(true);
    try {
      setLead({
        ...lead,
        notes,
      });
    } catch (err) {
      alert("Could not save notes");
    } finally {
      setSavingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-void text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-surface-line border-t-forge" />
          <p className="text-xs text-ash">Loading lead profiles...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex min-h-screen bg-void text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="rounded-xl border border-forge/20 bg-forge/5 px-6 py-5 text-center max-w-md">
            <h2 className="font-semibold text-forge text-lg mb-2">Workspace Error</h2>
            <p className="text-sm text-ash mb-4">{error || "This lead does not exist or has been deleted."}</p>
            <button
              onClick={() => router.push("/leads")}
              className="rounded-lg bg-surface-raised border border-surface-line px-4 py-2 text-xs font-semibold hover:text-white hover:bg-surface-raised/80 transition-colors"
            >
              ← Back to CRM Pipeline
            </button>
          </div>
        </div>
      </div>
    );
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
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2.5 text-xs text-ash select-none">
            <button onClick={() => router.push("/leads")} className="hover:text-white transition-colors">
              CRM Pipeline
            </button>
            <span>/</span>
            <span className="text-white font-medium">{lead.name}</span>
          </div>

          {/* Header and Quick Status Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-surface-line pb-6">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                {lead.name}
              </h1>
              <p className="mt-1 text-sm text-ash">
                {lead.company ? `${lead.company} — ` : ""}Captured via {lead.source}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-surface border border-surface-line px-3 py-1.5 rounded-lg">
                <span className="text-xs text-ash font-medium">Pipeline Status:</span>
                <select
                  value={lead.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="bg-transparent border-0 text-xs font-bold text-white focus:ring-0 focus:outline-none p-0 cursor-pointer disabled:opacity-40"
                >
                  <option value="new" className="bg-surface text-white">New</option>
                  <option value="contacted" className="bg-surface text-white">Contacted</option>
                  <option value="qualified" className="bg-surface text-white">Qualified</option>
                  <option value="proposal_sent" className="bg-surface text-white">Proposal Sent</option>
                  <option value="closed_won" className="bg-surface text-white">Closed Won</option>
                  <option value="closed_lost" className="bg-surface text-white">Closed Lost</option>
                </select>
              </div>
              <StatusBadge status={lead.status} />
            </div>
          </div>

          {/* Details split panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Metadata cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Info Card */}
              <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
                <h2 className="text-xs font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                  Contact Details
                </h2>
                
                <div className="space-y-3">
                  <ProfileField label="Contact Person" value={lead.name} />
                  <ProfileField label="Email Address" value={lead.email} isEmail />
                  <ProfileField label="Phone number" value={lead.phone || "—"} />
                  <ProfileField label="Website URL" value={lead.website || "—"} isLink />
                </div>
              </div>

              {/* Business Info Card */}
              <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
                <h2 className="text-xs font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                  Business Information
                </h2>
                
                <div className="space-y-3">
                  <ProfileField label="Company / Entity" value={lead.company || "—"} />
                  <ProfileField label="Physical Address" value={lead.address || "—"} />
                  {lead.maps_url && (
                    <ProfileField
                      label="Google Maps URL"
                      value="View on Google Maps ↗"
                      href={lead.maps_url}
                      isLink
                    />
                  )}
                  <ProfileField
                    label="Lead Score / Rating"
                    value={lead.rating ? `★ ${lead.rating} / 5.0` : "—"}
                    accentClass="text-yellow-400 font-semibold"
                  />
                  <ProfileField label="Lead Source" value={lead.source} />
                </div>
              </div>
            </div>

            {/* Right Column: Timeline & Notes Workspace */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Notes Workspace */}
              <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-line pb-2.5">
                  <h2 className="text-xs font-bold tracking-wide uppercase text-ash">
                    CRM Workspace Notes
                  </h2>
                  <button
                    disabled={savingNote}
                    onClick={handleSaveNote}
                    className="rounded bg-forge px-3.5 py-1 text-xs font-bold text-void shadow-ember transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {savingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record customer communications, logs, follow-up timelines..."
                  className="w-full min-h-[140px] bg-surface-raised border border-surface-line rounded-lg p-3 text-sm text-white placeholder-ash/50 focus:outline-none focus:border-forge/50 leading-relaxed"
                />
              </div>

              {/* Activity Timeline Card */}
              <div className="rounded-xl border border-surface-line bg-surface p-5 space-y-4">
                <h2 className="text-xs font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                  Activity Timeline
                </h2>
                
                {lead.timeline && lead.timeline.length > 0 ? (
                  <div className="relative pl-5 border-l border-surface-line space-y-5">
                    {lead.timeline.map((event, index) => (
                      <div key={index} className="relative">
                        {/* Timeline dot */}
                        <span className="absolute -left-[26px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-surface-line border-2 border-forge" />
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-sm font-semibold text-white">{event.label}</span>
                          <span className="text-[10px] text-ash font-mono">
                            {new Date(event.date).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-ash mt-0.5 capitalize">
                          Event Type: {event.type.replace("_", " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ash/60 italic py-4 text-center">No activity recorded yet.</p>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  isEmail?: boolean;
  isLink?: boolean;
  href?: string;
  accentClass?: string;
}

function ProfileField({ label, value, isEmail, isLink, href, accentClass }: ProfileFieldProps) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-wider text-ash/80">
        {label}
      </span>
      <div className={`mt-0.5 text-sm ${accentClass || "text-white/90"}`}>
        {isEmail && value !== "—" ? (
          <a href={`mailto:${value}`} className="text-forge hover:underline">
            {value}
          </a>
        ) : isLink && value !== "—" ? (
          <a
            href={href || value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forge hover:underline truncate max-w-full block"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
