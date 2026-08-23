import { useState, useEffect } from "react";
import { QrCode, Search, Package, CheckCircle, MapPin, Factory, Truck, Hospital, ShoppingBag, RefreshCw, ShieldCheck, Download, Code } from "lucide-react";
import { inventory as defaultInventory, type InventoryItem } from "../data/mockData";
import { inventoryService } from "../services/inventoryService";
import { traceabilityService } from "../services/forecastService";
import { useToast } from "../components/Toast";
import QRCodeDisplay from "../components/QRCodeDisplay";
import Modal from "../components/Modal";

const defaultJourney = [
  { icon: Factory, label: "Manufacturer", desc: "Quality tested & packaged", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { icon: ShoppingBag, label: "Supplier", desc: "Batch logged & dispatched", color: "text-violet-600 bg-violet-50 border-violet-200" },
  { icon: Package, label: "Central Warehouse", desc: "Received, QC passed", color: "text-teal-600 bg-teal-50 border-teal-200" },
  { icon: Truck, label: "Transport", desc: "Cold-chain maintained", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { icon: Hospital, label: "Hospital", desc: "Received & stocked", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { icon: ShoppingBag, label: "Pharmacy", desc: "Dispensed to patient", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
];

export default function QRTraceability() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>(defaultInventory);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<InventoryItem>(defaultInventory[0]);
  const [journey, setJourney] = useState<any[]>(defaultJourney);
  const [loading, setLoading] = useState(false);
  const [payloadModalOpen, setPayloadModalOpen] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.list();
      if (data?.length) {
        setItems(data);
        const match = data.find((i) => i.batchNumber === selected.batchNumber) || data[0];
        handleSelectBatch(match);
      }
    } catch (e) {
      console.warn("Using default inventory for QR traceability");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBatch = async (item: InventoryItem) => {
    setSelected(item);
    try {
      const traceData = await traceabilityService.getBatch(item.batchNumber);
      if (traceData?.journey?.length) {
        const mapped = traceData.journey.map((step: any) => ({
          icon: step.stage?.toLowerCase().includes("manuf") ? Factory :
                step.stage?.toLowerCase().includes("inbound") || step.stage?.toLowerCase().includes("ware") ? Package :
                step.stage?.toLowerCase().includes("hosp") ? Hospital : Truck,
          label: step.stage || "Supply Node",
          desc: `${step.location || "Facility"} · ${step.status || "Completed"}`,
          color: "text-teal-600 bg-teal-50 border-teal-200",
          verified: step.status === "Completed" || step.status === "In Stock",
        }));
        setJourney(mapped);
      } else {
        setJourney(defaultJourney);
      }
    } catch {
      setJourney(defaultJourney);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const filtered = query
    ? items.filter((i) =>
        i.batchNumber.toLowerCase().includes(query.toLowerCase()) ||
        i.drugName.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const currentQRPayload = {
    pharmTrackVer: "2.4",
    standard: "GS1 Digital Link Healthcare",
    batchNumber: selected.batchNumber,
    drugId: selected.drugId || "D001",
    drugName: selected.drugName,
    generic: selected.generic,
    manufacturer: selected.manufacturer || selected.supplierName,
    manufacturingDate: selected.mfgDate,
    expiryDate: selected.expiryDate,
    quantity: selected.quantity,
    supplier: selected.supplierName,
    currentLocation: selected.location,
    storageCondition: selected.storageCondition,
    qualityStatus: selected.daysToExpiry < 0 ? "Expired" : selected.daysToExpiry < 30 ? "Expiring Soon" : "Passed",
    blockchainHash: `0x7f8a9b${selected.batchNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}c4d5e6f7`,
    verified: true,
  };

  const handleSimulateScan = () => {
    showToast("success", "QR Code Verified", `Batch ${selected.batchNumber} authenticated with GS1 Ledger`);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
            <QrCode size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">QR Drug Traceability</h2>
            <p className="text-sm text-slate-500">Live dynamic 2D DataMatrix & GS1 QR code generation across pharmaceutical supply chain</p>
          </div>
        </div>
        <button
          onClick={loadBatches}
          className="p-2 text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
          title="Refresh Traceability"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch number or drug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id || item.batchNumber}
                onClick={() => handleSelectBatch(item)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selected.batchNumber === item.batchNumber ? "border-blue-300 bg-blue-50" : "border-transparent hover:bg-slate-50"
                }`}
              >
                <p className="font-mono text-xs font-bold text-blue-700">{item.batchNumber}</p>
                <p className="font-medium text-slate-800 text-sm font-display mt-0.5">{item.drugName}</p>
                <p className="text-xs text-slate-400">{item.manufacturer || item.supplierName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Batch detail & Real QR Display */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="font-mono text-sm font-bold text-blue-700">{selected.batchNumber}</p>
              <p className="font-bold text-slate-900 font-display">{selected.drugName}</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck size={12} /> GS1 Verified
            </span>
          </div>

          {/* Genuine Dynamic QR Code Display Component */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
            <QRCodeDisplay
              payload={currentQRPayload}
              batchNumber={selected.batchNumber}
              drugName={selected.drugName}
              size={150}
              onScanSimulate={handleSimulateScan}
            />
            <button
              onClick={() => setPayloadModalOpen(true)}
              className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <Code size={12} /> View Encoded GS1 Payload
            </button>
          </div>

          <div className="space-y-2 text-sm pt-2">
            {[
              { label: "Drug Formulation", value: selected.drugName },
              { label: "Generic Name", value: selected.generic },
              { label: "Batch Number", value: selected.batchNumber },
              { label: "Manufacturer", value: selected.manufacturer || selected.supplierName },
              { label: "Manufacturing Date", value: selected.mfgDate },
              { label: "Expiry Date", value: selected.expiryDate },
              { label: "Quantity", value: `${selected.quantity.toLocaleString()} units` },
              { label: "Supplier", value: selected.supplierName },
              { label: "Current Location", value: selected.location },
              { label: "Storage Condition", value: selected.storageCondition },
              { label: "Quality Status", value: selected.daysToExpiry < 0 ? "Expired" : selected.daysToExpiry < 30 ? "Expiring Soon" : "Passed" },
            ].map((f) => (
              <div key={f.label} className="flex items-start justify-between gap-3 border-b border-slate-50 pb-1.5 last:border-0 text-xs">
                <span className="text-slate-400 shrink-0 w-32">{f.label}</span>
                <span className={`font-medium text-right font-mono ${
                  f.label === "Quality Status"
                    ? selected.daysToExpiry < 0 ? "text-rose-600" : selected.daysToExpiry < 30 ? "text-amber-600" : "text-emerald-600"
                    : "text-slate-800"
                }`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Journey timeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 font-display mb-4">Supply Chain Journey</h3>
          <div className="space-y-0">
            {journey.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${step.color}`}>
                    <step.icon size={16} />
                  </div>
                  {i < journey.length - 1 && (
                    <div className="w-0.5 h-8 bg-slate-200 my-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-semibold text-sm text-slate-900 font-display">{step.label}</p>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                  {i === 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle size={10} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600">Origin Verified</span>
                    </div>
                  )}
                  {i === journey.length - 1 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-teal-500" />
                      <span className="text-xs text-teal-600">Current Node</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={payloadModalOpen} onClose={() => setPayloadModalOpen(false)} title="GS1 Traceability Payload" subtitle={`Decoded metadata for ${selected.batchNumber}`} size="md">
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-teal-300 rounded-xl font-mono text-xs overflow-x-auto max-h-80">
            <pre>{JSON.stringify(currentQRPayload, null, 2)}</pre>
          </div>
          <button
            onClick={() => setPayloadModalOpen(false)}
            className="w-full py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
