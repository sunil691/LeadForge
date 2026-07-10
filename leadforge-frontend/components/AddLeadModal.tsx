"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lead, LeadCreatePayload, LeadStatus } from "@/types/lead";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreate?: (payload: LeadCreatePayload) => Promise<void>;
  onUpdate?: (id: number, payload: Partial<Lead>) => Promise<void>;
  lead?: Lead | null;
}

export default function AddLeadModal({ open, onClose, onCreate, onUpdate, lead }: AddLeadModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    status: "new" as LeadStatus,
    company: "",
    website: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source || "",
        status: lead.status || "new",
        company: lead.company || "",
        website: lead.website || "",
        address: lead.address || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "new",
        company: "",
        website: "",
        address: "",
      });
    }
    setError(null);
  }, [lead, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (lead) {
        // Edit mode
        if (onUpdate) {
          await onUpdate(lead.id, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            source: form.source,
            status: form.status,
          });
        }
      } else {
        // Create mode
        if (onCreate) {
          await onCreate({
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            source: form.source,
            status: form.status,
          });
        }
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-md px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-surface-line bg-surface p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-surface-line pb-4">
              <h2 className="font-display text-xl font-semibold text-white">
                {lead ? "Edit Lead Profile" : "Create New Lead"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-ash hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Priya Sharma"
                  />
                </Field>
                <Field label="Email Address">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="priya@company.com"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Phone number">
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Lead Source">
                  <input
                    required
                    value={form.source}
                    onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="input-field"
                    placeholder="Google Maps, Website, Manual, etc."
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Lead Status">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                    className="input-field select-field"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </Field>
                <Field label="Company / Business Name">
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="input-field"
                    placeholder="Priya Tech Solutions"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Website URL">
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="input-field"
                    placeholder="https://priyatech.com"
                  />
                </Field>
                <Field label="Physical Address">
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="input-field"
                    placeholder="Andheri East, Mumbai, MH"
                  />
                </Field>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-forge font-medium">{error}</p>}

            <div className="mt-6 flex justify-end gap-3 border-t border-surface-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-ash transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-forge px-5 py-2.5 text-sm font-semibold text-void transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Saving..." : lead ? "Save Changes" : "Create Lead"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ash">
        {label}
      </span>
      {children}
    </label>
  );
}
