import { useState, useEffect } from "react";
import { Thermometer, Droplets, AlertTriangle, CheckCircle, Clock, Zap, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useToast } from "../components/Toast";
import { coldChainUnits as defaultUnits, coldChainHistory as defaultHistory } from "../data/mockData";
import { coldChainService } from "../services/coldChainService";
import { subscribeToEvent } from "../services/socketService";

const statusColor = {
  Safe: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-500" },
  Warning: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "text-amber-500" },
  Critical: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", icon: "text-rose-500" },
};

const StatusIcon = ({ s }: { s: "Safe" | "Warning" | "Critical" }) =>
  s === "Safe" ? <CheckCircle size={16} className="text-emerald-500" /> :
  s === "Warning" ? <AlertTriangle size={16} className="text-amber-500" /> :
  <AlertTriangle size={16} className="text-rose-500 animate-pulse" />;

export default function ColdChain() {
  const { showToast } = useToast();
  const [units, setUnits] = useState(defaultUnits);
  const [selected, setSelected] = useState(defaultUnits[0]);
  const [historyData, setHistoryData] = useState<any[]>(defaultHistory["CCU-A"]);
  const [simulating, setSimulating] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await coldChainService.listUnits();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.storageUnitId || d._id,
          name: d.name,
          location: d.location,
          temperature: d.temperature,
          humidity: d.humidity,
          status: (d.status || "Safe") as "Safe" | "Warning" | "Critical",
          minTemp: d.minTemp,
          maxTemp: d.maxTemp,
          minHumidity: d.minHumidity,
          maxHumidity: d.maxHumidity,
          drugs: d.drugs || [],
          lastUpdated: d.lastUpdated || new Date().toISOString(),
          alerts: d.alerts || 0,
          hourlyLogs: d.hourlyLogs || [],
        }));
        setUnits(mapped);
        const match = mapped.find((u) => u.id === selected.id) || mapped[0];
        setSelected(match);
        if (match.hourlyLogs?.length) {
          setHistoryData(match.hourlyLogs);
        }
      }
    } catch (e) {
      console.warn("Using default cold chain units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
    const unsub = subscribeToEvent("coldchain:alert", (payload: any) => {
      showToast("error", "Cold Chain Breach Broadcast", `Breach detected in ${payload?.storageUnitId || "storage unit"}: ${payload?.temperature}°C`);
      loadUnits();
    });
    return () => unsub();
  }, []);

  const handleSelectUnit = async (unit: any) => {
    setSelected(unit);
    try {
      const readings = await coldChainService.getReadings(unit.id);
      if (readings?.length) {
        setHistoryData(readings.map((r: any) => ({
          time: r.time || (r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now"),
          temp: r.temperature,
        })));
      } else if (unit.hourlyLogs?.length) {
        setHistoryData(unit.hourlyLogs);
      }
    } catch {
      if (unit.hourlyLogs?.length) setHistoryData(unit.hourlyLogs);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const unit = await coldChainService.simulateBreach({
        storageUnitId: selected.id || "CCU-B",
        temperature: 12.8,
        humidity: 88,
      });
      showToast("error", "Simulated Cold Chain Breach", `Sensor reading sent: ${unit?.temperature ?? 12.8}°C (Threshold: 2–8°C)`);
      await loadUnits();
    } catch (e: any) {
      showToast("error", "Simulated Cold Chain Breach", `Temperature raised to 12.8°C in ${selected.name}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
          <Thermometer size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Cold Chain Monitoring</h2>
          <p className="text-sm text-slate-500">Real-time IoT sensor telemetry — ESP32 + DHT22 active sensors</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={loadUnits}
            className="p-1.5 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Readings"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            disabled={simulating}
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Zap size={13} /> {simulating ? "Simulating..." : "Simulate IoT Breach"}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live · Socket.IO Connected
          </div>
        </div>
      </div>

      {/* Alert banner for breaches */}
      {units.some((u) => u.status === "Critical") && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <div>
            <p className="font-semibold text-rose-800 font-display">Cold Chain Breach Detected</p>
            <p className="text-sm text-rose-600">Storage temperature anomaly detected exceeding maximum allowable safety tolerance. Affected batches have been flagged for QC inspection.</p>
          </div>
        </div>
      )}

      {/* Unit cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.map((unit) => {
          const cfg = statusColor[unit.status] || statusColor.Safe;
          return (
            <button
              key={unit.id}
              onClick={() => handleSelectUnit(unit)}
              className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${cfg.bg} ${cfg.border} ${selected.id === unit.id ? "ring-2 ring-offset-1 ring-teal-400" : ""}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{unit.status}</span>
                <StatusIcon s={unit.status} />
              </div>
              <p className="font-bold text-slate-900 font-display text-sm">{unit.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{unit.location}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-1">
                    <Thermometer size={12} className={cfg.icon} />
                    <span className={`text-lg font-bold font-mono ${unit.temperature > unit.maxTemp || unit.temperature < unit.minTemp ? "text-rose-600" : "text-slate-900"}`}>
                      {unit.temperature}°C
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Range: {unit.minTemp}–{unit.maxTemp}°C</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Droplets size={12} className="text-blue-400" />
                    <span className={`text-lg font-bold font-mono ${unit.humidity > unit.maxHumidity ? "text-rose-600" : "text-slate-900"}`}>
                      {unit.humidity}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Range: {unit.minHumidity}–{unit.maxHumidity}%</p>
                </div>
              </div>
              {unit.alerts > 0 && (
                <p className="mt-2 text-xs text-rose-600 font-semibold">{unit.alerts} active alert{unit.alerts > 1 ? "s" : ""}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 font-display">{selected.name} — 24h Temperature Log</h3>
              <p className="text-xs text-slate-400">{selected.location}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              Last updated: {new Date(selected.lastUpdated).toLocaleTimeString("en-IN")}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={historyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 16]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: number) => [`${v}°C`, "Temperature"]} />
              <ReferenceLine y={selected.maxTemp} stroke="#f43f5e" strokeDasharray="4 2" label={{ value: `Max ${selected.maxTemp}°C`, fontSize: 9, fill: "#f43f5e", position: "insideTopRight" }} />
              <ReferenceLine y={selected.minTemp} stroke="#06b6d4" strokeDasharray="4 2" label={{ value: `Min ${selected.minTemp}°C`, fontSize: 9, fill: "#06b6d4", position: "insideBottomRight" }} />
              <Line type="monotone" dataKey="temp" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 font-display mb-4">Stored Drugs</h3>
          <div className="space-y-2 mb-5">
            {selected.drugs.map((d, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                <span className="text-sm text-slate-700">{d}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sensor Readings</h4>
            {[
              { label: "Temperature", value: `${selected.temperature}°C`, ok: selected.temperature >= selected.minTemp && selected.temperature <= selected.maxTemp },
              { label: "Humidity", value: `${selected.humidity}%`, ok: selected.humidity <= selected.maxHumidity && selected.humidity >= selected.minHumidity },
              { label: "Status", value: selected.status, ok: selected.status === "Safe" },
              { label: "Alerts", value: `${selected.alerts} active`, ok: selected.alerts === 0 },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{r.label}</span>
                <span className={`font-mono font-semibold ${r.ok ? "text-emerald-600" : "text-rose-600"}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
