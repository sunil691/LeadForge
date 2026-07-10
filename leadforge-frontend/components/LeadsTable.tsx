"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lead, LeadStatus } from "@/types/lead";
import StatusBadge from "./StatusBadge";
import AddLeadModal from "./AddLeadModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface LeadsTableProps {
  leads: Lead[];
  onDelete: (id: number) => void;
  onAdvance?: (id: number, status: LeadStatus) => void;
  onMarkLost?: (id: number) => void;
  onUpdateStatus?: (id: number, status: LeadStatus) => Promise<void>;
  onUpdateLead?: (id: number, payload: Partial<Lead>) => Promise<void>;
}

export default function LeadsTable({
  leads,
  onDelete,
  onAdvance,
  onMarkLost,
  onUpdateStatus,
  onUpdateLead,
}: LeadsTableProps) {
  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  // Sort States
  const [sortField, setSortField] = useState<keyof Lead | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination States
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal State
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Status values
  const statuses: { value: LeadStatus; label: string }[] = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal_sent", label: "Proposal Sent" },
    { value: "closed_won", label: "Closed Won" },
    { value: "closed_lost", label: "Closed Lost" },
  ];

  // Dynamic Sources list from leads
  const uniqueSources = useMemo(() => {
    const list = leads.map((l) => l.source).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [leads]);

  // Handle Sort
  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Process Filtered and Sorted Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          l.source.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      result = result.filter((l) => l.source === sourceFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (a[sortField] as number);
      }
    });

    return result;
  }, [leads, search, statusFilter, sourceFilter, sortField, sortOrder]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return processedLeads.slice(start, start + itemsPerPage);
  }, [processedLeads, page]);

  const totalPages = Math.ceil(processedLeads.length / itemsPerPage);

  // Status Change wrapper
  async function handleStatusChange(id: number, nextStatus: LeadStatus) {
    if (onUpdateStatus) {
      await onUpdateStatus(id, nextStatus);
    } else if (onAdvance) {
      // Compatibility with original dashboard
      onAdvance(id, nextStatus);
    }
  }

  // Export functions
  const handleExportExcel = () => {
    const data = processedLeads.map((l) => ({
      Name: l.name,
      Company: l.company || "",
      Email: l.email,
      Phone: l.phone || "",
      Website: l.website || "",
      Source: l.source,
      Status: l.status.toUpperCase(),
      "Created At": new Date(l.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(fileBlob, `LeadForgeAI_Leads_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Company", "Email", "Phone", "Website", "Source", "Status", "Created At"];
    const rows = processedLeads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.website || "").replace(/"/g, '""')}"`,
      `"${l.source.replace(/"/g, '""')}"`,
      `"${l.status.toUpperCase()}"`,
      `"${new Date(l.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const fileBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(fileBlob, `LeadForgeAI_Leads_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-surface p-4 rounded-xl border border-surface-line">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          {/* Search bar */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-ash"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-raised border border-surface-line rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-ash focus:outline-none focus:border-forge/50"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-raised border border-surface-line rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface-raised border border-surface-line rounded-lg px-3 py-2 text-sm text-white focus:outline-none capitalize"
          >
            <option value="all">All Sources</option>
            {uniqueSources.filter(s => s !== "all").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-surface-line bg-surface-raised px-3.5 py-2 text-xs font-semibold text-white hover:bg-surface-raised/80 hover:border-white/20 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-lg border border-surface-line bg-surface-raised px-3.5 py-2 text-xs font-semibold text-white hover:bg-surface-raised/80 hover:border-white/20 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="overflow-hidden rounded-xl border border-surface-line bg-surface">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="sticky top-0 bg-surface-raised border-b border-surface-line font-medium text-xs text-ash select-none z-10 shadow-sm">
                <th
                  onClick={() => handleSort("name")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Lead Name
                    {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("company")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Company
                    {sortField === "company" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th className="px-5 py-3.5">Contact info</th>
                <th
                  onClick={() => handleSort("source")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Source
                    {sortField === "source" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Created At
                    {sortField === "created_at" && (sortOrder === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line/40">
              <AnimatePresence initial={false}>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-ash">
                      No leads match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.01 }}
                      className="group bg-surface hover:bg-surface-raised/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => (window.location.href = `/leads/${lead.id}`)}
                          className="font-medium text-white hover:text-forge hover:underline text-left"
                        >
                          {lead.name}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-white/90">
                        {lead.company || <span className="text-ash/60 italic">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-ash">
                        <div className="text-xs">{lead.email}</div>
                        {lead.phone && <div className="text-[10px] mt-0.5">{lead.phone}</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block bg-surface-raised border border-surface-line/80 px-2 py-0.5 rounded text-xs text-ash/90">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="bg-transparent border-0 text-xs font-semibold focus:ring-0 focus:outline-none p-0 cursor-pointer"
                        >
                          {statuses.map((s) => (
                            <option key={s.value} value={s.value} className="bg-surface text-white">
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1">
                          <StatusBadge status={lead.status} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-ash font-mono">
                        {new Date(lead.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => (window.location.href = `/leads/${lead.id}`)}
                            title="View Detail Workspace"
                            className="p-1 rounded text-ash hover:text-white hover:bg-surface-raised transition-all"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingLead(lead)}
                            title="Edit profile"
                            className="p-1 rounded text-ash hover:text-forge hover:bg-surface-raised transition-all"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.83a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${lead.name}?`)) {
                                onDelete(lead.id);
                              }
                            }}
                            title="Delete permanently"
                            className="p-1 rounded text-ash hover:text-rose-500 hover:bg-surface-raised transition-all"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-line px-5 py-4 select-none">
            <span className="text-xs text-ash">
              Showing <span className="text-white">{(page - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="text-white">
                {Math.min(page * itemsPerPage, processedLeads.length)}
              </span>{" "}
              of <span className="text-white">{processedLeads.length}</span> leads
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border border-surface-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-surface-raised/85 disabled:opacity-40 disabled:hover:bg-surface-raised"
              >
                ◀ Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded border border-surface-line bg-surface-raised px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-surface-raised/85 disabled:opacity-40 disabled:hover:bg-surface-raised"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Lead Modal Instance */}
      <AddLeadModal
        open={editingLead !== null}
        onClose={() => setEditingLead(null)}
        onUpdate={onUpdateLead}
        lead={editingLead}
      />
    </div>
  );
}
