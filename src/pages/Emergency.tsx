import { useState, useEffect } from "react";
import { Siren, MapPin, Clock, CheckCircle, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { emergencyRequests as defaultEmergencyRequests, type EmergencyRequest, drugs as defaultDrugs, hospitals as defaultHospitals } from "../data/mockData";
import { emergencyService } from "../services/emergencyService";
import { drugService } from "../services/inventoryService";
import { hospitalService } from "../services/supplierService";
import { subscribeToEvent } from "../services/socketService";

const priorityConfig = {
  Critical: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  High: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  Medium: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
};

function CreateEmergencyModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast();
  const [drugsList, setDrugsList] = useState<any[]>([]);
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [form, setForm] = useState({ drug: "", hospital: "", qty: "", priority: "Critical", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dList, hList] = await Promise.allSettled([drugService.list(), hospitalService.list()]);
        if (dList.status === "fulfilled" && dList.value?.length) setDrugsList(dList.value);
        if (hList.status === "fulfilled" && hList.value?.length) setHospitalsList(hList.value);
      } catch {
        // Fallback
      }
    };
    fetchOptions();
  }, []);

  const activeDrugs = drugsList.length > 0 ? drugsList : defaultDrugs;
  const activeHospitals = hospitalsList.length > 0 ? hospitalsList : defaultHospitals;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.drug || !form.hospital || !form.qty) {
      showToast("error", "Missing fields", "Drug, requesting hospital, and quantity are required");
      return;
    }
    setSubmitting(true);
    try {
      const selectedDrug = activeDrugs.find((d) => d.name === form.drug);
      const selectedHosp = activeHospitals.find((h) => h.name === form.hospital);

      const created = await emergencyService.create({
        hospitalId: selectedHosp?.hospitalId || selectedHosp?.id || "H001",
        hospitalName: form.hospital,
        drugId: selectedDrug?.drugId || selectedDrug?.id || "D001",
        drugName: form.drug,
        requiredQty: Number(form.qty),
        urgencyLevel: form.priority,
        reason: form.reason || "Urgent hospital stockout",
      });

      showToast("success", "Emergency Request Broadcasted", `SOS ${created.requestId || "REQ"} submitted to regional hubs`);
      onCreated();
      onClose();
    } catch (e: any) {
      showToast("error", "Submission Failed", e.message || "Failed to submit emergency request");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400 bg-white";
  const lbl = (t: string) => <label className="text-xs font-medium text-slate-600 mb-1 block">{t}</label>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          {lbl("Critical Drug Formulation *")}
          <select value={form.drug} onChange={set("drug")} className={fieldCls}>
            <option value="">Select drug…</option>
            {activeDrugs.map((d) => (
              <option key={d.drugId || d.id || d.name} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          {lbl("Requesting Facility *")}
          <select value={form.hospital} onChange={set("hospital")} className={fieldCls}>
            <option value="">Select hospital…</option>
            {activeHospitals.map((h) => (
              <option key={h.hospitalId || h.id || h.name} value={h.name}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          {lbl("Required Quantity (units) *")}
          <input type="number" placeholder="e.g. 200" value={form.qty} onChange={set("qty")} className={fieldCls} />
        </div>
        <div>
          {lbl("Urgency Level")}
          <select value={form.priority} onChange={set("priority")} className={fieldCls}>
            <option value="Critical">Critical (Within 2-4 Hours)</option>
            <option value="High">High (Within 12 Hours)</option>
            <option value="Medium">Medium (Within 24 Hours)</option>
          </select>
        </div>
        <div className="col-span-2">
          {lbl("Clinical Justification / Reason")}
          <textarea
            rows={2}
            placeholder="e.g. Intensive Care Unit sudden patient surge"
            value={form.reason}
            onChange={set("reason")}
            className={fieldCls}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          disabled={submitting}
          onClick={submit}
          className="flex-1 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Broadcasting SOS..." : "Broadcast Emergency SOS"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Emergency() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<EmergencyRequest[]>(defaultEmergencyRequests);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await emergencyService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.requestId || d._id,
          hospitalId: d.hospitalId,
          hospitalName: d.hospitalName,
          drugName: d.drugName,
          requiredQty: d.requiredQty,
          priority: (d.urgencyLevel || d.priority) as "Critical" | "High" | "Medium",
          requiredBy: d.requiredBy || "Immediate (4h)",
          status: d.status,
          recommendedSource: d.recommendedSource || "Central Warehouse, Delhi",
          distance: d.distance || 18,
          createdAt: d.createdAt || new Date().toISOString(),
        }));
        setRequests(mapped);
      }
    } catch (e) {
      console.warn("Using default emergency requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const unsub = subscribeToEvent("emergency:new", () => loadRequests());
    return () => unsub();
  }, []);

  const approve = async (id: string) => {
    try {
      await emergencyService.approve(id);
      showToast("success", "Emergency Transfer Approved", `Priority escort shipment dispatched for ${id}`);
      loadRequests();
    } catch (e: any) {
      showToast("error", "Approval Failed", e.message || "Failed to approve emergency request");
    }
  };

  const pending = requests.filter((r) => r.status === "Pending");
  const approved = requests.filter((r) => r.status === "Approved" || r.status === "Sourcing" || r.status === "In Transit");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center">
            <Siren size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Emergency Drug Requests</h2>
            <p className="text-sm text-slate-500">Real-time hospital emergency procurement and rapid escort dispatch</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadRequests}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Emergency Requests"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
          >
            <Plus size={14} /> Raise Emergency Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
          <p className="text-2xl font-bold font-mono text-rose-700">{pending.length}</p>
          <p className="text-xs text-rose-600 font-semibold mt-1">Pending Approval</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-2xl font-bold font-mono text-amber-700">{approved.length}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">In Transit / Dispatched</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-2xl font-bold font-mono text-emerald-700">18 min</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Avg Response Time</p>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-2xl font-bold font-mono text-blue-700">99.4%</p>
          <p className="text-xs text-blue-600 font-semibold mt-1">Fulfillment Rate</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 font-display mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" />
            Pending Emergency Approvals ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map((req) => {
              const pcfg = priorityConfig[req.priority] || priorityConfig.Medium;
              return (
                <div key={req.id} className={`rounded-xl border ${pcfg.border} ${pcfg.bg} p-5`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pcfg.bg} ${pcfg.text} border ${pcfg.border}`}>
                          {req.priority} PRIORITY
                        </span>
                        <span className="font-mono text-xs text-slate-500">{req.id}</span>
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        {[
                          { label: "Drug Required", value: req.drugName },
                          { label: "Quantity", value: `${req.requiredQty.toLocaleString()} units` },
                          { label: "Requesting Hospital", value: req.hospitalName },
                          { label: "Required By", value: req.requiredBy },
                        ].map((f) => (
                          <div key={f.label}>
                            <p className="text-xs text-slate-500">{f.label}</p>
                            <p className="font-semibold text-slate-900 text-sm font-display mt-0.5">{f.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-white/80">
                        <MapPin size={14} className="text-teal-600 shrink-0" />
                        <p className="text-sm">
                          <span className="text-slate-500">Recommended Source: </span>
                          <span className="font-semibold text-teal-700">{req.recommendedSource}</span>
                          <span className="text-slate-400 ml-2 font-mono text-xs">{req.distance} km away</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => approve(req.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <CheckCircle size={14} /> Approve Transfer
                      </button>
                      <button
                        onClick={() => showToast("info", "Depot Locator", `Proximity query completed for ${req.hospitalName}`)}
                        className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Reassign Source
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={11} />
                    Raised: {new Date(req.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 font-display mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" />
            In Transit & Dispatched ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{req.id}</span>
                    <StatusBadge status={req.status} size="sm" />
                    <span className={`text-xs font-semibold ${priorityConfig[req.priority]?.text || "text-slate-600"}`}>{req.priority}</span>
                  </div>
                  <p className="font-semibold text-slate-900 font-display">{req.drugName} — {req.requiredQty.toLocaleString()} units</p>
                  <p className="text-sm text-slate-500 mt-0.5">{req.hospitalName} · {req.requiredBy} window</p>
                  <p className="text-xs text-teal-600 mt-1">Source: {req.recommendedSource} ({req.distance} km)</p>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {new Date(req.createdAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Raise Emergency Request" subtitle="Immediate priority dispatch" size="md">
        <CreateEmergencyModal onClose={() => setCreateOpen(false)} onCreated={loadRequests} />
      </Modal>
    </div>
  );
}
