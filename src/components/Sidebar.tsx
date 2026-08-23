import {
  LayoutDashboard, Package, Pill, ShoppingCart, Building2, FileText,
  Truck, Hospital, ArrowLeftRight, Siren, Brain, Thermometer,
  QrCode, Clock, AlertTriangle, BarChart3, Bell, ClipboardList,
  Settings, ChevronRight, Activity,
} from "lucide-react";
import type { UserRole } from "../pages/Login";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string | null;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, section: null, roles: ["admin", "government", "supplier", "warehouse", "hospital", "pharmacist"] },
  { id: "inventory", label: "Inventory", icon: Package, section: "Supply Chain", roles: ["admin", "government", "warehouse", "hospital", "pharmacist"] },
  { id: "drugs", label: "Drugs & Batches", icon: Pill, section: "Supply Chain", roles: ["admin", "warehouse", "pharmacist"] },
  { id: "procurement", label: "Purchase Orders", icon: ShoppingCart, section: "Supply Chain", roles: ["admin", "supplier", "warehouse"] },
  { id: "suppliers", label: "Suppliers", icon: Building2, section: "Supply Chain", roles: ["admin", "government"] },
  { id: "shipments", label: "Shipments", icon: Truck, section: "Supply Chain", roles: ["admin", "government", "supplier", "warehouse", "hospital"] },
  { id: "hospitals", label: "Hospitals", icon: Hospital, section: "Distribution", roles: ["admin", "government"] },
  { id: "redistribution", label: "Stock Redistribution", icon: ArrowLeftRight, section: "Distribution", roles: ["admin", "government", "warehouse"] },
  { id: "emergency", label: "Emergency Requests", icon: Siren, section: "Distribution", roles: ["admin", "government", "hospital"] },
  { id: "forecasting", label: "AI Forecasting", icon: Brain, section: "Intelligence", roles: ["admin", "government", "warehouse"] },
  { id: "coldchain", label: "Cold Chain", icon: Thermometer, section: "Intelligence", roles: ["admin", "warehouse", "pharmacist"] },
  { id: "qr", label: "QR Traceability", icon: QrCode, section: "Intelligence", roles: ["admin", "warehouse", "pharmacist", "hospital"] },
  { id: "expiry", label: "Expiry & FEFO", icon: Clock, section: "Quality", roles: ["admin", "warehouse", "pharmacist"] },
  { id: "recalls", label: "Drug Recalls", icon: AlertTriangle, section: "Quality", roles: ["admin", "government", "hospital", "pharmacist"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, section: "Reports", roles: ["admin", "government"] },
  { id: "notifications", label: "Notifications", icon: Bell, section: "Reports", roles: ["admin", "government", "supplier", "warehouse", "hospital", "pharmacist"] },
  { id: "audit", label: "Audit Logs", icon: ClipboardList, section: "Reports", roles: ["admin", "government"] },
  { id: "settings", label: "Settings", icon: Settings, section: null, roles: ["admin"] },
];

const roleLabels: Record<UserRole, string> = {
  admin: "System Admin",
  government: "Govt. Authority",
  supplier: "Supplier",
  warehouse: "Warehouse Mgr.",
  hospital: "Hospital",
  pharmacist: "Pharmacist",
};

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  role: UserRole;
}

export default function Sidebar({ active, onNavigate, collapsed, role }: SidebarProps) {
  const visibleItems = navItems.filter((item) => item.roles.includes(role));
  let lastSection: string | null = "NONE";

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 shrink-0"
      style={{ width: collapsed ? 56 : 232, background: "#0a1628" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <Activity size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm font-display leading-tight truncate">PharmTrack</p>
            <p className="text-blue-400 text-xs truncate">National Supply Chain</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
          <p className="text-blue-300/60 text-xs leading-tight">Logged in as</p>
          <p className="text-white text-xs font-semibold font-display mt-0.5 capitalize">{roleLabels[role]}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {visibleItems.map((item) => {
          const showSection = item.section !== null && item.section !== lastSection;
          if (item.section !== null) lastSection = item.section;
          return (
            <div key={item.id}>
              {showSection && !collapsed && (
                <p className="px-4 pt-4 pb-1 text-xs font-semibold text-blue-400/50 uppercase tracking-widest font-mono">
                  {item.section}
                </p>
              )}
              <button
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors group relative
                  ${active === item.id ? "bg-teal-500/15 text-teal-300" : "text-blue-100/60 hover:text-white hover:bg-white/5"}`}
              >
                {active === item.id && <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-teal-400 rounded-r" />}
                <item.icon size={15} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium text-xs">{item.label}</span>
                    {active !== item.id && (
                      <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/8">
          <p className="text-blue-400/30 text-xs font-mono">v2.4.1 · SIH 2025 · PSS04</p>
        </div>
      )}
    </aside>
  );
}
