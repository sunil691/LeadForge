import { LeadStatus } from "@/types/lead";

const CONFIG: Record<
  LeadStatus,
  { label: string; dot: string; text: string; glow: boolean; border: string }
> = {
  new: {
    label: "New",
    dot: "bg-forge",
    text: "text-forge",
    glow: true,
    border: "border-forge/30 bg-forge/5",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-amber-400",
    text: "text-amber-400",
    glow: false,
    border: "border-amber-400/30 bg-amber-400/5",
  },
  qualified: {
    label: "Qualified",
    dot: "bg-teal-400",
    text: "text-teal-400",
    glow: true,
    border: "border-teal-400/30 bg-teal-400/5",
  },
  proposal_sent: {
    label: "Proposal Sent",
    dot: "bg-sky-400",
    text: "text-sky-400",
    glow: false,
    border: "border-sky-400/30 bg-sky-400/5",
  },
  closed_won: {
    label: "Closed Won",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    glow: true,
    border: "border-emerald-400/30 bg-emerald-400/5",
  },
  closed_lost: {
    label: "Closed Lost",
    dot: "bg-rose-500",
    text: "text-rose-500",
    glow: false,
    border: "border-rose-500/30 bg-rose-500/5",
  },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const c = CONFIG[status || "new"] || CONFIG.new;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} px-2.5 py-0.5 text-xs font-semibold ${c.text} backdrop-blur-sm`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${c.dot} ${c.glow ? "animate-pulseGlow" : ""}`}
      />
      {c.label}
    </span>
  );
}
