import { useState, useEffect } from "react";
import { Brain, TrendingUp, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import AIInsightCard from "../components/AIInsightCard";
import { useToast } from "../components/Toast";
import { aiForecasts as defaultForecasts, consumptionHistory } from "../data/mockData";
import { forecastService } from "../services/forecastService";

const confidenceColor = (c: number) => c >= 90 ? "text-emerald-600" : c >= 80 ? "text-amber-600" : "text-rose-600";
const trendIcon = (t: string) => t === "rising" ? "↑" : t === "declining" ? "↓" : "→";
const trendColor = (t: string) => t === "rising" ? "text-rose-500" : t === "declining" ? "text-emerald-500" : "text-slate-500";

export default function AIForecasting() {
  const { showToast } = useToast();
  const [forecastList, setForecastList] = useState(defaultForecasts);
  const [selected, setSelected] = useState(defaultForecasts[0]);
  const [loadingPO, setLoadingPO] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadForecasts = async () => {
    setLoading(true);
    try {
      const data = await forecastService.list();
      if (data?.length) {
        setForecastList(data);
        const match = data.find((f: any) => f.drugId === selected.drugId) || data[0];
        setSelected(match);
      }
    } catch (e) {
      console.warn("Using default AI forecasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecasts();
  }, []);

  const handleGeneratePO = async () => {
    setLoadingPO(true);
    try {
      const res = await forecastService.generatePO(selected.drugId);
      const poNum = res.po?.poNumber || res.poNumber || "PO";
      showToast("success", "Purchase Order Auto-Generated", `${poNum} created for ${selected.recommendedOrder > 0 ? selected.recommendedOrder.toLocaleString() : 1000} units of ${selected.drugName}`);
    } catch (e: any) {
      showToast("error", "PO Generation Failed", e.message || "Failed to generate purchase order");
    } finally {
      setLoadingPO(false);
    }
  };

  const histData = consumptionHistory[selected.drugId as keyof typeof consumptionHistory] ?? consumptionHistory["D001"];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">AI Demand Forecasting</h2>
            <p className="text-sm text-slate-500">Predictive analytics powered by consumption pattern ML model</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadForecasts}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Predictions"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-xs font-semibold text-violet-700 font-mono">
            Model: ARIMA + Random Forest · Accuracy: 91.4%
          </div>
        </div>
      </div>

      <AIInsightCard insights={[
        "Insulin Glargine demand at KGMU Lucknow predicted to increase 23% in next 30 days — recommend immediate procurement of 650 units.",
        "Vancomycin shortage probability: 87% within 15 days across 4 hospitals. Initiate emergency redistribution or new PO.",
        "Azithromycin demand stable but expiry-risk is high — 180 units expiring in 28 days. Recommend expedited use or redistribution.",
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drug list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
          <h3 className="font-semibold text-slate-700 font-display mb-3">Select Drug</h3>
          {forecastList.map((f) => (
            <button
              key={f.drugId}
              onClick={() => setSelected(f)}
              className={`w-full text-left rounded-lg p-3 transition-colors border ${
                selected.drugId === f.drugId
                  ? "border-violet-300 bg-violet-50"
                  : "border-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-slate-800 font-display">{f.drugName}</p>
                <span className={`text-sm font-bold ${trendColor(f.trend)}`}>{trendIcon(f.trend)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-400 font-mono">{f.currentStock.toLocaleString()} units</span>
                {f.shortage > 0 ? (
                  <span className="text-xs text-rose-600 font-semibold">Shortage in 30d</span>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold">Sufficient</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Forecast detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Current Stock", value: selected.currentStock.toLocaleString(), sub: "units on hand", color: "bg-slate-50 border-slate-200" },
              { label: "30-Day Demand", value: selected.predicted30.toLocaleString(), sub: "predicted units", color: "bg-violet-50 border-violet-200" },
              { label: "Expected Shortage", value: selected.shortage > 0 ? selected.shortage.toLocaleString() : "None", sub: selected.shortage > 0 ? "units deficit" : "Stock sufficient", color: selected.shortage > 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200" },
              { label: "Recommended Order", value: selected.recommendedOrder > 0 ? selected.recommendedOrder.toLocaleString() : "Buffer Stock", sub: "units to procure", color: "bg-teal-50 border-teal-200" },
            ].map((c, i) => (
              <div key={i} className={`rounded-xl border p-3 ${c.color}`}>
                <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                <p className="text-xl font-bold font-mono text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 font-display">{selected.drugName} — Consumption & Demand Projection</h3>
                <p className="text-xs text-slate-400">Monthly actual consumption vs AI projected demand</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold ${confidenceColor(selected.confidence)}`}>
                  {selected.confidence}% confidence
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={histData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="actual" fill="#0d9488" name="Actual Consumption" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" name="AI Forecast" dot={{ stroke: "#8b5cf6", strokeWidth: 2, r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm font-display">Auto-Replenishment Workflow</p>
              <p className="text-xs text-slate-400">1-click create purchase order based on AI recommendation</p>
            </div>
            <button
              disabled={loadingPO}
              onClick={handleGeneratePO}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={15} /> {loadingPO ? "Generating..." : "Generate Purchase Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
