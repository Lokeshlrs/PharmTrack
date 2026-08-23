import { useState, useEffect } from "react";
import { Truck, MapPin, Package, Calendar, ChevronDown, ChevronUp, Plus, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { shipments as initialShipments, type Shipment, type ShipmentStatus, suppliers as defaultSuppliers, hospitals as defaultHospitals, drugs as defaultDrugs } from "../data/mockData";
import { shipmentService } from "../services/procurementService";
import { drugService } from "../services/inventoryService";
import { supplierService, hospitalService } from "../services/supplierService";
import { subscribeToEvent } from "../services/socketService";

const STEPS: ShipmentStatus[] = ["Order Placed", "Approved", "Packed", "Dispatched", "In Transit", "Arrived", "Received"];

function ShipmentTimeline({ status }: { status: ShipmentStatus }) {
  const current = STEPS.indexOf(status);
  return (
    <div className="mt-3">
      <div className="flex items-center gap-0.5">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className={`w-3 h-3 rounded-full border-2 shrink-0 transition-all ${i < current ? "bg-teal-500 border-teal-500" : i === current ? "bg-teal-500 border-teal-500 ring-2 ring-teal-100" : "bg-white border-slate-300"}`} />
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < current ? "bg-teal-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {STEPS.map((step, i) => (
          <span key={step} className={`text-[9px] text-center ${i === STEPS.indexOf(status) ? "text-teal-600 font-semibold" : "text-slate-400"}`} style={{ width: `${100 / STEPS.length}%` }}>
            {step.split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

function NewShipmentModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { showToast } = useToast();
  const [drugsList, setDrugsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [form, setForm] = useState({ drug: "", supplier: "", origin: "", destination: "", qty: "", batch: "", dispatch: "", expected: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dList, sList, hList] = await Promise.allSettled([
          drugService.list(),
          supplierService.list(),
          hospitalService.list(),
        ]);
        if (dList.status === "fulfilled" && dList.value?.length) setDrugsList(dList.value);
        if (sList.status === "fulfilled" && sList.value?.length) setSuppliersList(sList.value);
        if (hList.status === "fulfilled" && hList.value?.length) setHospitalsList(hList.value);
      } catch {
        // Fallback
      }
    };
    fetchOptions();
  }, []);

  const activeDrugs = drugsList.length > 0 ? drugsList : defaultDrugs;
  const activeSuppliers = suppliersList.length > 0 ? suppliersList : defaultSuppliers;
  const activeHospitals = hospitalsList.length > 0 ? hospitalsList : defaultHospitals;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.drug || !form.supplier || !form.qty) {
      showToast("error", "Missing fields", "Drug formulation, supplier and quantity are required");
      return;
    }
    setSubmitting(true);
    try {
      const created = await shipmentService.create({
        supplierName: form.supplier,
        supplierId: "S001",
        origin: form.origin || "Supplier Warehouse, Mumbai",
        destination: form.destination || "Central Warehouse, Delhi",
        drugName: form.drug,
        quantity: Number(form.qty),
        batchNumber: form.batch || `BATCH-${Date.now().toString().slice(-6)}`,
        dispatchDate: form.dispatch || new Date().toISOString().split("T")[0],
        expectedArrival: form.expected || "In 2 Days",
      });
      showToast("success", "Shipment Dispatched", `Shipment ${created.shipmentId || "SHP"} created for ${form.qty} units`);
      onSave();
      onClose();
    } catch (e: any) {
      showToast("error", "Creation Failed", e.message || "Failed to create shipment");
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
              <option key={d.drugId || d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          {lbl("Supplier Organization *")}
          <select value={form.supplier} onChange={set("supplier")} className={fieldCls}>
            <option value="">Select supplier…</option>
            {activeSuppliers.map((s) => (
              <option key={s.supplierId || s.id || s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>{lbl("Quantity (units) *")}<input type="number" placeholder="units" value={form.qty} onChange={set("qty")} className={fieldCls} /></div>
        <div>{lbl("Origin Dispatch Hub")}<input placeholder="e.g. Mumbai Hub" value={form.origin} onChange={set("origin")} className={fieldCls} /></div>
        <div>
          {lbl("Destination Facility")}
          <select value={form.destination} onChange={set("destination")} className={fieldCls}>
            <option value="">Select hospital / hub…</option>
            {activeHospitals.map((h) => (
              <option key={h.hospitalId || h.id || h.name} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>{lbl("Batch Number")}<input placeholder="e.g. PCM-2025-9901" value={form.batch} onChange={set("batch")} className={fieldCls} /></div>
        <div>{lbl("Expected Arrival")}<input type="date" value={form.expected} onChange={set("expected")} className={fieldCls} /></div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          disabled={submitting}
          onClick={submit}
          className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Shipment"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Shipments() {
  const { showToast } = useToast();
  const [shipmentsList, setShipmentsList] = useState<Shipment[]>(initialShipments);
  const [newOpen, setNewOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>("SHP-2025-001");
  const [loading, setLoading] = useState(false);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const data = await shipmentService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.shipmentId || d._id,
          supplierId: d.supplierId || "S001",
          supplierName: d.supplierName,
          origin: d.origin,
          destination: d.destination,
          drugName: d.drugName,
          quantity: d.quantity,
          batchNumber: d.batchNumber,
          dispatchDate: d.dispatchDate,
          expectedArrival: d.expectedArrival,
          status: d.status as ShipmentStatus,
          progress: d.progress,
          currentLocation: d.currentLocation,
        }));
        setShipmentsList(mapped);
      }
    } catch (e) {
      console.warn("Using default shipments list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
    const unsub = subscribeToEvent("shipment:updated", () => loadShipments());
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, newStatus: ShipmentStatus) => {
    try {
      await shipmentService.updateStatus(id, newStatus);
      showToast("info", "Shipment Updated", `${id} status advanced to ${newStatus}`);
      loadShipments();
    } catch (e: any) {
      showToast("error", "Update Failed", e.message || "Failed to update shipment status");
    }
  };

  const filtered = statusFilter === "All" ? shipmentsList : shipmentsList.filter((s) => s.status === statusFilter);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Shipment Tracking</h2>
          <p className="text-sm text-slate-500">{shipmentsList.length} shipments · {shipmentsList.filter((s) => s.status === "In Transit").length} in transit</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadShipments}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Shipments"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setNewOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
            <Truck size={14} /> New Shipment
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...STEPS].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            style={statusFilter === s ? { backgroundColor: "#0a1628" } : {}}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button className="w-full text-left p-4" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-teal-600">{s.id}</span>
                      <StatusBadge status={s.status} size="sm" />
                    </div>
                    <p className="font-semibold text-slate-900 font-display mt-0.5">{s.drugName}</p>
                    <p className="text-xs text-slate-400 truncate">{s.origin} → {s.destination}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-500 ml-1">{s.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">ETA</p>
                    <p className="text-sm font-mono font-semibold text-slate-700">{s.expectedArrival}</p>
                    {expanded === s.id ? <ChevronUp size={13} className="text-slate-400 mt-1 ml-auto" /> : <ChevronDown size={13} className="text-slate-400 mt-1 ml-auto" />}
                  </div>
                </div>
              </button>

              {expanded === s.id && (
                <div className="px-4 pb-4 border-t border-slate-50">
                  <ShipmentTimeline status={s.status} />
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-slate-50 p-3 rounded-lg">
                    <div><span className="text-slate-400">Batch:</span> <span className="font-mono font-medium">{s.batchNumber}</span></div>
                    <div><span className="text-slate-400">Quantity:</span> <span className="font-mono font-medium">{s.quantity.toLocaleString()}</span></div>
                    <div><span className="text-slate-400">Supplier:</span> <span>{s.supplierName}</span></div>
                    <div><span className="text-slate-400">Location:</span> <span>{s.currentLocation}</span></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {s.status !== "Received" && (
                      <button
                        onClick={() => {
                          const idx = STEPS.indexOf(s.status);
                          if (idx < STEPS.length - 1) updateStatus(s.id, STEPS[idx + 1]);
                        }}
                        className="flex-1 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition"
                      >
                        Advance to {STEPS[Math.min(STEPS.length - 1, STEPS.indexOf(s.status) + 1)]}
                      </button>
                    )}
                    <button
                      onClick={() => showToast("info", "Tracking Link Copied", `GPS tracking link for ${s.id} copied`)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50 transition"
                    >
                      Share GPS
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Route Map Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-800 font-display text-sm mb-3">Live Transit Corridors</h3>
            <div className="space-y-3">
              {[
                { route: "Mumbai → Delhi", count: 3, status: "Active", time: "Avg 18h" },
                { route: "Hyderabad → Bengaluru", count: 2, status: "Active", time: "Avg 9h" },
                { route: "Ahmedabad → Jaipur", count: 1, status: "Active", time: "Avg 11h" },
                { route: "Kolkata → Guwahati", count: 1, status: "Delayed", time: "Avg 28h" },
              ].map((r) => (
                <div key={r.route} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{r.route}</p>
                    <p className="text-slate-400 text-[11px]">{r.time} · {r.count} in transit</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${r.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Shipment" subtitle="Register outbound consignment" size="md">
        <NewShipmentModal onClose={() => setNewOpen(false)} onSave={loadShipments} />
      </Modal>
    </div>
  );
}
