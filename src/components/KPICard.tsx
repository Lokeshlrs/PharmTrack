import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: "teal" | "blue" | "rose" | "amber" | "emerald" | "violet";
  trend?: { value: number; label: string };
  onClick?: () => void;
}

const colorMap = {
  teal: { icon: "bg-teal-100 text-teal-600", border: "border-teal-100 hover:border-teal-300", accent: "text-teal-600" },
  blue: { icon: "bg-blue-100 text-blue-600", border: "border-blue-100 hover:border-blue-300", accent: "text-blue-600" },
  rose: { icon: "bg-rose-100 text-rose-600", border: "border-rose-100 hover:border-rose-300", accent: "text-rose-600" },
  amber: { icon: "bg-amber-100 text-amber-600", border: "border-amber-100 hover:border-amber-300", accent: "text-amber-600" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", border: "border-emerald-100 hover:border-emerald-300", accent: "text-emerald-600" },
  violet: { icon: "bg-violet-100 text-violet-600", border: "border-violet-100 hover:border-violet-300", accent: "text-violet-600" },
};

export default function KPICard({ label, value, sub, icon: Icon, color, trend, onClick }: KPICardProps) {
  const c = colorMap[color];
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${c.border} p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all ${onClick ? "cursor-pointer group" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </span>
          )}
          {onClick && <ArrowUpRight size={13} className={`${c.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className={`text-xs font-medium mt-1 ${c.accent}`}>{sub}</p>}
      </div>
    </div>
  );
}
