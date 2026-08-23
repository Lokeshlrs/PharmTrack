import { useState, useEffect } from "react";
import { Pill, QrCode, Search, Plus, ChevronDown, ChevronUp, X, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import QRCodeDisplay from "../components/QRCodeDisplay";
import { drugs as defaultDrugs, inventory as defaultInventory, type InventoryItem } from "../data/mockData";
import { drugService } from "../services/inventoryService";
import { inventoryService } from "../services/inventoryService";

function QRModal({ batch, drug, onClose }: { batch: any; drug: any; onClose: () => void }) {
  const { showToast } = useToast();
  const payload = {
    pharmTrackVer: "2.4",
    standard: "GS1 Digital Link Healthcare",
    batchNumber: batch.batchNumber,
    drugId: batch.drugId || drug?.id || "D001",
    drugName: batch.drugName,
    manufacturer: drug?.manufacturer || batch.manufacturer,
    expiryDate: batch.expiryDate,
    quantity: batch.quantity,
    location: batch.location,
    storageCondition: batch.storageCondition,
    verified: true,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-200">
        <QRCodeDisplay
          payload={payload}
          batchNumber={batch.batchNumber}
          drugName={batch.drugName}
          size={160}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {[
          { label: "Batch", value: batch.batchNumber },
          { label: "Drug", value: batch.drugName },
          { label: "Manufacturer", value: drug?.manufacturer || batch.manufacturer },
          { label: "Expiry", value: batch.expiryDate },
          { label: "Quantity", value: `${batch.quantity?.toLocaleString() || 0} units` },
          { label: "Location", value: batch.location },
          { label: "Quality Status", value: (batch.daysToExpiry || 0) < 0 ? "Expired" : (batch.daysToExpiry || 0) < 30 ? "Expiring Soon" : "Passed" },
          { label: "Storage", value: batch.storageCondition },
        ].map((f) => (
          <div key={f.label} className="p-2.5 bg-slate-50 rounded-lg">
            <p className="text-slate-400">{f.label}</p>
            <p className={`font-semibold font-mono mt-0.5 ${f.label === "Quality Status" ? ((batch.daysToExpiry || 0) < 0 ? "text-rose-600" : (batch.daysToExpiry || 0) < 30 ? "text-amber-600" : "text-emerald-600") : "text-slate-800"}`}>{f.value}</p>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">Close</button>
    </div>
  );
}


function RegisterDrugModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", generic: "", category: "", manufacturer: "", price: "", storage: "" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const fc = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400 bg-white";
  const lbl = (t: string) => <label className="text-xs font-medium text-slate-600 mb-1 block">{t}</label>;

  const submit = async () => {
    if (!form.name) { showToast("error", "Missing name", "Drug name is required"); return; }
    setSubmitting(true);
    try {
      await drugService.create({
        name: form.name,
        genericName: form.generic || form.name,
        category: form.category || "Analgesic",
        manufacturer: form.manufacturer || "Cipla Ltd",
        unitPrice: Number(form.price) || 5.0,
        storageCondition: form.storage || "Room Temp 15–25°C",
      });
      showToast("success", "Drug registered", `${form.name} added to formulary`);
      onCreated?.();
      onClose();
    } catch (e: any) {
      showToast("error", "Registration Failed", e.message || "Failed to register drug");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">{lbl("Brand / Drug Name *")}<input className={fc} placeholder="e.g. Amoxicillin 500mg" value={form.name} onChange={set("name")} /></div>
        <div>{lbl("Generic Name *")}<input className={fc} placeholder="e.g. Amoxicillin Trihydrate" value={form.generic} onChange={set("generic")} /></div>
        <div>{lbl("Category")}<select value={form.category} onChange={set("category")} className={fc}><option value="">Select…</option>{["Antibiotic","Analgesic","Antidiabetic","Antihypertensive","Corticosteroid","Other"].map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="col-span-2">{lbl("Manufacturer")}<input className={fc} placeholder="Pharmaceutical company" value={form.manufacturer} onChange={set("manufacturer")} /></div>
        <div>{lbl("Unit Price (₹)")}<input type="number" className={fc} placeholder="0.00" value={form.price} onChange={set("price")} /></div>
        <div>{lbl("Storage Condition")}<input className={fc} placeholder="Room Temp / Refrigerated" value={form.storage} onChange={set("storage")} /></div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button disabled={submitting} onClick={submit}
          className="flex-1 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">
          {submitting ? "Registering..." : "Register Drug"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export default function DrugsAndBatches() {
  const [drugsList, setDrugsList] = useState(defaultDrugs);
  const [inventoryList, setInventoryList] = useState(defaultInventory);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>("D001");
  const [qrBatch, setQrBatch] = useState<{ batch: any; drug: any } | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, iRes] = await Promise.allSettled([
        drugService.list(),
        inventoryService.list(),
      ]);
      if (dRes.status === "fulfilled" && dRes.value?.length) {
        const mapped = dRes.value.map((d: any) => ({
          id: d.drugId || d._id,
          name: d.name,
          generic: d.genericName || d.generic || "",
          category: d.category || "General",
          manufacturer: d.manufacturer || "",
          unitPrice: d.unitPrice || 0,
          storageCondition: d.storageCondition || "Room Temp",
        }));
        setDrugsList(mapped);
      }
      if (iRes.status === "fulfilled" && iRes.value?.length) setInventoryList(iRes.value);
    } catch (e) {
      console.warn("Using default drugs list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = drugsList.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.generic.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  const batchesFor = (drugId: string, drugName: string) =>
    inventoryList.filter((i) => i.drugId === drugId || i.drugName?.toLowerCase() === drugName?.toLowerCase());

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-700 flex items-center justify-center">
            <Pill size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Drugs & Batches</h2>
            <p className="text-sm text-slate-500">{drugsList.length} registered formulations · {inventoryList.length} active batches</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Formulary"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setRegisterOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
            <Plus size={14} /> Register Drug
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search name, generic, category…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-violet-400" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={12} /></button>}
      </div>

      <div className="space-y-2">
        {filtered.map((drug) => {
          const batches = batchesFor(drug.id, drug.name);
          const isOpen = expanded === drug.id;
          return (
            <div key={drug.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-violet-200 transition-colors">
              <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/50 transition-colors" onClick={() => setExpanded(isOpen ? null : drug.id)}>
                <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Pill size={15} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 font-display">{drug.name}</p>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{drug.category}</span>
                    {batches.some((b) => b.status === "Critical") && <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-semibold">Critical Stock</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{drug.generic} · {drug.manufacturer}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-sm">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Unit Price</p>
                    <p className="font-mono font-semibold text-slate-700">₹{drug.unitPrice?.toFixed(2) || "0.00"}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Batches</p>
                    <p className="font-mono font-semibold text-slate-700">{batches.length}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Storage</p>
                    <p className="text-xs text-slate-600 max-w-24 truncate">{drug.storageCondition}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  {batches.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">No batches recorded</p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {["Batch No.", "Mfg Date", "Expiry", "Qty", "Location", "Status", "QR"].map((h) => (
                              <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {batches.map((b) => (
                            <tr key={b.id || b.batchNumber} className="hover:bg-violet-50/30 transition-colors">
                              <td className="py-2.5 pr-4 font-mono text-xs font-bold text-violet-700 whitespace-nowrap">{b.batchNumber}</td>
                              <td className="py-2.5 pr-4 font-mono text-xs text-slate-500 whitespace-nowrap">{b.mfgDate}</td>
                              <td className="py-2.5 pr-4">
                                <span className={`font-mono text-xs font-semibold ${(b.daysToExpiry || 0) < 0 ? "text-rose-600" : (b.daysToExpiry || 0) < 30 ? "text-amber-600" : "text-slate-600"}`}>{b.expiryDate}</span>
                              </td>
                              <td className="py-2.5 pr-4 font-mono font-semibold text-slate-800">{b.quantity?.toLocaleString() || 0}</td>
                              <td className="py-2.5 pr-4 text-xs text-slate-500 max-w-40 truncate">{b.location}</td>
                              <td className="py-2.5 pr-4"><StatusBadge status={b.status} size="sm" /></td>
                              <td className="py-2.5">
                                <button onClick={() => setQrBatch({ batch: b, drug })}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 hover:text-violet-700 transition-colors">
                                  <QrCode size={13} className="text-slate-600" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!qrBatch} onClose={() => setQrBatch(null)} title="Batch QR Code" subtitle={qrBatch?.batch.batchNumber} size="sm">
        {qrBatch && <QRModal batch={qrBatch.batch} drug={qrBatch.drug} onClose={() => setQrBatch(null)} />}
      </Modal>
      <Modal open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register New Drug" subtitle="Add to national formulary" size="md">
        <RegisterDrugModal onClose={() => setRegisterOpen(false)} onCreated={loadData} />
      </Modal>
    </div>
  );
}
