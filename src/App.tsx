import { useState, useEffect } from "react";
import Login, { type UserRole } from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ToastProvider } from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import DrugsAndBatches from "./pages/DrugsAndBatches";
import AIForecasting from "./pages/AIForecasting";
import ColdChain from "./pages/ColdChain";
import Shipments from "./pages/Shipments";
import Emergency from "./pages/Emergency";
import Redistribution from "./pages/Redistribution";
import QRTraceability from "./pages/QRTraceability";
import ExpiryFEFO from "./pages/ExpiryFEFO";
import Suppliers from "./pages/Suppliers";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import DrugRecalls from "./pages/DrugRecalls";
import Procurement from "./pages/Procurement";
import Hospitals from "./pages/Hospitals";
import { authService } from "./services/authService";

function Settings() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display">System Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configure PharmTrack preferences</p>
      </div>
      {[
        { section: "Notifications", items: ["Low stock threshold alerts", "Cold chain breach alerts", "Emergency request push notifications", "Daily digest email report"] },
        { section: "Forecasting", items: ["AI model: ARIMA + Random Forest (active)", "Confidence threshold: 85%", "Forecast horizon: 90 days", "Safety stock buffer: 10%"] },
        { section: "System", items: ["FEFO enforcement: Enabled", "Auto reorder suggestions: Enabled", "QR code generation: Enabled", "Audit logging: Full"] },
      ].map((s) => (
        <div key={s.section} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 font-display mb-3">{s.section}</h3>
          <div className="space-y-3">
            {s.items.map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item}</span>
                <button className="w-10 h-5 bg-teal-500 rounded-full relative transition-colors hover:bg-teal-600">
                  <span className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<UserRole | null>(() => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  });
  const [userName, setUserName] = useState<string>(() => {
    const user = authService.getCurrentUser();
    return user?.name || "";
  });
  const [active, setActive] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.title = "PharmTrack – Intelligent Drug Inventory & Supply Chain";
  }, []);

  const handleLogout = () => {
    authService.logout();
    setRole(null);
    setUserName("");
    setActive("dashboard");
  };

  if (!role) {
    return (
      <ToastProvider>
        <Login onLogin={(r, name) => { setRole(r); setUserName(name); }} />
      </ToastProvider>
    );
  }

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard onNavigate={setActive} role={role} />;
      case "inventory": return <Inventory />;
      case "drugs": return <DrugsAndBatches />;
      case "procurement": return <Procurement />;
      case "suppliers": return <Suppliers />;
      case "shipments": return <Shipments />;
      case "hospitals": return <Hospitals />;
      case "redistribution": return <Redistribution />;
      case "emergency": return <Emergency />;
      case "forecasting": return <AIForecasting />;
      case "coldchain": return <ColdChain />;
      case "qr": return <QRTraceability />;
      case "expiry": return <ExpiryFEFO />;
      case "recalls": return <DrugRecalls />;
      case "analytics": return <Analytics />;
      case "notifications": return <Notifications />;
      case "audit": return <AuditLogs />;
      case "settings": return <Settings />;
      default: return <Dashboard onNavigate={setActive} role={role} />;
    }
  };

  return (
    <ToastProvider>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f4f8" }}>
        <Sidebar active={active} onNavigate={setActive} collapsed={sidebarCollapsed} role={role} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header
            active={active}
            onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
            role={role}
            userName={userName}
            onLogout={handleLogout}
            onNavigate={setActive}
          />
          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
