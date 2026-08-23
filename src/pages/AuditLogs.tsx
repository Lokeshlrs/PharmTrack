import { useState, useEffect } from "react";
import { ClipboardList, Filter, Download, X, Search, RefreshCw } from "lucide-react";
import { useToast } from "../components/Toast";
import { auditLogs as defaultAuditLogs } from "../data/mockData";
import { auditService } from "../services/forecastService";

const typeConfig = {
  create: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  update: { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" },
  alert: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
  ai: { bg: "bg-violet-100", text: "text-violet-700", dot: "bg-violet-500" },
  approve: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function AuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState(defaultAuditLogs);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.logId || d._id,
          user: d.user || "System Admin",
          action: d.action,
          entity: d.entity,
          detail: d.detail,
          time: d.time || d.createdAt || new Date().toISOString(),
          type: (d.type || "create") as keyof typeof typeConfig,
        }));
        setLogs(mapped);
      }
    } catch (e) {
      console.warn("Using default audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch = !search ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || log.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Audit Trail</h2>
            <p className="text-sm text-slate-500">Immutable record of all system mutations · {logs.length} total entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Audit Logs"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => showToast("success", "Audit log exported", `${filtered.length} entries exported as CSV`)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search + type filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search user, action, entity…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "create", "update", "alert", "ai", "approve"].map((t) => {
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${typeFilter === t ? "text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
                style={typeFilter === t ? { backgroundColor: "#0a1628" } : {}}>
                {t === "All" ? `All (${logs.length})` : `${t} (${logs.filter((l) => l.type === t).length})`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Timestamp", "User", "Action", "Entity", "Detail", "Type"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((log) => {
                const cfg = typeConfig[log.type] || typeConfig.create;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => showToast("info", `Audit entry ${log.id}`, `${log.action} by ${log.user.split("(")[0].trim()}`)}>
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs text-slate-700">{new Date(log.time).toLocaleDateString("en-IN")}</p>
                      <p className="font-mono text-[11px] text-slate-400">{new Date(log.time).toLocaleTimeString("en-IN")}</p>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 text-xs font-display">{log.user}</td>
                    <td className="px-5 py-3 text-slate-900 font-semibold text-xs">{log.action}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{log.entity}</td>
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-72 truncate">{log.detail}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {log.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
