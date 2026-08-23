import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Filter, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { procurementOrders as defaultOrders, suppliers as defaultSuppliers, drugs as defaultDrugs } from "../data/mockData";
import { procurementService } from "../services/procurementService";
import { drugService } from "../services/inventoryService";
import { supplierService } from "../services/supplierService";
import { subscribeToEvent } from "../services/socketService";

type POStatus = "Pending" | "Approved" | "Confirmed" | "Delivered" | "Cancelled";

interface PO {
  id: string; drugName: string; supplier: string; quantity: number;
  unitPrice: number; totalValue: number; status: POStatus;
  createdDate: string; expectedDelivery: string; hospital: string;
}

function NewPOModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { showToast } = useToast();
  const [drugsList, setDrugsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [form, setForm] = useState({ drug: "", supplier: "", qty: "", hospital: "", delivery: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [dList, sList] = await Promise.all([drugService.list(), supplierService.list()]);
        if (dList?.length) setDrugsList(dList);
        if (sList?.length) setSuppliersList(sList);
      } catch {
        // Fallback
      }
    };
    fetchDependencies();
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const activeDrugs = drugsList.length > 0 ? drugsList : defaultDrugs;
  const activeSuppliers = suppliersList.length > 0 ? suppliersList : defaultSuppliers;

  const selectedDrug = activeDrugs.find((d) => d.name === form.drug);
  const unitPrice = selectedDrug?.unitPrice ?? 10;
  const totalValue = selectedDrug ? Number(form.qty || 0) * unitPrice : 0;

  const submit = async () => {
    if (!form.drug || !form.supplier || !form.qty) {
      showToast("error", "Missing fields", "Drug, supplier and quantity are required");
      return;
    }
    setSubmitting(true);
    try {
      const created = await procurementService.create({
        drugName: form.drug,
        drugId: selectedDrug?.drugId || selectedDrug?.id || "D001",
        supplier: form.supplier,
        quantity: Number(form.qty),
        unitPrice,
        totalValue,
        hospital: form.hospital || "Central Warehouse, Delhi",
      });
      showToast("success", "Purchase Order Created", `${created.poNumber || "PO"} generated for ${form.qty} units`);
      onSave();
      onClose();
    } catch (err: any) {
      showToast("error", "Creation Failed", err.message || "Failed to create purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 bg-white";
  const lbl = (t: string) => <label className="text-xs font-medium text-slate-600 mb-1 block">{t}</label>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          {lbl("Drug Formulation *")}
          <select value={form.drug} onChange={set("drug")} className={fieldCls}>
            <option value="">Select drug formulation…</option>
            {activeDrugs.map((d) => (
              <option key={d.drugId || d.id || d.name} value={d.name}>
                {d.name} (₹{d.unitPrice?.toFixed(2) || "0.00"}/unit)
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          {lbl("Supplier Organization *")}
          <select value={form.supplier} onChange={set("supplier")} className={fieldCls}>
            <option value="">Select supplier…</option>
            {activeSuppliers.map((s) => (
              <option key={s.supplierId || s.id || s.name} value={s.name}>
                {s.name} ({s.city || "National"})
              </option>
            ))}
          </select>
        </div>
        <div>
          {lbl("Order Quantity (units) *")}
          <input type="number" placeholder="e.g. 10000" value={form.qty} onChange={set("qty")} className={fieldCls} />
        </div>
        <div>
          {lbl("Estimated Total (₹)")}
          <input readOnly value={totalValue > 0 ? `₹${totalValue.toLocaleString()}` : "—"} className={`${fieldCls} bg-slate-50 font-mono text-slate-600`} />
        </div>
        <div>
          {lbl("Destination Facility")}
          <input placeholder="e.g. AIIMS New Delhi" value={form.hospital} onChange={set("hospital")} className={fieldCls} />
        </div>
        <div>
          {lbl("Expected Delivery Date")}
          <input type="date" value={form.delivery} onChange={set("delivery")} className={fieldCls} />
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          disabled={submitting}
          onClick={submit}
          className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating PO..." : "Create Purchase Order"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function PODetailModal({ po, onClose, onApprove }: { po: PO; onClose: () => void; onApprove: (id: string) => void }) {
  const { showToast } = useToast();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "PO Number", value: po.id },
          { label: "Status", value: <StatusBadge status={po.status} /> },
          { label: "Drug", value: po.drugName },
          { label: "Supplier", value: po.supplier },
          { label: "Quantity", value: `${po.quantity.toLocaleString()} units` },
          { label: "Unit Price", value: `₹${po.unitPrice.toFixed(2)}` },
          { label: "Total Value", value: `₹${po.totalValue >= 100000 ? `${(po.totalValue / 100000).toFixed(2)}L` : po.totalValue.toLocaleString()}` },
          { label: "Destination", value: po.hospital },
          { label: "Created", value: po.createdDate },
          { label: "Expected Delivery", value: po.expectedDelivery },
        ].map((f) => (
          <div key={f.label} className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400">{f.label}</p>
            <div className="font-semibold text-slate-800 font-mono text-sm mt-0.5">{f.value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        {po.status === "Pending" && (
          <button onClick={() => { onApprove(po.id); onClose(); }}
            className="flex items-center gap-2 flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 justify-center transition-colors">
            <CheckCircle size={14} /> Approve PO
          </button>
        )}
        <button onClick={() => { showToast("info", "PDF Generated", `Purchase order ${po.id} downloaded`); }}
          className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Download PDF
        </button>
        {po.status === "Pending" && (
          <button onClick={() => { showToast("warning", "PO Cancelled", `${po.id} cancelled`); onClose(); }}
            className="flex items-center gap-2 flex-1 py-2 bg-rose-50 text-rose-600 text-sm rounded-lg hover:bg-rose-100 justify-center transition-colors border border-rose-200">
            <XCircle size={14} /> Cancel PO
          </button>
        )}
      </div>
    </div>
  );
}

export default function Procurement() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<PO[]>(defaultOrders as PO[]);
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<PO | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const loadPOs = async () => {
    setLoading(true);
    try {
      const data = await procurementService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.poNumber || d._id,
          drugName: d.drugName,
          supplier: d.supplier,
          quantity: d.quantity,
          unitPrice: d.unitPrice,
          totalValue: d.totalValue,
          status: d.status,
          createdDate: d.createdDate,
          expectedDelivery: d.expectedDelivery,
          hospital: d.hospital,
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.warn("Using default procurement orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOs();
  }, []);

  const approvePO = async (id: string) => {
    try {
      await procurementService.approve(id);
      showToast("success", "PO Approved", `${id} approved and supplier notified`);
      loadPOs();
    } catch (e: any) {
      showToast("error", "Approval Failed", e.message || "Failed to approve purchase order");
    }
  };

  const filtered = statusFilter === "All" ? orders : orders.filter((p) => p.status === statusFilter);
  const totalValue = orders.reduce((s, p) => s + (p.totalValue || 0), 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Purchase Orders</h2>
            <p className="text-sm text-slate-500">{orders.length} orders · Total: ₹{(totalValue / 100000).toFixed(1)}L</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadPOs}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Purchase Orders"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setNewOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
            <Plus size={14} /> New Purchase Order
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Confirmed", "Delivered"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {s} ({s === "All" ? orders.length : orders.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["PO Number", "Drug Formulation", "Supplier", "Quantity", "Total Value", "Status", "Destination", "Delivery"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((po) => (
              <tr key={po.id} onClick={() => setSelected(po)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-teal-700">{po.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 font-display">{po.drugName}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{po.supplier}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">{po.quantity.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-slate-700 font-semibold">₹{(po.totalValue >= 100000 ? `${(po.totalValue / 100000).toFixed(2)}L` : po.totalValue.toLocaleString())}</td>
                <td className="px-4 py-3"><StatusBadge status={po.status} size="sm" /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{po.hospital}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{po.expectedDelivery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Purchase Order" subtitle="Create procurement order" size="md">
        <NewPOModal onClose={() => setNewOpen(false)} onSave={loadPOs} />
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Purchase Order Details" subtitle={selected?.id} size="md">
        {selected && <PODetailModal po={selected} onClose={() => setSelected(null)} onApprove={approvePO} />}
      </Modal>
    </div>
  );
}
