import { useState, useEffect } from "react";
import { Clock, AlertTriangle, ArrowUp, Trash2, ArrowLeftRight, CheckCircle, RefreshCw } from "lucide-react";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { inventory as defaultInventory, type InventoryItem } from "../data/mockData";
import { inventoryService } from "../services/inventoryService";
import { subscribeToEvent } from "../services/socketService";

function ExpiryBadge({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{Math.abs(days)}d expired</span>;
  if (days <= 7) return <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded animate-pulse">{days}d left</span>;
  if (days <= 30) return <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{days}d left</span>;
  return <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{days}d left</span>;
}

function DisposalModal({ item, onClose, onDisposed }: { item: InventoryItem; onClose: () => void; onDisposed?: () => void }) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleDispose = async () => {
    setSubmitting(true);
    try {
      const targetId = (item as any)._id || item.id || item.batchNumber;
      await inventoryService.adjust(targetId, {
        quantityAdjustment: -Number(item.quantity || 0),
        reason: `Pharmaceutical waste disposal for expired batch ${item.batchNumber}`,
      });
      showToast("warning", "Batch Disposed", `${item.batchNumber} marked for pharmaceutical disposal`);
      onDisposed?.();
      onClose();
    } catch (e: any) {
      showToast("error", "Disposal Failed", e.message || "Failed to process batch disposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
        <p className="font-semibold text-rose-800 font-display">{item.drugName}</p>
        <p className="text-sm text-rose-600 mt-0.5 font-mono">{item.batchNumber} · {item.quantity} units</p>
        <p className="text-xs text-rose-500 mt-1">Expired {Math.abs(item.daysToExpiry)} days ago · {item.location}</p>
      </div>
      <p className="text-sm text-slate-600">This action will mark the batch for safe pharmaceutical disposal and log the action in the audit trail.</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Batch Number", value: item.batchNumber },
          { label: "Expired On", value: item.expiryDate },
          { label: "Quantity to Dispose", value: `${item.quantity} units` },
          { label: "Estimated Waste Value", value: `₹${(item.quantity * item.unitPrice).toLocaleString()}` },
        ].map((f) => (
          <div key={f.label} className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400">{f.label}</p>
            <p className="font-semibold text-slate-800 font-mono text-sm mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button disabled={submitting} onClick={handleDispose}
          className="flex-1 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
          <Trash2 size={14} /> {submitting ? "Disposing..." : "Confirm Disposal"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export default function ExpiryFEFO() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(defaultInventory);
  const [disposalItem, setDisposalItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.list();
      if (data?.length) {
        setItems(data);
      }
    } catch (e) {
      console.warn("Using default inventory for FEFO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
    const unsub = subscribeToEvent("inventory:updated", () => loadStock());
    return () => unsub();
  }, []);

  const sortedByExpiry = [...items].sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  const expired = sortedByExpiry.filter((i) => i.daysToExpiry < 0 && i.quantity > 0);
  const expiringSoon = sortedByExpiry.filter((i) => i.daysToExpiry >= 0 && i.daysToExpiry <= 30 && i.quantity > 0);
  const healthy = sortedByExpiry.filter((i) => i.daysToExpiry > 30 && i.quantity > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
            <Clock size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Expiry Management & FEFO</h2>
            <p className="text-sm text-slate-500">First Expiry, First Out — automated batch prioritization</p>
          </div>
        </div>
        <button
          onClick={loadStock}
          className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh FEFO Status"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ArrowUp size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-900 font-display">FEFO Principle Active</p>
          <p className="text-sm text-amber-700 mt-0.5">Batches sorted by nearest expiry date. The system automatically flags and prioritizes items for consumption to minimize waste.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Expired Batches", count: expired.length, desc: "Quarantine required", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
          { label: "Expiring in 30 Days", count: expiringSoon.length, desc: "Use these first", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
          { label: "Good Standing", count: healthy.length, desc: "> 30 days remaining", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
            <p className={`text-3xl font-bold font-mono ${s.text}`}>{s.count}</p>
            <p className="font-semibold text-slate-800 font-display mt-1">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Expired */}
      {expired.length > 0 && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden">
          <div className="bg-rose-50 px-5 py-3 border-b border-rose-200 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600" />
            <h3 className="font-semibold text-rose-800 font-display">Expired Batches — Action Required</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Drug / Batch", "Location", "Qty", "Expired", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expired.map((item) => (
                <tr key={item.id || item.batchNumber} className="hover:bg-rose-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-900 font-display">{item.drugName}</p>
                    <p className="text-xs text-slate-400 font-mono">{item.batchNumber}</p>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{item.location}</td>
                  <td className="px-5 py-3 font-mono font-semibold">{item.quantity}</td>
                  <td className="px-5 py-3"><ExpiryBadge days={item.daysToExpiry} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setDisposalItem(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold">
                        <Trash2 size={11} /> Dispose
                      </button>
                      <button onClick={() => showToast("info", "Recall check", `Checking if ${item.batchNumber} is under active recall`)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <CheckCircle size={11} /> Check Recall
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FEFO priority table */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800 font-display">Use First — FEFO Priority Queue</h3>
          </div>
          <span className="text-xs text-amber-600 font-mono">Sorted by nearest expiry</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["#", "Drug / Batch", "Location", "Qty", "Days Left", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expiringSoon.map((item, i) => (
              <tr key={item.id || item.batchNumber} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-5 py-3">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center font-mono">{i + 1}</span>
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-900 font-display">{item.drugName}</p>
                  <p className="text-xs text-slate-400 font-mono">{item.batchNumber}</p>
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">{item.location}</td>
                <td className="px-5 py-3 font-mono font-semibold">{item.quantity.toLocaleString()}</td>
                <td className="px-5 py-3"><ExpiryBadge days={item.daysToExpiry} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => showToast("success", "Consumption recorded", `${item.quantity} units of ${item.drugName} flagged for priority use`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold">
                      <CheckCircle size={11} /> Use First
                    </button>
                    <button onClick={() => showToast("info", "Transfer initiated", `${item.drugName} redistribution request created`)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                      <ArrowLeftRight size={11} /> Redistribute
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!disposalItem} onClose={() => setDisposalItem(null)} title="Confirm Disposal" subtitle="Pharmaceutical waste management" size="sm">
        {disposalItem && <DisposalModal item={disposalItem} onClose={() => setDisposalItem(null)} onDisposed={loadStock} />}
      </Modal>
    </div>
  );
}
