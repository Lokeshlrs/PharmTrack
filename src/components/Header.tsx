import { useState, useEffect } from "react";
import { Bell, Search, Menu, ChevronDown, LogOut, Shield, Building2, Warehouse, Hospital, FlaskConical } from "lucide-react";
import { notifications as defaultNotifications } from "../data/mockData";
import { notificationService } from "../services/notificationService";
import { subscribeToEvent } from "../services/socketService";
import type { UserRole } from "../pages/Login";

const pageLabels: Record<string, string> = {
  dashboard: "Supply Chain Overview",
  inventory: "Drug Inventory",
  drugs: "Drugs & Batches",
  procurement: "Purchase Orders",
  suppliers: "Supplier Management",
  shipments: "Shipment Tracking",
  hospitals: "Hospital Network",
  redistribution: "Smart Redistribution",
  emergency: "Emergency Requests",
  forecasting: "AI Demand Forecasting",
  coldchain: "Cold Chain Monitoring",
  qr: "QR Traceability",
  expiry: "Expiry & FEFO",
  recalls: "Drug Recalls",
  analytics: "Supply Chain Analytics",
  notifications: "Notification Center",
  audit: "Audit Logs",
  settings: "Settings",
};

const roleIcons: Record<UserRole, React.ElementType> = {
  admin: Shield,
  government: Building2,
  supplier: FlaskConical,
  warehouse: Warehouse,
  hospital: Hospital,
  pharmacist: FlaskConical,
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-teal-600",
  government: "bg-blue-600",
  supplier: "bg-violet-600",
  warehouse: "bg-amber-600",
  hospital: "bg-emerald-600",
  pharmacist: "bg-rose-600",
};

interface HeaderProps {
  active: string;
  onToggleSidebar: () => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
  onNavigate?: (id: string) => void;
}

export default function Header({ active, onToggleSidebar, role, userName, onLogout, onNavigate }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(
    defaultNotifications.filter((n) => !n.read).length
  );
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  const RoleIcon = roleIcons[role];

  const fetchUnread = async () => {
    try {
      const unreadList = await notificationService.getUnread();
      if (Array.isArray(unreadList)) {
        setUnreadCount(unreadList.length);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchUnread();
    const unsub = subscribeToEvent("notification:new", () => fetchUnread());
    return () => unsub();
  }, []);

  return (
    <header className="h-14 flex items-center gap-3 px-5 bg-white border-b border-slate-200 shrink-0">
      <button onClick={onToggleSidebar} className="text-slate-400 hover:text-slate-700 transition-colors">
        <Menu size={18} />
      </button>
      <div className="hidden md:block">
        <h1 className="text-sm font-bold text-slate-900 font-display leading-tight">{pageLabels[active] ?? active}</h1>
        <p className="text-xs text-slate-400">{today}</p>
      </div>

      <div className="flex-1 max-w-sm ml-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drugs, batches, hospitals…"
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => onNavigate?.("notifications")}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          title="View Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${roleColors[role]}`}>
            <RoleIcon size={13} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 font-display leading-tight">{userName}</p>
            <p className="text-xs text-slate-400 capitalize leading-tight">{role}</p>
          </div>
          <ChevronDown size={11} className="text-slate-400" />
        </div>

        <button
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
