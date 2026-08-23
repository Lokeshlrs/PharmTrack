import { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, Package, X, ChevronDown, ChevronUp, Edit3, Trash2, RefreshCw } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { inventory as defaultInventory, type StockStatus, type InventoryItem } from "../data/mockData";
import { inventoryService, drugService } from "../services/inventoryService";
import { supplierService } from "../services/supplierService";
import { subscribeToEvent } from "../services/socketService";

const statusFilters: (StockStatus | "All")[] = ["All", "Healthy", "Low Stock", "Critical", "Overstocked", "Expiring Soon", "Expired"];
const categories = ["All", "Analgesic", "Antibiotic", "Antidiabetic", "Antihypertensive", "Statin", "PPI", "Corticosteroid", "Bronchodilator", "Vitamin", "Electrolyte", "Anticoagulant", "Vasopressor"];

function InventoryDetail({ item, onClose, onRefresh }: { item: InventoryItem; onClose: () => void; onRefresh?: () => void }) {
  const { showToast } = useToast();
  const [adjusting, setAdjusting] = useState(false);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdjust = async () => {
    if (!adjustQty || isNaN(Number(adjustQty))) {
      showToast("error", "Invalid Quantity", "Please enter a valid numeric quantity adjustment");
      return;
    }
    setLoading(true);
    try {
      const targetId = (item as any)._id || item.id || item.batchNumber;
      await inventoryService.adjust(targetId, {
        quantityAdjustment: Number(adjustQty),
        reason: adjustReason || "Manual inventory adjustment",
      });
      showToast("success", "Stock Adjusted", `${item.drugName} (${item.batchNumber}) adjusted by ${adjustQty} units`);
      onRefresh?.();
      onClose();
    } catch (e: any) {
      showToast("error", "Adjustment Failed", e.message || "Failed to adjust stock");
    } finally {
      setLoading(false);
    }
  };

  const handleQuarantine = async () => {
    setLoading(true);
    try {
      const targetId = (item as any)._id || item.id || item.batchNumber;
      await inventoryService.adjust(targetId, {
        quantityAdjustment: 0,
        reason: "Quarantined by safety inspection",
      });
      showToast("warning", "Quarantine Applied", `Batch ${item.batchNumber} has been secured in quarantine`);
      onRefresh?.();
      onClose();
    } catch (e: any) {
      showToast("error", "Quarantine Failed", e.message || "Failed to quarantine batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
          <Package size={22} className="text-teal-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 font-display">{item.drugName}</p>
          <p className="text-sm text-slate-500">{item.generic} · {item.category}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{item.batchNumber}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={item.status} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Manufacturer", value: item.manufacturer },
          { label: "Supplier", value: item.supplierName },
          { label: "Mfg Date", value: item.mfgDate },
          { label: "Expiry Date", value: item.expiryDate },
          { label: "Quantity", value: `${item.quantity.toLocaleString()} units` },
          { label: "Unit Price", value: `₹${item.unitPrice.toFixed(2)}` },
          { label: "Total Value", value: `₹${(item.quantity * item.unitPrice).toLocaleString()}` },
          { label: "Storage", value: item.storageCondition },
        ].map((f) => (
          <div key={f.label} className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-400">{f.label}</p>
            <p className="font-semibold text-slate-800 font-mono text-sm mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-400">Current Location</p>
        <p className="font-semibold text-slate-800 text-sm mt-0.5">{item.location}</p>
      </div>

      {item.daysToExpiry > 0 && item.daysToExpiry <= 30 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm font-semibold text-amber-800">⚠ Expiring in {item.daysToExpiry} days — FEFO priority flag active</p>
        </div>
      )}
      {item.daysToExpiry < 0 && (
        <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
          <p className="text-sm font-semibold text-rose-800">🚫 Expired {Math.abs(item.daysToExpiry)} days ago — quarantine required</p>
        </div>
      )}

      {/* Inline Adjust Stock Form */}
      {adjusting ? (
        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
          <p className="text-xs font-semibold text-teal-800 uppercase tracking-wide">Adjust Stock Quantity</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Adjustment (+ / - Units)</label>
              <input
                type="number"
                placeholder="e.g. 50 or -20"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Reason</label>
              <input
                type="text"
                placeholder="Physical count audit"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={handleAdjust}
              className="flex-1 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition"
            >
              {loading ? "Saving..." : "Apply Adjustment"}
            </button>
            <button
              onClick={() => setAdjusting(false)}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setAdjusting(true)}
            className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit3 size={14} /> Adjust Stock
          </button>
          <button
            onClick={handleQuarantine}
            className="flex-1 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Quarantine
          </button>
        </div>
      )}
    </div>
  );
}

function AddStockModal({ onClose, onCreated }: { onClose: () => void; onCreated?: () => void }) {
  const { showToast } = useToast();
  const [drugsList, setDrugsList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [form, setForm] = useState({ drug: "", batch: "", qty: "", expiry: "", location: "", supplier: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [dList, sList] = await Promise.all([
          drugService.list(),
          supplierService.list(),
        ]);
        if (dList?.length) setDrugsList(dList);
        if (sList?.length) setSuppliersList(sList);
      } catch {
        // Fallback
      }
    };
    fetchDropdowns();
  }, []);

  const handleDrugSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const drugName = e.target.value;
    const selectedObj = drugsList.find((d) => d.name === drugName);
    setForm((f) => ({
      ...f,
      drug: drugName,
      supplier: selectedObj?.manufacturer || f.supplier,
    }));
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.drug || !form.batch || !form.qty) {
      showToast("error", "Missing Required Fields", "Drug formulation, batch number, and quantity are required.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedObj = drugsList.find((d) => d.name === form.drug);
      await inventoryService.create({
        drugName: form.drug,
        drugId: selectedObj?.drugId || selectedObj?.id || "D001",
        generic: selectedObj?.genericName || "",
        category: selectedObj?.category || "General",
        manufacturer: selectedObj?.manufacturer || form.supplier || "Cipla Ltd",
        unitPrice: selectedObj?.unitPrice || 10,
        storageCondition: selectedObj?.storageCondition || "Room Temp",
        batchNumber: form.batch,
        quantity: Number(form.qty),
        expiryDate: form.expiry || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        location: form.location || "Central Warehouse, Delhi",
        supplierName: form.supplier || selectedObj?.manufacturer || "Cipla Ltd",
      });
      showToast("success", "Stock Added Successfully", `${form.qty} units of ${form.drug} (Batch: ${form.batch}) stored.`);
      onCreated?.();
      onClose();
    } catch (e: any) {
      showToast("error", "Failed to Add Stock", e.message || "An error occurred while saving to database");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 bg-white";
  const label = (t: string) => <label className="text-xs font-medium text-slate-600 mb-1 block">{t}</label>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          {label("Drug Formulation *")}
          {drugsList.length > 0 ? (
            <select value={form.drug} onChange={handleDrugSelect} className={fieldClass}>
              <option value="">Select registered drug formulation…</option>
              {drugsList.map((d) => (
                <option key={d.drugId || d._id || d.name} value={d.name}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          ) : (
            <input className={fieldClass} placeholder="e.g. Paracetamol 500mg" value={form.drug} onChange={set("drug")} />
          )}
        </div>
        <div>
          {label("Batch Number *")}
          <input className={fieldClass} placeholder="e.g. PCM-2026-0001" value={form.batch} onChange={set("batch")} />
        </div>
        <div>
          {label("Quantity (units) *")}
          <input type="number" className={fieldClass} placeholder="e.g. 5000" value={form.qty} onChange={set("qty")} />
        </div>
        <div>
          {label("Expiry Date")}
          <input type="date" className={fieldClass} value={form.expiry} onChange={set("expiry")} />
        </div>
        <div>
          {label("Storage Location")}
          <input className={fieldClass} placeholder="e.g. Central Warehouse, Delhi" value={form.location} onChange={set("location")} />
        </div>
        <div className="col-span-2">
          {label("Supplier / Manufacturer")}
          {suppliersList.length > 0 ? (
            <select value={form.supplier} onChange={set("supplier")} className={fieldClass}>
              <option value="">Select supplier…</option>
              {suppliersList.map((s) => (
                <option key={s.supplierId || s._id || s.name} value={s.name}>
                  {s.name} ({s.city || "India"})
                </option>
              ))}
            </select>
          ) : (
            <input className={fieldClass} placeholder="Supplier / Manufacturer name" value={form.supplier} onChange={set("supplier")} />
          )}
        </div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button
          disabled={submitting}
          onClick={submit}
          className="flex-1 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving to Database..." : "Add Stock"}
        </button>
        <button onClick={onClose} className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function FilterPanel({ open, onClose, category, setCategory, location, setLocation }: {
  open: boolean; onClose: () => void; category: string; setCategory: (c: string) => void; location: string; setLocation: (l: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-72 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-800 font-display text-sm">Filter Inventory</p>
        <button onClick={onClose}><X size={14} className="text-slate-400" /></button>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">Location contains</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Delhi, Mumbai…" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none" />
      </div>
      <button onClick={onClose} className="w-full py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">Apply Filters</button>
    </div>
  );
}

export default function Inventory() {
  const { showToast } = useToast();
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(defaultInventory);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sortCol, setSortCol] = useState<"drugName" | "quantity" | "daysToExpiry">("drugName");
  const [sortAsc, setSortAsc] = useState(true);

  const loadStock = async () => {
    setLoading(true);
    try {
      const items = await inventoryService.list();
      if (items?.length) {
        setInventoryList(items);
      }
    } catch (e) {
      console.warn("Using default inventory list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
    const unsub = subscribeToEvent("inventory:updated", () => loadStock());
    return () => unsub();
  }, []);

  const filtered = inventoryList
    .filter((item) => {
      const matchSearch =
        !search ||
        item.drugName.toLowerCase().includes(search.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        (item.generic && item.generic.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === "All" || item.status === statusFilter;
      const matchCategory = categoryFilter === "All" || item.category === categoryFilter;
      const matchLocation = !locationFilter || item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchSearch && matchStatus && matchCategory && matchLocation;
    })
    .sort((a, b) => {
      let vA = a[sortCol];
      let vB = b[sortCol];
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (col: "drugName" | "quantity" | "daysToExpiry") => {
    if (sortCol === col) setSortAsc((s) => !s);
    else { setSortCol(col); setSortAsc(true); }
  };

  const totalUnits = inventoryList.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const totalValue = inventoryList.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)), 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Drug Inventory</h2>
            <p className="text-sm text-slate-500">
              {inventoryList.length} batches · {totalUnits.toLocaleString()} units · Total Value: ₹{(totalValue / 100000).toFixed(1)}L
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadStock}
            className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => showToast("info", "Exporting Inventory…", `${filtered.length} records exported`)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Plus size={14} /> Add Stock
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        {statusFilters.map((s) => {
          const count = s === "All" ? inventoryList.length : inventoryList.filter((i) => i.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
              style={statusFilter === s ? { backgroundColor: "#0a1628" } : {}}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Location Filter */}
      <div className="flex gap-3 relative">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search drug, batch, generic, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
          />
        </div>
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
            filterOpen || categoryFilter !== "All" || locationFilter
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Filter size={14} /> More Filters
          {(categoryFilter !== "All" || locationFilter) && <span className="w-2 h-2 rounded-full bg-teal-500" />}
        </button>
        <div className="absolute right-0 top-12 z-20">
          <FilterPanel
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            category={categoryFilter}
            setCategory={setCategoryFilter}
            location={locationFilter}
            setLocation={setLocationFilter}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button onClick={() => toggleSort("drugName")} className="flex items-center gap-1 hover:text-slate-800">
                    Drug Formulation {sortCol === "drugName" ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Batch No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button onClick={() => toggleSort("quantity")} className="flex items-center gap-1 ml-auto hover:text-slate-800">
                    Quantity {sortCol === "quantity" ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button onClick={() => toggleSort("daysToExpiry")} className="flex items-center gap-1 hover:text-slate-800">
                    Expiry {sortCol === "daysToExpiry" ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No matching inventory items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id || item.batchNumber}
                    onClick={() => setSelected(item)}
                    className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 font-display group-hover:text-teal-700 transition-colors">{item.drugName}</p>
                      <p className="text-xs text-slate-400">{item.generic} · {item.category}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.batchNumber}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{item.location}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                      {Number(item.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-mono text-slate-700">{item.expiryDate}</p>
                      <p className={`text-[11px] font-medium ${item.daysToExpiry <= 0 ? "text-rose-600 font-bold" : item.daysToExpiry <= 30 ? "text-amber-600 font-semibold" : "text-slate-400"}`}>
                        {item.daysToExpiry <= 0 ? `${Math.abs(item.daysToExpiry)}d expired` : `${item.daysToExpiry}d left`}
                      </p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={item.status} size="sm" /></td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">₹{Number(item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Inventory Stock" subtitle="Register new drug batch stock" size="md">
        <AddStockModal onClose={() => setAddOpen(false)} onCreated={loadStock} />
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Batch Detail" subtitle={selected?.batchNumber} size="md">
        {selected && <InventoryDetail item={selected} onClose={() => setSelected(null)} onRefresh={loadStock} />}
      </Modal>
    </div>
  );
}
