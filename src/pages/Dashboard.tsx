import {
  Package, AlertTriangle, Clock, Truck, Siren, Building2, Hospital, DollarSign,
  TrendingUp, ArrowRight, Activity, Thermometer, Brain, ArrowLeftRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import KPICard from "../components/KPICard";
import AIInsightCard from "../components/AIInsightCard";
import StatusBadge from "../components/StatusBadge";
import { useState, useEffect } from "react";
import {
  kpiData as defaultKpiData, consumptionTrend as defaultConsumptionTrend,
  stockByCategory as defaultStockByCategory, regionalShortages as defaultRegionalShortages,
  inventory as defaultInventory, shipments as defaultShipments,
  emergencyRequests as defaultEmergencyRequests, notifications as defaultNotifications,
  coldChainUnits as defaultColdChainUnits,
} from "../data/mockData";
import { analyticsService } from "../services/analyticsService";
import { inventoryService } from "../services/inventoryService";
import { shipmentService } from "../services/shipmentService";
import { emergencyService } from "../services/emergencyService";
import { coldChainService } from "../services/coldChainService";
import { notificationService } from "../services/notificationService";
import { subscribeToEvent } from "../services/socketService";
import type { UserRole } from "./Login";

const formatCurrency = (v: number) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString()}`;

interface DashboardProps {
  onNavigate: (id: string) => void;
  role: UserRole;
}

export default function Dashboard({ onNavigate, role }: DashboardProps) {
  const [kpis, setKpis] = useState(defaultKpiData);
  const [inventoryList, setInventoryList] = useState(defaultInventory);
  const [shipmentsList, setShipmentsList] = useState(defaultShipments);
  const [emergenciesList, setEmergenciesList] = useState(defaultEmergencyRequests);
  const [notificationsList, setNotificationsList] = useState(defaultNotifications);
  const [coldUnitsList, setColdUnitsList] = useState(defaultColdChainUnits);
  const [trendData, setTrendData] = useState(defaultConsumptionTrend);
  const [categoriesData, setCategoriesData] = useState(defaultStockByCategory);
  const [shortagesData, setShortagesData] = useState(defaultRegionalShortages);

  const loadData = async () => {
    try {
      const [kpiRes, invRes, shpRes, emgRes, ccuRes, notifRes] = await Promise.allSettled([
        analyticsService.getDashboard(),
        inventoryService.list(),
        shipmentService.list(),
        emergencyService.list(),
        coldChainService.listUnits(),
        notificationService.list(),
      ]);

      if (kpiRes.status === "fulfilled" && kpiRes.value) setKpis(kpiRes.value);
      if (invRes.status === "fulfilled" && invRes.value?.length) setInventoryList(invRes.value as any);
      if (shpRes.status === "fulfilled" && shpRes.value?.length) setShipmentsList(shpRes.value as any);
      if (emgRes.status === "fulfilled" && emgRes.value?.length) setEmergenciesList(emgRes.value as any);
      if (ccuRes.status === "fulfilled" && ccuRes.value?.length) setColdUnitsList(ccuRes.value as any);
      if (notifRes.status === "fulfilled" && notifRes.value?.length) setNotificationsList(notifRes.value as any);
    } catch (e) {
      console.warn("Failed to load dashboard live data:", e);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to Socket.IO real-time events
    const unsubInv = subscribeToEvent("inventory:updated", () => loadData());
    const unsubShp = subscribeToEvent("shipment:updated", () => loadData());
    const unsubEmg = subscribeToEvent("emergency:new", () => loadData());
    const unsubCcu = subscribeToEvent("coldchain:alert", () => loadData());
    const unsubNotif = subscribeToEvent("notification:new", () => loadData());

    return () => {
      unsubInv();
      unsubShp();
      unsubEmg();
      unsubCcu();
      unsubNotif();
    };
  }, []);

  const criticalItems = inventoryList.filter((i) => i.status === "Critical" || i.status === "Expiring Soon" || i.status === "Expired");
  const activeShipments = shipmentsList.filter((s) => s.status === "In Transit" || s.status === "Dispatched");
  const unreadNotifs = notificationsList.filter((n) => !n.read);
  const coldBreaches = coldUnitsList.filter((u) => u.status !== "Safe");
  const pendingEmergencies = emergenciesList.filter((e) => e.status === "Pending");

  return (
    <div className="space-y-0">
      {/* Dark hero status bar */}
      <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2040 100%)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Supply Chain Command Centre
            </h2>
            <p className="text-blue-300 text-sm mt-0.5">Live system status · PharmTrack v2.4.1 · PSS04</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-medium">All systems operational</span>
          </div>
        </div>

        {/* Live status tiles */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: AlertTriangle, label: "Critical Alerts", value: criticalItems.length, sub: "drugs", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", action: "inventory" },
            { icon: Truck, label: "In Transit", value: activeShipments.length, sub: "shipments", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", action: "shipments" },
            { icon: Siren, label: "Emergencies", value: pendingEmergencies.length, sub: "pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", action: "emergency" },
            { icon: Thermometer, label: "Cold Breaches", value: coldBreaches.length, sub: "units", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30", action: "coldchain" },
            { icon: Brain, label: "AI Forecasts", value: 6, sub: "active models", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30", action: "forecasting" },
          ].map((tile) => (
            <button
              key={tile.label}
              onClick={() => onNavigate(tile.action)}
              className={`rounded-xl border p-3.5 text-left transition-all hover:scale-[1.02] ${tile.bg}`}
            >
              <tile.icon size={16} className={tile.color} />
              <p className="text-white font-bold text-xl mt-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>{tile.value}</p>
              <p className={`text-xs font-semibold ${tile.color}`}>{tile.label}</p>
              <p className="text-blue-400/60 text-xs">{tile.sub}</p>
            </button>
          ))}
        </div>

        {/* Flow pipeline */}
        <div className="mt-4 flex items-center gap-1 flex-wrap">
          {["Predict", "Procure", "Track", "Monitor", "Redistribute", "Deliver"].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/10">{step}</span>
              {i < arr.length - 1 && <ArrowRight size={10} className="text-blue-600" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Total Inventory Value" value={formatCurrency(kpis.totalInventoryValue)} icon={DollarSign} color="teal" trend={{ value: 8.2, label: "vs last month" }} onClick={() => onNavigate("analytics")} />
          <KPICard label="Critical / Low Stock" value={kpis.criticalStock} sub="Needs immediate attention" icon={AlertTriangle} color="rose" onClick={() => onNavigate("inventory")} />
          <KPICard label="Active Shipments" value={kpis.activeShipments} sub="3 on schedule, 1 delayed" icon={Truck} color="blue" onClick={() => onNavigate("shipments")} />
          <KPICard label="Emergency Requests" value={kpis.emergencyRequests} sub="2 critical priority" icon={Siren} color="amber" onClick={() => onNavigate("emergency")} />
          <KPICard label="Drugs in Inventory" value={kpis.totalDrugs} sub="20 unique formulations" icon={Package} color="violet" onClick={() => onNavigate("drugs")} />
          <KPICard label="Expiring Within 30d" value={kpis.expiringSoon} sub="FEFO prioritized" icon={Clock} color="amber" onClick={() => onNavigate("expiry")} />
          <KPICard label="Active Suppliers" value={kpis.activeSuppliers} sub="Avg. score: 89.5%" icon={Building2} color="emerald" onClick={() => onNavigate("suppliers")} />
          <KPICard label="Hospitals Covered" value={kpis.hospitalsCovered} sub="Across 9 states" icon={Hospital} color="teal" onClick={() => onNavigate("hospitals")} />
        </div>

        {/* AI Insights */}
        <AIInsightCard insights={[
          "Insulin demand at KGMU Lucknow and AIIMS Delhi is predicted to rise 23% over the next 30 days — recommend placing emergency procurement within 48 hours.",
          "3 hospitals in North-East India may experience antibiotic shortages within 10 days. Redistribution from South India warehouses is recommended.",
          "1,500 units of Paracetamol available for redistribution from Civil Hospital Ahmedabad to KGMU Lucknow — avoids ₹37,500 in new procurement.",
          "Cold Room Beta temperature breach at 11.8°C — 2 refrigerated drug batches may be compromised. Initiate QC inspection immediately.",
        ]} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 font-display">Procurement vs Consumption Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly values (₹) — Mar to Aug 2025</p>
              </div>
              <TrendingUp size={16} className="text-teal-500" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Area type="monotone" dataKey="procurement" name="Procurement" stroke="#06b6d4" fill="url(#gP)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="consumption" name="Consumption" stroke="#6366f1" fill="url(#gC)" strokeWidth={2} dot={false} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 font-display mb-1">Stock by Category</h3>
            <p className="text-xs text-slate-400 mb-4">% distribution by unit count</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoriesData} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {categoriesData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoriesData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.category}</span>
                  </div>
                  <span className="font-semibold text-slate-800 font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional + Alerts + Shipments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 font-display mb-1">Regional Drug Availability</h3>
            <p className="text-xs text-slate-400 mb-4">By region — % hospitals stocked</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shortagesData} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis type="category" dataKey="region" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="normal" name="Normal" stackId="a" fill="#10b981" />
                <Bar dataKey="low" name="Low" stackId="a" fill="#f59e0b" />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 font-display">Critical Stock Alerts</h3>
              <button onClick={() => onNavigate("inventory")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={10} />
              </button>
            </div>
            <div className="space-y-3">
              {criticalItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800 font-display">{item.drugName}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.batchNumber}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={item.status} size="sm" />
                    <p className="text-xs font-mono font-semibold text-slate-700 mt-1">{item.quantity.toLocaleString()} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 font-display">Live Shipments</h3>
              <button onClick={() => onNavigate("shipments")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                Track all <ArrowRight size={10} />
              </button>
            </div>
            <div className="space-y-3">
              {activeShipments.slice(0, 4).map((s) => (
                <div key={s.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono font-semibold text-teal-600">{s.id}</p>
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">{s.drugName}</p>
                  <p className="text-xs text-slate-400">{s.origin} → {s.destination}</p>
                  <div className="mt-2 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${s.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{s.progress}% · ETA {s.expectedArrival}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency + Redistribution quick-actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingEmergencies.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                <Siren size={20} className="text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-rose-800 font-display">{pendingEmergencies.length} Pending Emergency Requests</p>
                <p className="text-sm text-rose-600 mt-0.5">{pendingEmergencies.filter((e) => e.priority === "Critical").length} critical — requires immediate approval</p>
              </div>
              <button onClick={() => onNavigate("emergency")} className="px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors shrink-0">
                Review
              </button>
            </div>
          )}

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <ArrowLeftRight size={20} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-indigo-800 font-display">4 Redistribution Opportunities</p>
              <p className="text-sm text-indigo-600 mt-0.5">AI identified transfers saving approx. ₹1.2L in procurement</p>
            </div>
            <button onClick={() => onNavigate("redistribution")} className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shrink-0">
              Review
            </button>
          </div>
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 font-display">Recent Notifications</h3>
            <button onClick={() => onNavigate("notifications")} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {unreadNotifs.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-3">
                <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.type === "critical" ? "bg-rose-500" : n.type === "warning" ? "bg-amber-500" : n.type === "success" ? "bg-emerald-500" : "bg-blue-400"}`} />
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="ml-auto text-xs text-slate-400 shrink-0">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
