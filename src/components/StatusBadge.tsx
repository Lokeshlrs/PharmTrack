interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Healthy: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Low Stock": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Critical: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  Overstocked: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  "Expiring Soon": { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
  Expired: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  Safe: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "Order Placed": { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  Approved: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Packed: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  Dispatched: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  "In Transit": { bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  Arrived: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  Received: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Sourcing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Fulfilled: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Active: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  Investigating: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const padClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium font-sans ${cfg.bg} ${cfg.text} ${padClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
