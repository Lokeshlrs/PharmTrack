import { useState, useEffect } from "react";
import { Hospital, MapPin, BedDouble, Package, Siren, Activity, RefreshCw, Plus, Building2, User, Mail, Phone, Lock } from "lucide-react";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import { hospitals as defaultHospitals, inventory as defaultInventory, emergencyRequests as defaultEmergencyRequests } from "../data/mockData";
import { hospitalService } from "../services/supplierService";
import { inventoryService } from "../services/inventoryService";
import { emergencyService } from "../services/emergencyService";

type HospitalType = typeof defaultHospitals[number];

const hospitalStatus = (h: HospitalType, invList: any[], emgList: any[]) => {
  const er = emgList.find((e) => (e.hospitalId === h.id || e.hospitalName?.includes(h.name.split(" ")[0])) && e.status === "Pending");
  if (er) return { label: "Emergency" as const, color: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" };
  const low = invList.filter((i) => i.location?.includes(h.name.split(" ")[0]) && (i.status === "Critical" || i.status === "Low Stock"));
  if (low.length > 0) return { label: "Low Stock" as const, color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" };
  return { label: "Normal" as const, color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" };
};

function AddHospitalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    type: "Tertiary",
    beds: 500,
    contactPerson: "",
    email: "",
    password: "",
    phone: "",
    status: "Normal",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.state.trim()) {
      showToast("error", "Validation Error", "Hospital name, city, and state are required.");
      return;
    }

    setSubmitting(true);
    try {
      await hospitalService.create({
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        address: form.address.trim() || undefined,
        type: form.type,
        beds: Number(form.beds) || 500,
        contactPerson: form.contactPerson.trim() || undefined,
        email: form.email.trim() || undefined,
        password: form.password.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: form.status,
      });

      showToast("success", "Hospital Added", `${form.name} registered and saved to MongoDB.`);
      onCreated();
      onClose();
    } catch (err: any) {
      showToast("error", "Creation Failed", err.response?.data?.message || err.message || "Failed to add hospital.");
    } finally {
      setSubmitting(false);
    }
  };

  const fc = "w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white";
  const lbl = (t: string) => <label className="text-xs text-slate-500 mb-1 block font-medium">{t}</label>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        {lbl("Hospital Name *")}
        <input
          required
          placeholder="e.g. Apollo Hospital, Chennai"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={fc}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {lbl("City *")}
          <input
            required
            placeholder="e.g. Chennai"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={fc}
          />
        </div>
        <div>
          {lbl("State *")}
          <input
            required
            placeholder="e.g. Tamil Nadu"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className={fc}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {lbl("Category / Care Level")}
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={fc}
          >
            <option value="Tertiary">Tertiary Care</option>
            <option value="Secondary">Secondary Care</option>
            <option value="Primary">Primary Health Center</option>
          </select>
        </div>
        <div>
          {lbl("Bed Capacity")}
          <input
            type="number"
            min={10}
            max={10000}
            value={form.beds}
            onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })}
            className={fc}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {lbl("Contact Person")}
          <input
            placeholder="e.g. Dr. K. Ramanathan"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            className={fc}
          />
        </div>
        <div>
          {lbl("Phone Number")}
          <input
            placeholder="+91 44 2829 0200"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={fc}
          />
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <p className="text-xs font-semibold text-slate-700">Hospital Portal Account (Optional)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            {lbl("Official Email")}
            <input
              type="email"
              placeholder="admin@hospital.org"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fc}
            />
          </div>
          <div>
            {lbl("Initial Password")}
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={fc}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving to Database..." : "Register Hospital"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function HospitalDetail({ h, onClose, invList, emgList }: { h: HospitalType; onClose: () => void; invList: any[]; emgList: any[] }) {
  const { showToast } = useToast();
  const status = hospitalStatus(h, invList, emgList);
  const erReqs = emgList.filter((e) => e.hospitalId === h.id || e.hospitalName?.includes(h.name.split(" ")[0]));
  const invItems = invList.filter((i) => i.location?.includes(h.name.split(" ")[0]) || i.location?.toLowerCase().includes(h.city.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Hospital size={22} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 font-display">{h.name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <MapPin size={11} />{h.city}, {h.state}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <BedDouble size={11} />{h.beds.toLocaleString()} beds · {h.type} Care
          </div>
        </div>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>{status.label}</span>
      </div>

      {erReqs.length > 0 && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
          <p className="text-sm font-semibold text-rose-800 font-display mb-2 flex items-center gap-1">
            <Siren size={14} /> {erReqs.length} Emergency Request{erReqs.length > 1 ? "s" : ""}
          </p>
          {erReqs.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs mb-1">
              <span className="text-rose-700">{e.drugName} — {e.requiredQty} units</span>
              <StatusBadge status={e.status} size="sm" />
            </div>
          ))}
        </div>
      )}

      {invItems.length > 0 ? (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Inventory at this location</p>
          <div className="space-y-2">
            {invItems.map((item) => (
              <div key={item.id || item.batchNumber} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.drugName}</p>
                  <p className="text-xs text-slate-400 font-mono">{item.batchNumber}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={item.status} size="sm" />
                  <p className="text-xs font-mono text-slate-600 mt-1">{item.quantity.toLocaleString()} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">No inventory records for this hospital</p>
      )}

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button onClick={() => { showToast("success", "Alert sent", `Stock alert notification sent to ${h.name}`); onClose(); }}
          className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
          Send Alert
        </button>
        <button onClick={() => showToast("info", "Report ready", `Inventory report for ${h.name} generated`)}
          className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          View Full Report
        </button>
      </div>
    </div>
  );
}

export default function Hospitals() {
  const [hospitalList, setHospitalList] = useState<HospitalType[]>(defaultHospitals);
  const [invList, setInvList] = useState<any[]>(defaultInventory);
  const [emgList, setEmgList] = useState<any[]>(defaultEmergencyRequests);
  const [selected, setSelected] = useState<HospitalType | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [hRes, iRes, eRes] = await Promise.allSettled([
        hospitalService.list(),
        inventoryService.list(),
        emergencyService.list(),
      ]);
      if (hRes.status === "fulfilled" && hRes.value?.length) {
        const mapped = hRes.value.map((d: any) => ({
          id: d.hospitalId || d._id,
          name: d.name,
          city: d.city,
          state: d.state,
          type: d.type || "Tertiary",
          beds: d.beds || 500,
          status: d.status || "Normal",
        }));
        setHospitalList(mapped);
      }
      if (iRes.status === "fulfilled" && iRes.value?.length) setInvList(iRes.value);
      if (eRes.status === "fulfilled" && eRes.value?.length) setEmgList(eRes.value);
    } catch (e) {
      console.warn("Using default hospitals list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
            <Hospital size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Hospital Network</h2>
            <p className="text-sm text-slate-500">{hospitalList.length} hospitals across national grid · Click for details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus size={14} /> Add Hospital
          </button>
          <button
            onClick={loadAll}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Network"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Normal Operations", count: hospitalList.filter((h) => hospitalStatus(h, invList, emgList).label === "Normal").length, bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
          { label: "Low Buffer Stock", count: hospitalList.filter((h) => hospitalStatus(h, invList, emgList).label === "Low Stock").length, bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
          { label: "Emergency Alerts", count: emgList.filter((e) => e.status === "Pending").length, bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold font-mono ${s.text}`}>{s.count}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitalList.map((h) => {
          const status = hospitalStatus(h, invList, emgList);
          const erCount = emgList.filter((e) => e.hospitalId === h.id || e.hospitalName?.includes(h.name.split(" ")[0])).length;
          return (
            <button key={h.id} onClick={() => setSelected(h)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-teal-200 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                  <Hospital size={18} className="text-slate-500 group-hover:text-teal-600 transition-colors" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 font-display group-hover:text-teal-700 transition-colors">{h.name}</h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                <MapPin size={11} />{h.city}, {h.state}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                <BedDouble size={11} />{h.beds.toLocaleString()} beds · {h.type}
              </div>
              {erCount > 0 && (
                <div className="mt-3 flex items-center gap-1 text-xs text-rose-600 font-semibold">
                  <Siren size={11} />{erCount} active emergency request{erCount > 1 ? "s" : ""}
                </div>
              )}
              <div className="mt-2 flex items-center gap-1 text-xs text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Activity size={11} /> Click to view details
              </div>
            </button>
          );
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Hospital Details" subtitle={selected?.name} size="md">
        {selected && <HospitalDetail h={selected} onClose={() => setSelected(null)} invList={invList} emgList={emgList} />}
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Hospital" subtitle="Add healthcare facility node to national network" size="md">
        <AddHospitalModal onClose={() => setAddModalOpen(false)} onCreated={loadAll} />
      </Modal>
    </div>
  );
}
