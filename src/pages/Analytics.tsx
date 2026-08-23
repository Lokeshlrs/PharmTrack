import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { consumptionTrend as defaultTrend, stockByCategory as defaultCategories, regionalShortages as defaultShortages, suppliers as defaultSuppliers } from "../data/mockData";
import AIInsightCard from "../components/AIInsightCard";
import { analyticsService } from "../services/analyticsService";

const supplierPerf = defaultSuppliers.map((s) => ({ name: s.name.split(" ")[0], score: s.score, onTime: s.onTime, quality: s.quality }));

const demandForecastData = [
  { month: "Sep", actual: null, forecast: 2350000 },
  { month: "Oct", actual: null, forecast: 2480000 },
  { month: "Nov", actual: null, forecast: 2650000 },
  { month: "Dec", actual: null, forecast: 2800000 },
];

export default function Analytics() {
  const [trends, setTrends] = useState(defaultTrend);
  const [categories, setCategories] = useState(defaultCategories);
  const [shortages, setShortages] = useState(defaultShortages);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getAll();
      if (data) {
        if (data.consumptionTrend?.length) setTrends(data.consumptionTrend);
        if (data.stockByCategory?.length) setCategories(data.stockByCategory);
        if (data.regionalShortages?.length) setShortages(data.regionalShortages);
      }
    } catch (e) {
      console.warn("Using default analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const combinedTrend = [
    ...trends.map((d) => ({ ...d, forecast: null })),
    ...demandForecastData,
  ];

  const totalProcurement = trends.reduce((s, d) => s + (d.procurement || 0), 0);
  const totalConsumption = trends.reduce((s, d) => s + (d.consumption || 0), 0);
  const totalWaste = trends.reduce((s, d) => s + (d.waste || 0), 0);
  const efficiency = totalProcurement > 0 ? ((totalConsumption / totalProcurement) * 100).toFixed(1) : "91.2";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Supply Chain Analytics</h2>
            <p className="text-sm text-slate-500">Real-time performance metrics and predictive insights · FY 2025–26</p>
          </div>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh Analytics"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Procurement YTD", value: `₹${(totalProcurement / 1000000).toFixed(1)}M`, sub: "Mar–Aug 2025", color: "text-teal-600" },
          { label: "Total Consumption YTD", value: `₹${(totalConsumption / 1000000).toFixed(1)}M`, sub: "Utilization efficiency", color: "text-indigo-600" },
          { label: "Supply Chain Efficiency", value: `${efficiency}%`, sub: "Consumption / Procurement", color: "text-emerald-600" },
          { label: "Total Drug Waste", value: `₹${(totalWaste / 1000).toFixed(0)}K`, sub: "Expired/damaged drugs", color: "text-rose-600" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <AIInsightCard insights={[
        `Supply chain efficiency at ${efficiency}% — 4.2pp improvement vs Q1 FY25. Waste reduction driven by FEFO enforcement.`,
        "North-East India shows consistently higher shortage rates. Recommend pre-positioning buffer stock at Guwahati regional warehouse.",
        "Antibiotic category accounts for 38% of inventory but 52% of emergency requests — demand forecasting model recommends safety stock increase.",
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procurement vs consumption + forecast */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 font-display">Procurement & Consumption + 4-Month Forecast</h3>
              <p className="text-xs text-slate-400">Actuals (solid) and AI forecast (dashed)</p>
            </div>
            <TrendingUp size={14} className="text-teal-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={combinedTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: any) => [v ? `₹${(v / 100000).toFixed(1)}L` : "—", ""]} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Area type="monotone" dataKey="procurement" stroke="#06b6d4" fill="url(#gradP)" name="Procurement (₹)" />
              <Area type="monotone" dataKey="consumption" stroke="#6366f1" fill="url(#gradC)" name="Consumption (₹)" />
              <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Forecast (₹)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Shortage Risk */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 font-display mb-1">Regional Shortage Vulnerability</h3>
          <p className="text-xs text-slate-400 mb-4">Stock buffer vs projected seasonal consumption</p>
          <div className="space-y-3">
            {shortages.map((r: any) => (
              <div key={r.region}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{r.region}</span>
                  <span className={`font-semibold ${r.shortageRisk === "High" ? "text-rose-600" : r.shortageRisk === "Moderate" ? "text-amber-600" : "text-emerald-600"}`}>
                    {r.shortageRisk} Risk ({r.bufferDays}d buffer)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      r.shortageRisk === "High" ? "bg-rose-500" : r.shortageRisk === "Moderate" ? "bg-amber-400" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, (r.bufferDays / 45) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
