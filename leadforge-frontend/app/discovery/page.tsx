"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { generateLeads, createLead } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface DiscoveryLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  rating: number;
  source: string;
  saved: boolean;
  saving?: boolean;
}

export default function LeadDiscoveryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Search Panel States
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [leadCount, setLeadCount] = useState(25);
  
  // Filters
  const [webRequired, setWebRequired] = useState(false);
  const [phoneRequired, setPhoneRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [ratingAbove4, setRatingAbove4] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  // Statuses
  const [generating, setGenerating] = useState(false);
  const [leads, setLeads] = useState<DiscoveryLead[]>([]);
  const [globalSaving, setGlobalSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  // Clear all filters & inputs
  const handleClear = () => {
    setBusinessType("");
    setLocation("");
    setLeadCount(25);
    setWebRequired(false);
    setPhoneRequired(false);
    setEmailRequired(false);
    setRatingAbove4(false);
    setOpenNow(false);
    setLeads([]);
  };

  // Trigger Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !location) return;

    setGenerating(true);
    setLeads([]);

    try {
      const apiLeads = await generateLeads({
        keyword: businessType,
        location: location,
        limit: leadCount
      });

      if (apiLeads && apiLeads.length > 0) {
        const mapped = apiLeads.map((l: any, i: number) => ({
          id: `disc_api_${i}_${Date.now()}`,
          name: l.name || "",
          company: l.company || l.name || "",
          email: l.email || "",
          phone: l.phone || "",
          website: l.website || "",
          address: l.address || "",
          rating: l.rating || 0,
          source: l.source || "Web Scraper",
          saved: false
        }));
        setLeads(mapped);
      }
      // If no results, leads stays empty — UI shows empty state
    } catch (err) {
      // API error — leads stays empty, UI shows empty state
      console.error("Lead generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  // Save lead in backend DB
  const handleSaveLead = async (lead: DiscoveryLead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, saving: true } : l));
    try {
      await createLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || undefined,
        source: `Discovery: ${businessType} in ${location}`,
        status: "new"
      });

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, saved: true, saving: false } : l));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save lead");
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, saving: false } : l));
    }
  };

  // Save all leads sequentially
  const handleSaveAll = async () => {
    const unsaved = leads.filter(l => !l.saved);
    if (unsaved.length === 0) return;

    setGlobalSaving(true);
    for (const lead of unsaved) {
      await handleSaveLead(lead);
    }
    setGlobalSaving(false);
  };

  // Export functions
  const exportCSV = () => {
    const headers = ["Business Name", "Contact Person", "Email", "Phone", "Website", "Address", "Rating", "Source"];
    const rows = leads.map(l => [
      `"${l.company.replace(/"/g, '""')}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${l.website.replace(/"/g, '""')}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      l.rating,
      `"${l.source}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Discovered_Leads_${businessType}_${location}.csv`);
  };

  const exportExcel = () => {
    const data = leads.map(l => ({
      "Business Name": l.company,
      "Contact Person": l.name,
      Email: l.email,
      Phone: l.phone,
      Website: l.website,
      Address: l.address,
      Rating: l.rating,
      Source: l.source
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Discovered");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(fileBlob, `Discovered_Leads_${businessType}_${location}.xlsx`);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-void text-white">
      <Sidebar />

      <main className="flex-1 px-8 py-9 overflow-y-auto max-h-screen">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Lead Discovery</h1>
            <p className="mt-1.5 text-sm text-ash">
              Search, extract, and convert business listings into active pipeline leads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Search Filter Panel */}
            <form onSubmit={handleGenerate} className="lg:col-span-4 bg-surface border border-surface-line rounded-xl p-5 space-y-5">
              <h2 className="text-sm font-bold tracking-wide uppercase text-ash border-b border-surface-line pb-2.5">
                Search Configuration
              </h2>

              <div className="space-y-4">
                {/* Business Type */}
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Business Type</span>
                  <input
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Web Design, Cafe, Gym..."
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/60 focus:outline-none focus:border-forge/50"
                  />
                </label>

                {/* Location */}
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Location</span>
                  <input
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Noida, Bandra, Delhi..."
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-ash/60 focus:outline-none focus:border-forge/50"
                  />
                </label>

                {/* Lead Count */}
                <label className="block">
                  <span className="block text-xs font-semibold text-ash mb-1.5">Lead Limit</span>
                  <select
                    value={leadCount}
                    onChange={(e) => setLeadCount(Number(e.target.value))}
                    className="w-full bg-surface-raised border border-surface-line rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-forge/50"
                  >
                    <option value={10}>10 Leads</option>
                    <option value={25}>25 Leads</option>
                    <option value={50}>50 Leads</option>
                    <option value={100}>100 Leads</option>
                    <option value={250}>250 Leads</option>
                    <option value={500}>500 Leads</option>
                  </select>
                </label>

                {/* Filters */}
                <div className="space-y-2.5 pt-2 border-t border-surface-line/70">
                  <span className="block text-xs font-semibold text-ash">Pre-scrapers Filters</span>
                  
                  <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webRequired}
                      onChange={(e) => setWebRequired(e.target.checked)}
                      className="rounded border-surface-line bg-surface-raised text-forge focus:ring-0"
                    />
                    Website Required
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phoneRequired}
                      onChange={(e) => setPhoneRequired(e.target.checked)}
                      className="rounded border-surface-line bg-surface-raised text-forge focus:ring-0"
                    />
                    Phone Required
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailRequired}
                      onChange={(e) => setEmailRequired(e.target.checked)}
                      className="rounded border-surface-line bg-surface-raised text-forge focus:ring-0"
                    />
                    Email Required
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ratingAbove4}
                      onChange={(e) => setRatingAbove4(e.target.checked)}
                      className="rounded border-surface-line bg-surface-raised text-forge focus:ring-0"
                    />
                    Rating Above 4.0
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-white/90 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e) => setOpenNow(e.target.checked)}
                      className="rounded border-surface-line bg-surface-raised text-forge focus:ring-0"
                    />
                    Open Now
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-surface-line">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 rounded-lg border border-surface-line bg-surface-raised/40 py-2.5 text-sm font-semibold text-ash hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-2 rounded-lg bg-forge px-4 py-2.5 text-sm font-bold text-void shadow-ember transition-opacity hover:opacity-90 disabled:opacity-55 active:scale-[0.98]"
                >
                  {generating ? "Scanning..." : "Generate"}
                </button>
              </div>
            </form>

            {/* Results Grid Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-surface-line">
                <h3 className="text-sm font-semibold text-white">
                  Generated Results {leads.length > 0 && `(${leads.length})`}
                </h3>

                {leads.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportCSV}
                      className="rounded border border-surface-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-white hover:bg-surface-raised/80 transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={exportExcel}
                      className="rounded border border-surface-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-white hover:bg-surface-raised/80 transition-colors"
                    >
                      Export Excel
                    </button>
                    <button
                      disabled={globalSaving}
                      onClick={handleSaveAll}
                      className="rounded bg-forge px-3.5 py-1.5 text-xs font-bold text-void shadow-ember hover:opacity-90 transition-opacity"
                    >
                      {globalSaving ? "Saving..." : "Save All"}
                    </button>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="border border-surface-line rounded-xl bg-surface overflow-hidden">
                <div className="overflow-x-auto min-h-[350px]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-surface-line bg-surface-raised text-xs font-medium text-ash">
                        <th className="px-5 py-3">Business Name</th>
                        <th className="px-5 py-3">Phone</th>
                        <th className="px-5 py-3">Website</th>
                        <th className="px-5 py-3">Address</th>
                        <th className="px-5 py-3">Rating</th>
                        <th className="px-5 py-3">Source</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-line/50">
                      {generating ? (
                        // Skeletons
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr key={idx} className="animate-pulse">
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-3/4" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-2/3" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-1/2" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-5/6" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-1/4" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-surface-raised rounded w-1/3" /></td>
                            <td className="px-5 py-4 text-right"><div className="h-8 bg-surface-raised rounded w-16 ml-auto" /></td>
                          </tr>
                        ))
                      ) : leads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-24 text-center text-ash">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                              <svg className="h-10 w-10 text-ash/40 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                              </svg>
                              <p className="font-semibold text-white">No scraped leads found</p>
                              <p className="text-xs text-ash/80 mt-1">
                                Enter a business type and location on the left, then click Generate to scan the web.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-surface-raised/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-white">{lead.company}</div>
                              <div className="text-[10px] text-ash mt-0.5">{lead.name}</div>
                            </td>
                            <td className="px-5 py-3.5 text-ash text-xs">
                              {lead.phone || <span className="text-ash/50">—</span>}
                            </td>
                            <td className="px-5 py-3.5 text-forge text-xs">
                              {lead.website ? (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline truncate max-w-[120px] block"
                                >
                                  {lead.website.replace("https://www.", "")}
                                </a>
                              ) : (
                                <span className="text-ash/50">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-ash text-xs truncate max-w-[180px]" title={lead.address}>
                              {lead.address}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
                                ★ <span>{lead.rating}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] bg-surface-raised border border-surface-line px-1.5 py-0.5 rounded text-ash">
                                {lead.source}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {lead.saved ? (
                                <span className="text-xs font-semibold text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 rounded-md">
                                  Saved ✓
                                </span>
                              ) : (
                                <button
                                  disabled={lead.saving}
                                  onClick={() => handleSaveLead(lead)}
                                  className="rounded bg-forge px-3 py-1.5 text-xs font-bold text-void shadow-ember hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                  {lead.saving ? "Saving..." : "Save Lead"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
