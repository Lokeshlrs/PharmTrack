import { useState, useEffect } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { notifications as initialNotifs } from "../data/mockData";
import { notificationService } from "../services/notificationService";
import { subscribeToEvent } from "../services/socketService";

type NotifType = "critical" | "warning" | "info" | "success";

const typeConfig: Record<NotifType, { dot: string; bg: string; border: string }> = {
  critical: { dot: "bg-rose-500", bg: "bg-rose-50", border: "border-rose-200" },
  warning: { dot: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  info: { dot: "bg-blue-400", bg: "bg-blue-50", border: "border-blue-200" },
  success: { dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const typeLabels: Record<NotifType, string> = {
  critical: "Critical Alert",
  warning: "Warning",
  info: "Information",
  success: "Success",
};

export default function Notifications() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState<NotifType | "all">("all");
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.notifId || d._id,
          type: (d.type?.toLowerCase() || "info") as NotifType,
          message: d.message,
          time: d.time || (d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"),
          read: Boolean(d.read),
        }));
        setNotifs(mapped);
      }
    } catch (e) {
      console.warn("Using default notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const unsub = subscribeToEvent("notification:new", () => loadNotifications());
    return () => unsub();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
    } catch (e) {
      console.warn("Local mark all read");
    }
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
    } catch (e) {
      console.warn("Local mark read");
    }
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = filter === "all" ? notifs : notifs.filter((n) => n.type === filter);
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Notification Center</h2>
            <p className="text-sm text-slate-500">{unread} unread · Real-time supply chain alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadNotifications}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "critical", "warning", "info", "success"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? `All (${notifs.length})` : `${typeLabels[f]} (${notifs.filter((n) => n.type === f).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.map((n) => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.read ? "bg-white border-slate-200 opacity-70" : `${cfg.bg} ${cfg.border} shadow-sm`
              } hover:opacity-100 flex items-start gap-3`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {typeLabels[n.type]}
                  </span>
                  <span className="text-xs text-slate-400 font-mono shrink-0">{n.time}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{n.message}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
