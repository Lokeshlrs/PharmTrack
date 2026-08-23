import { useState, useEffect } from "react";
import { AlertTriangle, Hospital, Package, CheckCircle, Bell, History, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { recalls as initialRecalls } from "../data/mockData";
import { recallService } from "../services/recallService";

const severityConfig = {
  High: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700" },
  Moderate: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  Low: { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-600" },
};

const shipmentHistory = [
  { date: "2025-07-15", from: "Cipla, Mumbai", to: "Central Warehouse, Delhi", qty: 5000 },
  { date: "2025-07-22", from: "Central Warehouse, Delhi", to: "AIIMS New Delhi", qty: 1200 },
  { date: "2025-07-28", from: "Central Warehouse, Delhi", to: "PGI Chandigarh", qty: 800 },
  { date: "2025-08-05", from: "Central Warehouse, Delhi", to: "District Hospital, Jaipur", qty: 400 },
];

function RecallHistory({ batchNumber, onClose }: { batchNumber: string; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
        <p className="text-xs text-rose-600 font-semibold">Recalled Batch</p>
        <p className="font-mono text-sm font-bold text-rose-800 mt-0.5">{batchNumber}</p>
      </div>
      <div className="space-y-2">
        {shipmentHistory.map((h, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
            <div className="flex-1">
              <p className="text-xs font-mono text-slate-400">{h.date}</p>
              <p className="text-sm text-slate-800 mt-0.5">{h.from} → {h.to}</p>
              <p className="text-xs text-slate-500">{h.qty.toLocaleString()} units transferred</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">Close</button>
    </div>
  );
}

export default function DrugRecalls() {
  const { showToast } = useToast();
  const [recalls, setRecalls] = useState(initialRecalls);
  const [historyBatch, setHistoryBatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRecalls = async () => {
    setLoading(true);
    try {
      const data = await recallService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.recallId || d._id,
          batchNumber: d.batchNumber,
          drugName: d.drugName,
          reason: d.reason,
          severity: (d.severity || "High") as "High" | "Moderate" | "Low",
          affectedHospitals: d.affectedHospitals || (d.hospitals ? d.hospitals.length : 3),
          affectedQty: d.affectedQty || 2400,
          status: (d.status || "Active") as "Active" | "Investigating" | "Completed",
          initiatedBy: d.initiatedBy || "CDSCO",
          date: d.date || new Date().toISOString().split("T")[0],
          hospitals: d.hospitals || [],
        }));
        setRecalls(mapped);
      }
    } catch (e) {
      console.warn("Using default drug recalls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecalls();
  }, []);

  const quarantine = async (id: string, batch: string) => {
    try {
      await recallService.quarantine(id);
      showToast("warning", "Quarantine Initiated", `Batch ${batch} quarantined across all facilities & locked from FEFO`);
      loadRecalls();
    } catch (e: any) {
      showToast("error", "Quarantine Failed", e.message || "Failed to quarantine batch");
    }
  };

  const notify = async (id: string, name: string, count: number) => {
    try {
      await recallService.notifyHospitals(id);
      showToast("success", "Notifications Sent", `${count} holding facilities notified about recall of ${name}`);
      loadRecalls();
    } catch (e: any) {
      showToast("error", "Notification Failed", e.message || "Failed to notify hospitals");
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-700 flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Drug Recall Management</h2>
            <p className="text-sm text-slate-500">Active recall notices and automated facility quarantine tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRecalls}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Recalls"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="text-center px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs">
            <span className="font-bold font-mono text-rose-700">{recalls.filter((r) => r.status === "Active").length}</span> Active
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {recalls.map((recall) => {
          const cfg = severityConfig[recall.severity] || severityConfig.High;
          return (
            <div key={recall.id} className={`rounded-xl border ${cfg.border} bg-white shadow-sm overflow-hidden`}>
              <div className={`${cfg.bg} px-5 py-4 border-b ${cfg.border} flex items-center justify-between flex-wrap gap-2`}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    {recall.severity} SEVERITY
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-500">{recall.id}</span>
                  <p className="font-bold text-slate-900 font-display">{recall.drugName}</p>
                  <span className="font-mono text-xs text-rose-700 bg-rose-100 px-2 py-0.5 rounded font-bold">
                    Batch: {recall.batchNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={recall.status} size="sm" />
                  <span className="text-xs text-slate-400">Initiated: {recall.date}</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Recall Reason</p>
                  <p className="text-sm text-slate-800 mt-1">{recall.reason}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Initiated By</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{recall.initiatedBy}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Affected Quantity</p>
                    <p className="font-bold font-mono text-slate-800 text-sm mt-0.5">{recall.affectedQty.toLocaleString()} units</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Facilities Impacted</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{recall.affectedHospitals} facilities</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-400">Quarantine Status</p>
                    <p className="font-bold text-rose-600 text-sm mt-0.5">Enforced</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 flex-wrap">
                  <button
                    onClick={() => quarantine(recall.id, recall.batchNumber)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    <AlertTriangle size={13} /> Enforce Quarantine
                  </button>
                  <button
                    onClick={() => notify(recall.id, recall.drugName, recall.affectedHospitals)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Bell size={13} /> Broadcast to Hospitals
                  </button>
                  <button
                    onClick={() => setHistoryBatch(recall.batchNumber)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <History size={13} /> Distribution History
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!historyBatch} onClose={() => setHistoryBatch(null)} title="Recall Distribution History" subtitle={`Supply lineage for batch ${historyBatch}`} size="md">
        {historyBatch && <RecallHistory batchNumber={historyBatch} onClose={() => setHistoryBatch(null)} />}
      </Modal>
    </div>
  );
}
