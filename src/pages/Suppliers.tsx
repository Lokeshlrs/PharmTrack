import { useState, useEffect } from "react";
import { Building2, Star, Mail, MapPin, TrendingUp, Package, BarChart2, RefreshCw, Plus, Phone, User, Lock, CheckCircle2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { suppliers as defaultSuppliers } from "../data/mockData";
import { supplierService } from "../services/supplierService";

type Supplier = typeof defaultSuppliers[number];

function AddSupplierModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.state.trim() || !form.email.trim()) {
      showToast("error", "Validation Error", "Supplier name, city, state, and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      await supplierService.create({
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        address: form.address.trim() || undefined,
        contactPerson: form.contactPerson.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        password: form.password.trim() || undefined,
        onTime: 92,
        quality: 95,
        fulfillment: 90,
      });

      showToast("success", "Supplier Added", `${form.name} registered and saved to MongoDB.`);
      onCreated();
      onClose();
    } catch (err: any) {
      showToast("error", "Creation Failed", err.response?.data?.message || err.message || "Failed to add supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  const fc = "w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white";
  const lbl = (t: string) => <label className="text-xs text-slate-500 mb-1 block font-medium">{t}</label>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        {lbl("Supplier / Company Name *")}
        <input
          required
          placeholder="e.g. Bharat Biotech International"
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
            placeholder="e.g. Hyderabad"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={fc}
          />
        </div>
        <div>
          {lbl("State *")}
          <input
            required
            placeholder="e.g. Telangana"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className={fc}
          />
        </div>
      </div>

      <div>
        {lbl("Registered Facility Address")}
        <input
          placeholder="e.g. Genome Valley, Shamirpet"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className={fc}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          {lbl("Contact Person")}
          <input
            placeholder="e.g. Rajesh Reddy"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            className={fc}
          />
        </div>
        <div>
          {lbl("Phone Number")}
          <input
            placeholder="+91 40 2348 0567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={fc}
          />
        </div>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <p className="text-xs font-semibold text-slate-700">Supplier Portal Account</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            {lbl("Official Email *")}
            <input
              type="email"
              required
              placeholder="supply@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fc}
            />
          </div>
          <div>
            {lbl("Initial Password (Optional)")}
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
          className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving to Database..." : "Register Supplier"}
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

function SupplierDetail({ s, onClose }: { s: Supplier; onClose: () => void }) {
  const { showToast } = useToast();
  const radarData = [
    { metric: "On-Time", value: s.onTime || 92 },
    { metric: "Quality", value: s.quality || 95 },
    { metric: "Fulfillment", value: s.fulfillment || 90 },
    { metric: "Reliability", value: Math.max(70, 100 - (s.rejectedBatches || 0) * 3) },
    { metric: "Response", value: 92 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
          <Building2 size={22} className="text-teal-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 font-display">{s.name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <MapPin size={11} />{s.city}, {s.state}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Mail size={11} />{s.contact}
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className={`text-2xl font-bold font-mono ${s.score >= 90 ? "text-emerald-600" : s.score >= 85 ? "text-amber-600" : "text-rose-600"}`}>{s.score}%</p>
          <p className="text-xs text-slate-400">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[{ label: "On-Time", val: s.onTime }, { label: "Quality", val: s.quality }, { label: "Fulfillment", val: s.fulfillment }].map((m) => (
          <div key={m.label} className="p-3 bg-slate-50 rounded-xl">
            <p className="text-lg font-bold font-mono text-slate-900">{m.val}%</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-lg font-bold font-mono text-slate-900">{s.totalOrders}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Orders</p>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-lg font-bold font-mono text-rose-600">{s.rejectedBatches}</p>
          <p className="text-xs text-rose-500 mt-0.5">Rejected Batches</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-lg font-bold font-mono text-amber-600">{s.delayedShipments}</p>
          <p className="text-xs text-amber-500 mt-0.5">Delayed Shipments</p>
        </div>
      </div>

      {/* Radar */}
      <div>
        <h4 className="font-semibold text-slate-800 font-display text-sm mb-2">Performance Radar</h4>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
            <Radar name="Performance" dataKey="value" stroke="#0d9488" fill="#0d9488" fillOpacity={0.25} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button onClick={() => { showToast("info", "Message sent", `Contact request sent to ${s.name}`); onClose(); }} className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
          Contact Supplier
        </button>
        <button onClick={() => { showToast("info", "Report generated", `Audit scorecard downloaded for ${s.name}`); }} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Download Report
        </button>
      </div>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 90 ? "bg-emerald-500" : value >= 80 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono font-bold text-slate-700 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function Suppliers() {
  const [supplierList, setSupplierList] = useState<Supplier[]>(defaultSuppliers);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.list();
      if (data?.length) {
        const mapped = data.map((d: any) => ({
          id: d.supplierId || d._id,
          name: d.name,
          contact: d.email || d.contactPerson || "contact@pharma.com",
          city: d.city || "Mumbai",
          state: d.state || "Maharashtra",
          score: d.compositeScore || d.score || 90,
          onTime: d.onTimeDeliveryRate ?? d.onTime ?? 92,
          quality: d.qualityScore ?? d.quality ?? 95,
          fulfillment: d.fulfillmentRate ?? d.fulfillment ?? 90,
          rejectedBatches: d.rejectedBatches ?? 0,
          delayedShipments: d.delayedShipments ?? 1,
          totalOrders: d.totalOrders ?? 24,
        }));
        setSupplierList(mapped);
      }
    } catch (e) {
      console.warn("Using default suppliers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const sorted = [...supplierList].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Supplier Management</h2>
            <p className="text-sm text-slate-500">{supplierList.length} registered suppliers · Click a supplier for scorecards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Supplier
          </button>
          <button
            onClick={loadSuppliers}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Suppliers"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg. Composite Score", value: `${(supplierList.reduce((s, x) => s + x.score, 0) / Math.max(1, supplierList.length)).toFixed(1)}%`, icon: BarChart2, color: "text-teal-600", bg: "bg-teal-50 border-teal-200" },
          { label: "Total Orders Executed", value: supplierList.reduce((s, x) => s + x.totalOrders, 0), icon: Package, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Total Rejected Batches", value: supplierList.reduce((s, x) => s + x.rejectedBatches, 0), icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
          { label: "Tier 1 Partners (>90%)", value: supplierList.filter((s) => s.score >= 90).length, icon: Star, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
            <p className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</p>
            <p className="text-sm text-slate-600 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((s, i) => (
          <button key={s.id} onClick={() => setSelected(s)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:shadow-md hover:border-teal-200 transition-all group cursor-pointer">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm flex items-center justify-center font-mono shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 font-display group-hover:text-teal-700 transition-colors">{s.name}</p>
                  <span className={`text-lg font-bold font-mono ${s.score >= 90 ? "text-emerald-600" : s.score >= 85 ? "text-amber-600" : "text-rose-600"}`}>
                    {s.score}%
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={10} />{s.city}, {s.state}</span>
                  <span className="flex items-center gap-1"><Package size={10} />{s.totalOrders} orders</span>
                  {i === 0 && <span className="flex items-center gap-1 text-amber-500"><Star size={10} fill="currentColor" /> Top performer</span>}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[{ label: "On-Time", value: s.onTime }, { label: "Quality", value: s.quality }, { label: "Fulfillment", value: s.fulfillment }].map((m) => (
                    <div key={m.label}>
                      <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                      <ScoreBar value={m.value} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="text-rose-400">{s.rejectedBatches} rejected</span>
                  <span className="text-amber-400">{s.delayedShipments} delayed</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Supplier Profile" subtitle={selected?.name} size="md">
        {selected && <SupplierDetail s={selected} onClose={() => setSelected(null)} />}
      </Modal>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register New Supplier" subtitle="Onboard pharmaceutical manufacturer to national procurement network" size="md">
        <AddSupplierModal onClose={() => setAddModalOpen(false)} onCreated={loadSuppliers} />
      </Modal>
    </div>
  );
}
