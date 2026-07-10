interface StatCardProps {
  label: string;
  value: string | number;
  accent?: "forge" | "steel" | "warm";
  suffix?: string;
}

const ACCENTS: Record<string, string> = {
  forge: "text-forge",
  steel: "text-steel",
  warm: "text-warm",
};

export default function StatCard({ label, value, accent = "warm", suffix }: StatCardProps) {
  return (
    <div className="rounded-xl border border-surface-line bg-surface px-6 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">{label}</p>
      <p className={`mt-2 font-display text-3xl font-medium ${ACCENTS[accent]}`}>
        {value}
        {suffix && <span className="ml-1 text-base font-mono text-ash">{suffix}</span>}
      </p>
    </div>
  );
}
