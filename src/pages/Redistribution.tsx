import { useState, useEffect } from "react";
import { ArrowLeftRight, Brain, MapPin, CheckCircle, TrendingDown, TrendingUp, RefreshCw, Truck, ShieldCheck } from "lucide-react";
import AIInsightCard from "../components/AIInsightCard";
import { useToast } from "../components/Toast";
import { redistributionOpportunities as defaultOpportunities } from "../data/mockData";
import { redistributionService } from "../services/redistributionService";

const urgencyConfig = {
  Critical: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", badge: "bg-rose-100" },
  High: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100" },
  Medium: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100" },
};

export default function Redistribution() {
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState<any[]>(defaultOpportunities);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await redistributionService.getRecommendations();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.transferId || d._id,
          drug: d.drugName,
          sourceHospital: d.sourceHospital,
          sourceStock: d.sourceStock,
          sourceExpected: d.sourceExpected,
          excess: d.excess,
          targetHospital: d.targetHospital,
          targetStock: d.targetStock,
          targetExpected: d.targetExpected,
          shortage: d.shortage,
          recommended: d.recommended,
          urgency: (d.urgency || "High") as "Critical" | "High" | "Medium",
          distance: d.distance,
          expiryDays: d.expiryDays,
          status: d.status || "Pending",
          isApproved: d.status === "Approved" || d.status === "In Transit" || d.status === "Completed",
          approvedBy: d.approvedBy || "System Admin",
          shipmentId: d.shipmentId,
          updatedAt: d.updatedAt,
        }));
        setOpportunities(mapped);
      }
    } catch (e) {
      console.warn("Using default redistribution opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const approve = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await redistributionService.approveTransfer(id);
      const shipId = res.shipment?.shipmentId || res.transfer?.shipmentId || "SHP-DISPATCH";
      showToast("success", "Redistribution Approved", `Transfer order and tracking shipment ${shipId} persisted to MongoDB`);
      await loadRecommendations();
    } catch (e: any) {
      showToast("error", "Approval Failed", e.message || "Failed to approve transfer");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = opportunities.filter((o) => !o.isApproved && o.status === "Pending").length;
  const approvedCount = opportunities.filter((o) => o.isApproved || o.status === "Approved").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ArrowLeftRight size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Smart Stock Redistribution Engine</h2>
            <p className="text-sm text-slate-500">AI-identified transfer opportunities to prevent regional shortages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRecommendations}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Recommendations"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
            {pendingCount} pending · {approvedCount} approved
          </div>
        </div>
      </div>

      <AIInsightCard insights={[
        "Redistribution instead of new procurement saves approx. ₹1.2L across the identified opportunities.",
        "Critical: GMCH Guwahati at high risk of Amoxicillin stockout within 7 days — immediate transfer from Bengaluru recommended.",
        "Paracetamol excess at Civil Hospital Ahmedabad (2,500 units) can fully resolve KGMU Lucknow's critical shortage.",
      ]} />

      {/* How it works */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 font-display mb-4">How the Redistribution Engine Works</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          {["Detect Excess\nStock", "Detect\nShortages", "Calculate\nFeasibility", "Check\nExpiry", "Rank by\nUrgency", "Generate\nRecommendation"].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">{i + 1}</div>
              <p className="text-slate-600 whitespace-pre-line leading-tight">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="space-y-4">
        {opportunities.map((opp) => {
          const cfg = urgencyConfig[opp.urgency as keyof typeof urgencyConfig] || urgencyConfig.Medium;
          const isApproved = opp.isApproved || opp.status === "Approved" || opp.status === "In Transit" || opp.status === "Completed";
          return (
            <div key={opp.id} className={`rounded-xl border ${isApproved ? "border-emerald-200 bg-emerald-50/40" : `${cfg.border} bg-white`} shadow-sm overflow-hidden transition-all`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge} ${cfg.text}`}>
                        {opp.urgency} URGENCY
                      </span>
                      <span className="font-mono text-xs text-slate-400">{opp.id}</span>
                      <span className="text-sm font-bold text-slate-900 font-display ml-1">{opp.drug}</span>
                      {isApproved && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ml-auto">
                          <CheckCircle size={12} /> APPROVED & PERSISTED
                        </span>
                      )}
                    </div>

                    {/* Source → Target visualization */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <div className="md:col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp size={12} className="text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-700">EXCESS STOCK</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm font-display">{opp.sourceHospital}</p>
                        <div className="mt-2 space-y-0.5 text-xs font-mono">
                          <p>Available: <span className="font-bold text-emerald-700">{opp.sourceStock?.toLocaleString() || 0}</span></p>
                          <p>Expected need: <span className="text-slate-500">{opp.sourceExpected?.toLocaleString() || 0}</span></p>
                          <p>Surplus: <span className="font-bold text-emerald-600">+{opp.excess?.toLocaleString() || 0}</span></p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 py-2">
                        <ArrowLeftRight size={20} className="text-indigo-500" />
                        <div className="text-center">
                          <p className="text-xs font-bold font-mono text-indigo-700">{opp.recommended?.toLocaleString() || 0} units</p>
                          <p className="text-xs text-slate-400">{opp.distance} km</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 p-3 bg-rose-50 rounded-xl border border-rose-200">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingDown size={12} className="text-rose-600" />
                          <span className="text-xs font-semibold text-rose-700">SHORTAGE</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm font-display">{opp.targetHospital}</p>
                        <div className="mt-2 space-y-0.5 text-xs font-mono">
                          <p>Available: <span className="font-bold text-rose-600">{opp.targetStock?.toLocaleString() || 0}</span></p>
                          <p>Expected need: <span className="text-slate-500">{opp.targetExpected?.toLocaleString() || 0}</span></p>
                          <p>Shortage: <span className="font-bold text-rose-700">-{opp.shortage?.toLocaleString() || 0}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><MapPin size={11} /> {opp.distance} km transfer distance</div>
                        <div className="flex items-center gap-1 text-emerald-600">Expiry: {opp.expiryDays} days remaining</div>
                      </div>
                      {isApproved && opp.shipmentId && (
                        <div className="flex items-center gap-1 text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          <Truck size={12} /> Shipment: {opp.shipmentId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2 self-center">
                    {isApproved ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                          <CheckCircle size={14} /> Approved
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">Status: {opp.status}</span>
                      </div>
                    ) : (
                      <button
                        disabled={actionLoading === opp.id}
                        onClick={() => approve(opp.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle size={14} /> {actionLoading === opp.id ? "Approving..." : "Approve Transfer"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
