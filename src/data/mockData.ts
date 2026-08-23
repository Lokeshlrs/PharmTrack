export const drugs = [
  { id: "D001", name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesic", manufacturer: "Cipla Ltd", unitPrice: 2.5, storageCondition: "Room Temp 15–25°C", reorderLevel: 5000 },
  { id: "D002", name: "Amoxicillin 500mg", generic: "Amoxicillin Trihydrate", category: "Antibiotic", manufacturer: "Sun Pharma", unitPrice: 8.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 3000 },
  { id: "D003", name: "Insulin Glargine 100IU", generic: "Insulin Glargine", category: "Antidiabetic", manufacturer: "Novo Nordisk", unitPrice: 650.0, storageCondition: "Refrigerated 2–8°C", reorderLevel: 500 },
  { id: "D004", name: "Amlodipine 5mg", generic: "Amlodipine Besylate", category: "Antihypertensive", manufacturer: "Dr. Reddy's", unitPrice: 5.5, storageCondition: "Room Temp 15–25°C", reorderLevel: 4000 },
  { id: "D005", name: "Metformin 500mg", generic: "Metformin HCl", category: "Antidiabetic", manufacturer: "Lupin Ltd", unitPrice: 3.2, storageCondition: "Room Temp 15–25°C", reorderLevel: 5000 },
  { id: "D006", name: "Azithromycin 500mg", generic: "Azithromycin", category: "Antibiotic", manufacturer: "Cipla Ltd", unitPrice: 45.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 2000 },
  { id: "D007", name: "Atorvastatin 10mg", generic: "Atorvastatin Calcium", category: "Statin", manufacturer: "Pfizer India", unitPrice: 12.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 3000 },
  { id: "D008", name: "Omeprazole 20mg", generic: "Omeprazole", category: "Proton Pump Inhibitor", manufacturer: "Ranbaxy", unitPrice: 6.5, storageCondition: "Room Temp 15–25°C", reorderLevel: 4000 },
  { id: "D009", name: "Ceftriaxone 1g Inj", generic: "Ceftriaxone Sodium", category: "Antibiotic", manufacturer: "Wockhardt", unitPrice: 85.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 1000 },
  { id: "D010", name: "Dexamethasone 4mg Inj", generic: "Dexamethasone Sodium Phosphate", category: "Corticosteroid", manufacturer: "Cadila Healthcare", unitPrice: 35.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 800 },
  { id: "D011", name: "Salbutamol 100mcg Inhaler", generic: "Albuterol Sulfate", category: "Bronchodilator", manufacturer: "GSK India", unitPrice: 125.0, storageCondition: "Room Temp below 30°C", reorderLevel: 600 },
  { id: "D012", name: "Folic Acid 5mg", generic: "Folic Acid", category: "Vitamin", manufacturer: "Alkem Labs", unitPrice: 1.5, storageCondition: "Room Temp 15–25°C", reorderLevel: 8000 },
  { id: "D013", name: "ORS Sachet", generic: "Oral Rehydration Salts", category: "Electrolyte", manufacturer: "FDC Ltd", unitPrice: 5.0, storageCondition: "Room Temp 15–25°C", reorderLevel: 10000 },
  { id: "D014", name: "Heparin 5000IU Inj", generic: "Heparin Sodium", category: "Anticoagulant", manufacturer: "Piramal Healthcare", unitPrice: 95.0, storageCondition: "Refrigerated 2–8°C", reorderLevel: 300 },
  { id: "D015", name: "Morphine 10mg Inj", generic: "Morphine Sulfate", category: "Opioid Analgesic", manufacturer: "Neon Laboratories", unitPrice: 45.0, storageCondition: "Controlled Room Temp", reorderLevel: 200 },
  { id: "D016", name: "Vancomycin 500mg Inj", generic: "Vancomycin HCl", category: "Antibiotic", manufacturer: "Aurobindo Pharma", unitPrice: 220.0, storageCondition: "Refrigerated 2–8°C", reorderLevel: 400 },
  { id: "D017", name: "Ranitidine 150mg", generic: "Ranitidine HCl", category: "H2 Blocker", manufacturer: "Cipla Ltd", unitPrice: 4.5, storageCondition: "Room Temp 15–25°C", reorderLevel: 5000 },
  { id: "D018", name: "Prednisolone 5mg", generic: "Prednisolone", category: "Corticosteroid", manufacturer: "Macleods Pharma", unitPrice: 3.8, storageCondition: "Room Temp 15–25°C", reorderLevel: 3000 },
  { id: "D019", name: "Diazepam 5mg Inj", generic: "Diazepam", category: "Benzodiazepine", manufacturer: "Neon Laboratories", unitPrice: 28.0, storageCondition: "Room Temp below 30°C", reorderLevel: 200 },
  { id: "D020", name: "Dopamine 200mg Inj", generic: "Dopamine HCl", category: "Vasopressor", manufacturer: "Pfizer India", unitPrice: 180.0, storageCondition: "Refrigerated 2–8°C", reorderLevel: 150 },
];

export const hospitals = [
  { id: "H001", name: "AIIMS New Delhi", city: "New Delhi", state: "Delhi", type: "Tertiary", beds: 2500, lat: 28.5665, lng: 77.2100 },
  { id: "H002", name: "PGI Chandigarh", city: "Chandigarh", state: "Punjab", type: "Tertiary", beds: 1800, lat: 30.7650, lng: 76.7770 },
  { id: "H003", name: "KGMU Lucknow", city: "Lucknow", state: "Uttar Pradesh", type: "Tertiary", beds: 2200, lat: 26.8700, lng: 80.9463 },
  { id: "H004", name: "Seth GS Medical Mumbai", city: "Mumbai", state: "Maharashtra", type: "Tertiary", beds: 1900, lat: 19.0960, lng: 72.8820 },
  { id: "H005", name: "Safdarjung Hospital", city: "New Delhi", state: "Delhi", type: "Tertiary", beds: 1531, lat: 28.5685, lng: 77.2014 },
  { id: "H006", name: "ESI Hospital Hyderabad", city: "Hyderabad", state: "Telangana", type: "Secondary", beds: 850, lat: 17.3850, lng: 78.4867 },
  { id: "H007", name: "District Hospital Jaipur", city: "Jaipur", state: "Rajasthan", type: "Secondary", beds: 650, lat: 26.9124, lng: 75.7873 },
  { id: "H008", name: "Civil Hospital Ahmedabad", city: "Ahmedabad", state: "Gujarat", type: "Secondary", beds: 1200, lat: 23.0225, lng: 72.5714 },
  { id: "H009", name: "Victoria Hospital Bengaluru", city: "Bengaluru", state: "Karnataka", type: "Tertiary", beds: 1400, lat: 12.9716, lng: 77.5946 },
  { id: "H010", name: "Government Hospital Chennai", city: "Chennai", state: "Tamil Nadu", type: "Tertiary", beds: 2100, lat: 13.0827, lng: 80.2707 },
  { id: "H011", name: "GMCH Guwahati", city: "Guwahati", state: "Assam", type: "Tertiary", beds: 900, lat: 26.1445, lng: 91.7362 },
  { id: "H012", name: "SCB Medical College Cuttack", city: "Cuttack", state: "Odisha", type: "Tertiary", beds: 1400, lat: 20.4625, lng: 85.8830 },
];

export const suppliers = [
  { id: "S001", name: "Cipla Ltd", contact: "procurement@cipla.com", city: "Mumbai", state: "Maharashtra", score: 94, onTime: 96, quality: 95, fulfillment: 91, rejectedBatches: 2, delayedShipments: 3, totalOrders: 48 },
  { id: "S002", name: "Sun Pharmaceutical", contact: "supply@sunpharma.com", city: "Mumbai", state: "Maharashtra", score: 91, onTime: 93, quality: 92, fulfillment: 88, rejectedBatches: 3, delayedShipments: 4, totalOrders: 42 },
  { id: "S003", name: "Dr. Reddy's Laboratories", contact: "orders@drreddys.com", city: "Hyderabad", state: "Telangana", score: 89, onTime: 90, quality: 91, fulfillment: 86, rejectedBatches: 4, delayedShipments: 5, totalOrders: 38 },
  { id: "S004", name: "Lupin Ltd", contact: "supply@lupin.com", city: "Mumbai", state: "Maharashtra", score: 87, onTime: 88, quality: 89, fulfillment: 84, rejectedBatches: 5, delayedShipments: 6, totalOrders: 35 },
  { id: "S005", name: "Aurobindo Pharma", contact: "orders@aurobindo.com", city: "Hyderabad", state: "Telangana", score: 85, onTime: 86, quality: 87, fulfillment: 82, rejectedBatches: 6, delayedShipments: 7, totalOrders: 30 },
  { id: "S006", name: "Alkem Laboratories", contact: "supply@alkem.com", city: "Mumbai", state: "Maharashtra", score: 92, onTime: 94, quality: 93, fulfillment: 89, rejectedBatches: 2, delayedShipments: 3, totalOrders: 40 },
  { id: "S007", name: "Macleods Pharmaceuticals", contact: "orders@macleods.com", city: "Mumbai", state: "Maharashtra", score: 88, onTime: 89, quality: 90, fulfillment: 85, rejectedBatches: 4, delayedShipments: 5, totalOrders: 32 },
  { id: "S008", name: "Cadila Healthcare", contact: "supply@cadila.com", city: "Ahmedabad", state: "Gujarat", score: 90, onTime: 91, quality: 92, fulfillment: 87, rejectedBatches: 3, delayedShipments: 4, totalOrders: 36 },
];

export type StockStatus = "Healthy" | "Low Stock" | "Critical" | "Overstocked" | "Expiring Soon" | "Expired";

export interface InventoryItem {
  id: string;
  drugId: string;
  drugName: string;
  generic: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  storageCondition: string;
  location: string;
  supplierId: string;
  supplierName: string;
  status: StockStatus;
  daysToExpiry: number;
}

export const inventory: InventoryItem[] = [
  { id: "INV001", drugId: "D001", drugName: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesic", manufacturer: "Cipla Ltd", batchNumber: "PCM-2026-4521", mfgDate: "2024-06-01", expiryDate: "2026-05-31", quantity: 1240, unitPrice: 2.5, storageCondition: "Room Temp", location: "Central Warehouse, Delhi", supplierId: "S001", supplierName: "Cipla Ltd", status: "Low Stock", daysToExpiry: 286 },
  { id: "INV002", drugId: "D002", drugName: "Amoxicillin 500mg", generic: "Amoxicillin", category: "Antibiotic", manufacturer: "Sun Pharma", batchNumber: "AMX-2025-8832", mfgDate: "2024-03-15", expiryDate: "2026-03-14", quantity: 4800, unitPrice: 8.0, storageCondition: "Room Temp", location: "Regional Warehouse, Mumbai", supplierId: "S002", supplierName: "Sun Pharma", status: "Healthy", daysToExpiry: 208 },
  { id: "INV003", drugId: "D003", drugName: "Insulin Glargine 100IU", generic: "Insulin Glargine", category: "Antidiabetic", manufacturer: "Novo Nordisk", batchNumber: "INS-2025-1194", mfgDate: "2024-09-01", expiryDate: "2025-09-01", quantity: 280, unitPrice: 650.0, storageCondition: "Refrigerated", location: "Cold Storage Unit A, Delhi", supplierId: "S003", supplierName: "Dr. Reddy's", status: "Critical", daysToExpiry: 14 },
  { id: "INV004", drugId: "D004", drugName: "Amlodipine 5mg", generic: "Amlodipine Besylate", category: "Antihypertensive", manufacturer: "Dr. Reddy's", batchNumber: "AML-2026-3341", mfgDate: "2024-11-01", expiryDate: "2026-10-31", quantity: 8200, unitPrice: 5.5, storageCondition: "Room Temp", location: "Central Warehouse, Delhi", supplierId: "S003", supplierName: "Dr. Reddy's", status: "Overstocked", daysToExpiry: 439 },
  { id: "INV005", drugId: "D005", drugName: "Metformin 500mg", generic: "Metformin HCl", category: "Antidiabetic", manufacturer: "Lupin Ltd", batchNumber: "MET-2025-7721", mfgDate: "2024-07-01", expiryDate: "2026-06-30", quantity: 3200, unitPrice: 3.2, storageCondition: "Room Temp", location: "Regional Warehouse, Chennai", supplierId: "S004", supplierName: "Lupin Ltd", status: "Healthy", daysToExpiry: 316 },
  { id: "INV006", drugId: "D006", drugName: "Azithromycin 500mg", generic: "Azithromycin", category: "Antibiotic", manufacturer: "Cipla Ltd", batchNumber: "AZI-2025-2210", mfgDate: "2024-04-01", expiryDate: "2025-09-15", quantity: 180, unitPrice: 45.0, storageCondition: "Room Temp", location: "District Hospital, Jaipur", supplierId: "S001", supplierName: "Cipla Ltd", status: "Expiring Soon", daysToExpiry: 28 },
  { id: "INV007", drugId: "D007", drugName: "Atorvastatin 10mg", generic: "Atorvastatin", category: "Statin", manufacturer: "Pfizer India", batchNumber: "ATV-2026-5532", mfgDate: "2024-12-01", expiryDate: "2026-11-30", quantity: 5600, unitPrice: 12.0, storageCondition: "Room Temp", location: "Central Warehouse, Mumbai", supplierId: "S002", supplierName: "Sun Pharma", status: "Healthy", daysToExpiry: 469 },
  { id: "INV008", drugId: "D008", drugName: "Omeprazole 20mg", generic: "Omeprazole", category: "PPI", manufacturer: "Ranbaxy", batchNumber: "OMP-2025-4410", mfgDate: "2024-05-01", expiryDate: "2025-08-31", quantity: 320, unitPrice: 6.5, storageCondition: "Room Temp", location: "AIIMS, New Delhi", supplierId: "S008", supplierName: "Cadila Healthcare", status: "Expiring Soon", daysToExpiry: 13 },
  { id: "INV009", drugId: "D009", drugName: "Ceftriaxone 1g Inj", generic: "Ceftriaxone", category: "Antibiotic", manufacturer: "Wockhardt", batchNumber: "CFT-2026-9921", mfgDate: "2025-01-01", expiryDate: "2026-12-31", quantity: 620, unitPrice: 85.0, storageCondition: "Room Temp", location: "Regional Warehouse, Kolkata", supplierId: "S005", supplierName: "Aurobindo Pharma", status: "Healthy", daysToExpiry: 500 },
  { id: "INV010", drugId: "D010", drugName: "Dexamethasone 4mg Inj", generic: "Dexamethasone", category: "Corticosteroid", manufacturer: "Cadila", batchNumber: "DEX-2025-1122", mfgDate: "2024-02-01", expiryDate: "2025-07-31", quantity: 45, unitPrice: 35.0, storageCondition: "Room Temp", location: "ICU Store, KGMU", supplierId: "S008", supplierName: "Cadila Healthcare", status: "Critical", daysToExpiry: -18 },
  { id: "INV011", drugId: "D011", drugName: "Salbutamol Inhaler", generic: "Albuterol", category: "Bronchodilator", manufacturer: "GSK India", batchNumber: "SAL-2026-3341", mfgDate: "2025-02-01", expiryDate: "2027-01-31", quantity: 1800, unitPrice: 125.0, storageCondition: "Room Temp", location: "Central Warehouse, Bengaluru", supplierId: "S006", supplierName: "Alkem Labs", status: "Healthy", daysToExpiry: 531 },
  { id: "INV012", drugId: "D016", drugName: "Vancomycin 500mg Inj", generic: "Vancomycin HCl", category: "Antibiotic", manufacturer: "Aurobindo Pharma", batchNumber: "VAN-2026-8812", mfgDate: "2025-01-15", expiryDate: "2027-01-14", quantity: 95, unitPrice: 220.0, storageCondition: "Refrigerated", location: "Cold Storage Unit B, Mumbai", supplierId: "S005", supplierName: "Aurobindo Pharma", status: "Low Stock", daysToExpiry: 514 },
];

export type ShipmentStatus = "Order Placed" | "Approved" | "Packed" | "Dispatched" | "In Transit" | "Arrived" | "Received";

export interface Shipment {
  id: string;
  supplierId: string;
  supplierName: string;
  origin: string;
  destination: string;
  drugName: string;
  quantity: number;
  batchNumber: string;
  dispatchDate: string;
  expectedArrival: string;
  status: ShipmentStatus;
  progress: number;
  currentLocation: string;
  drugId: string;
}

export const shipments: Shipment[] = [
  { id: "SHP-2025-001", supplierId: "S001", supplierName: "Cipla Ltd", origin: "Mumbai, MH", destination: "AIIMS, New Delhi", drugName: "Paracetamol 500mg", quantity: 15000, batchNumber: "PCM-2025-9901", dispatchDate: "2025-08-10", expectedArrival: "2025-08-20", status: "In Transit", progress: 65, currentLocation: "Toll Plaza, NH48 near Kota", drugId: "D001" },
  { id: "SHP-2025-002", supplierId: "S002", supplierName: "Sun Pharma", origin: "Vadodara, GJ", destination: "PGI, Chandigarh", drugName: "Amoxicillin 500mg", quantity: 8000, batchNumber: "AMX-2025-5542", dispatchDate: "2025-08-12", expectedArrival: "2025-08-18", status: "In Transit", progress: 80, currentLocation: "Ambala, Haryana", drugId: "D002" },
  { id: "SHP-2025-003", supplierId: "S003", supplierName: "Dr. Reddy's", origin: "Hyderabad, TS", destination: "Victoria Hospital, Bengaluru", drugName: "Atorvastatin 10mg", quantity: 5000, batchNumber: "ATV-2025-7721", dispatchDate: "2025-08-14", expectedArrival: "2025-08-17", status: "Arrived", progress: 100, currentLocation: "Victoria Hospital, Bengaluru", drugId: "D007" },
  { id: "SHP-2025-004", supplierId: "S004", supplierName: "Lupin Ltd", origin: "Pune, MH", destination: "KGMU, Lucknow", drugName: "Metformin 500mg", quantity: 12000, batchNumber: "MET-2025-4432", dispatchDate: "2025-08-08", expectedArrival: "2025-08-22", status: "Dispatched", progress: 20, currentLocation: "Nashik, Maharashtra", drugId: "D005" },
  { id: "SHP-2025-005", supplierId: "S005", supplierName: "Aurobindo Pharma", origin: "Hyderabad, TS", destination: "Government Hospital, Chennai", drugName: "Insulin Glargine 100IU", quantity: 2000, batchNumber: "INS-2025-3321", dispatchDate: "2025-08-15", expectedArrival: "2025-08-19", status: "Packed", progress: 10, currentLocation: "Aurobindo Warehouse, Hyderabad", drugId: "D003" },
  { id: "SHP-2025-006", supplierId: "S006", supplierName: "Alkem Labs", origin: "Mumbai, MH", destination: "ESI Hospital, Hyderabad", drugName: "Folic Acid 5mg", quantity: 20000, batchNumber: "FOL-2025-8810", dispatchDate: "2025-08-16", expectedArrival: "2025-08-21", status: "In Transit", progress: 45, currentLocation: "Solapur, Maharashtra", drugId: "D012" },
  { id: "SHP-2025-007", supplierId: "S001", supplierName: "Cipla Ltd", origin: "Mumbai, MH", destination: "Civil Hospital, Ahmedabad", drugName: "Azithromycin 500mg", quantity: 3000, batchNumber: "AZI-2025-6620", dispatchDate: "2025-08-17", expectedArrival: "2025-08-19", status: "Approved", progress: 5, currentLocation: "Cipla Warehouse, Mumbai", drugId: "D006" },
  { id: "SHP-2025-008", supplierId: "S008", supplierName: "Cadila Healthcare", origin: "Ahmedabad, GJ", destination: "SCB Medical, Cuttack", drugName: "Ceftriaxone 1g Inj", quantity: 4000, batchNumber: "CFT-2025-9901", dispatchDate: "2025-08-13", expectedArrival: "2025-08-24", status: "In Transit", progress: 55, currentLocation: "Nagpur, Maharashtra", drugId: "D009" },
];

export interface EmergencyRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  drugName: string;
  requiredQty: number;
  priority: "Critical" | "High" | "Medium";
  requiredBy: string;
  status: "Pending" | "Approved" | "Fulfilled" | "Sourcing";
  recommendedSource: string;
  distance: number;
  createdAt: string;
  drugId: string;
}

export const emergencyRequests: EmergencyRequest[] = [
  { id: "ER-2025-001", hospitalId: "H003", hospitalName: "KGMU Lucknow", drugName: "Insulin Glargine", requiredQty: 500, priority: "Critical", requiredBy: "6 Hours", status: "Pending", recommendedSource: "Central Warehouse, Delhi", distance: 498, createdAt: "2025-08-18T06:30:00", drugId: "D003" },
  { id: "ER-2025-002", hospitalId: "H007", hospitalName: "District Hospital Jaipur", drugName: "Dopamine 200mg Inj", requiredQty: 100, priority: "Critical", requiredBy: "4 Hours", status: "Sourcing", recommendedSource: "AIIMS New Delhi", distance: 267, createdAt: "2025-08-18T07:15:00", drugId: "D020" },
  { id: "ER-2025-003", hospitalId: "H011", hospitalName: "GMCH Guwahati", drugName: "Vancomycin 500mg Inj", requiredQty: 200, priority: "High", requiredBy: "12 Hours", status: "Approved", recommendedSource: "SCB Medical College, Cuttack", distance: 490, createdAt: "2025-08-18T05:00:00", drugId: "D016" },
  { id: "ER-2025-004", hospitalId: "H006", hospitalName: "ESI Hospital Hyderabad", drugName: "Heparin 5000IU", requiredQty: 150, priority: "High", requiredBy: "8 Hours", status: "Pending", recommendedSource: "Regional Warehouse, Chennai", distance: 628, createdAt: "2025-08-18T08:00:00", drugId: "D014" },
  { id: "ER-2025-005", hospitalId: "H012", hospitalName: "SCB Medical Cuttack", drugName: "Morphine 10mg Inj", requiredQty: 80, priority: "Medium", requiredBy: "24 Hours", status: "Pending", recommendedSource: "Regional Warehouse, Kolkata", distance: 195, createdAt: "2025-08-17T22:00:00", drugId: "D015" },
];

export const coldChainUnits = [
  { id: "CCU-A", name: "Cold Room Alpha", location: "Central Warehouse, Delhi", temperature: 4.3, humidity: 62, status: "Safe" as const, minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ["Insulin Glargine", "Heparin 5000IU", "Dopamine 200mg"], lastUpdated: "2025-08-18T09:55:00", alerts: 0 },
  { id: "CCU-B", name: "Cold Room Beta", location: "Regional Warehouse, Mumbai", temperature: 11.8, humidity: 85, status: "Critical" as const, minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ["Vancomycin 500mg", "Insulin Glargine"], lastUpdated: "2025-08-18T09:52:00", alerts: 3 },
  { id: "CCU-C", name: "Cold Room Gamma", location: "Cold Storage, Bengaluru", temperature: 7.1, humidity: 68, status: "Safe" as const, minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ["Insulin Glargine 100IU", "Vaccine Storage"], lastUpdated: "2025-08-18T09:58:00", alerts: 0 },
  { id: "CCU-D", name: "Cold Room Delta", location: "Warehouse, Hyderabad", temperature: 8.5, humidity: 71, status: "Warning" as const, minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ["Dopamine 200mg", "Heparin 5000IU"], lastUpdated: "2025-08-18T09:50:00", alerts: 1 },
];

const genTemperatureData = (base: number, count = 24) => {
  return Array.from({ length: count }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    temp: parseFloat((base + (Math.random() - 0.5) * 3).toFixed(1)),
    humidity: Math.floor(60 + (Math.random() - 0.5) * 20),
  }));
};

export const coldChainHistory = {
  "CCU-A": genTemperatureData(4.3),
  "CCU-B": genTemperatureData(10.5),
  "CCU-C": genTemperatureData(6.8),
  "CCU-D": genTemperatureData(8.0),
};

export const redistributionOpportunities = [
  { id: "RD-001", drug: "Paracetamol 500mg", drugId: "D001", sourceHospital: "Civil Hospital, Ahmedabad", sourceId: "H008", sourceStock: 5000, sourceExpected: 2500, excess: 2500, targetHospital: "KGMU, Lucknow", targetId: "H003", targetStock: 300, targetExpected: 1800, shortage: 1500, recommended: 1500, urgency: "High" as const, distance: 1042, expiryDays: 316 },
  { id: "RD-002", drug: "Amoxicillin 500mg", drugId: "D002", sourceHospital: "Victoria Hospital, Bengaluru", sourceId: "H009", sourceStock: 4200, sourceExpected: 1800, excess: 2400, targetHospital: "GMCH, Guwahati", targetId: "H011", targetStock: 120, targetExpected: 900, shortage: 780, recommended: 800, urgency: "Critical" as const, distance: 1936, expiryDays: 208 },
  { id: "RD-003", drug: "Metformin 500mg", drugId: "D005", sourceHospital: "Government Hospital, Chennai", sourceId: "H010", sourceStock: 7200, sourceExpected: 3200, excess: 4000, targetHospital: "ESI Hospital, Hyderabad", targetId: "H006", targetStock: 400, targetExpected: 1600, shortage: 1200, recommended: 1200, urgency: "High" as const, distance: 628, expiryDays: 316 },
  { id: "RD-004", drug: "Atorvastatin 10mg", drugId: "D007", sourceHospital: "PGI, Chandigarh", sourceId: "H002", sourceStock: 3800, sourceExpected: 1500, excess: 2300, targetHospital: "Safdarjung Hospital", targetId: "H005", targetStock: 600, targetExpected: 2200, shortage: 1600, recommended: 1600, urgency: "Medium" as const, distance: 260, expiryDays: 469 },
];

export const aiForecasts = [
  { drugId: "D001", drugName: "Paracetamol 500mg", currentStock: 1240, predicted30: 2100, predicted7: 490, predicted90: 6300, shortage: 860, recommendedOrder: 1100, confidence: 91, trend: "rising" as const },
  { drugId: "D003", drugName: "Insulin Glargine 100IU", currentStock: 280, predicted30: 820, predicted7: 192, predicted90: 2460, shortage: 540, recommendedOrder: 650, confidence: 95, trend: "rising" as const },
  { drugId: "D006", drugName: "Azithromycin 500mg", currentStock: 180, predicted30: 420, predicted7: 98, predicted90: 1260, shortage: 240, recommendedOrder: 300, confidence: 88, trend: "stable" as const },
  { drugId: "D002", drugName: "Amoxicillin 500mg", currentStock: 4800, predicted30: 2800, predicted7: 655, predicted90: 8400, shortage: 0, recommendedOrder: 0, confidence: 86, trend: "stable" as const },
  { drugId: "D009", drugName: "Ceftriaxone 1g Inj", currentStock: 620, predicted30: 580, predicted7: 136, predicted90: 1740, shortage: 0, recommendedOrder: 0, confidence: 82, trend: "declining" as const },
  { drugId: "D016", drugName: "Vancomycin 500mg Inj", currentStock: 95, predicted30: 310, predicted7: 72, predicted90: 930, shortage: 215, recommendedOrder: 280, confidence: 90, trend: "rising" as const },
];

const genConsumption = (base: number) =>
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
    month: m,
    actual: i < 8 ? Math.floor(base + (Math.random() - 0.3) * base * 0.4) : null,
    predicted: Math.floor(base * (1 + i * 0.02) + (Math.random() - 0.5) * base * 0.1),
  }));

export const consumptionHistory = {
  D001: genConsumption(1800),
  D003: genConsumption(600),
  D006: genConsumption(350),
  D016: genConsumption(220),
};

export const notifications = [
  { id: "N001", type: "critical" as const, message: "Critical stock: Insulin Glargine at KGMU Lucknow — only 14 days remaining", time: "2 min ago", read: false },
  { id: "N002", type: "warning" as const, message: "Drug batch AZI-2025-2210 expiring in 28 days — 180 units at Jaipur", time: "8 min ago", read: false },
  { id: "N003", type: "critical" as const, message: "Cold-chain breach: Cold Room Beta temperature at 11.8°C (safe range: 2–8°C)", time: "15 min ago", read: false },
  { id: "N004", type: "warning" as const, message: "Shipment SHP-2025-004 delayed by 2 days due to route congestion near Nashik", time: "32 min ago", read: false },
  { id: "N005", type: "info" as const, message: "Emergency request ER-2025-001 received from KGMU Lucknow for Insulin Glargine", time: "1 hr ago", read: true },
  { id: "N006", type: "info" as const, message: "Redistribution opportunity: Transfer 1,500 units Paracetamol from Ahmedabad → Lucknow", time: "2 hr ago", read: true },
  { id: "N007", type: "success" as const, message: "Purchase Order PO-2025-0182 generated for 15,000 units Paracetamol — Cipla Ltd", time: "3 hr ago", read: true },
  { id: "N008", type: "info" as const, message: "Shipment SHP-2025-003 arrived at Victoria Hospital, Bengaluru", time: "4 hr ago", read: true },
  { id: "N009", type: "critical" as const, message: "Batch DEX-2025-1122 expired — 45 units of Dexamethasone 4mg at KGMU", time: "6 hr ago", read: true },
  { id: "N010", type: "warning" as const, message: "Supplier Dr. Reddy's fulfillment rate dropped to 86% this quarter", time: "1 day ago", read: true },
];

export const auditLogs = [
  { id: "AL001", user: "Dr. Rajesh Kumar (Admin)", action: "Generated Purchase Order", entity: "PO-2025-0182", detail: "15,000 units Paracetamol 500mg — Cipla Ltd", time: "2025-08-18T09:42:00", type: "create" as const },
  { id: "AL002", user: "Ramesh Singh (Supplier)", action: "Accepted Purchase Order", entity: "PO-2025-0182", detail: "Cipla Ltd confirmed order acceptance", time: "2025-08-18T10:05:00", type: "update" as const },
  { id: "AL003", user: "Priya Sharma (Warehouse)", action: "Flagged Cold Chain Breach", entity: "CCU-B", detail: "Temperature at 11.8°C — safe range 2–8°C", time: "2025-08-18T09:52:00", type: "alert" as const },
  { id: "AL004", user: "System (AI Engine)", action: "Generated Redistribution Recommendation", entity: "RD-001", detail: "Transfer 1,500 units Paracetamol from Ahmedabad to Lucknow", time: "2025-08-18T08:30:00", type: "ai" as const },
  { id: "AL005", user: "Dr. Meena Iyer (Admin)", action: "Approved Emergency Transfer", entity: "ER-2025-003", detail: "200 units Vancomycin — GMCH Guwahati", time: "2025-08-18T08:15:00", type: "approve" as const },
  { id: "AL006", user: "Suresh Verma (Pharmacist)", action: "Reported Expired Batch", entity: "DEX-2025-1122", detail: "45 units Dexamethasone 4mg — quarantined", time: "2025-08-18T07:00:00", type: "alert" as const },
  { id: "AL007", user: "System", action: "Dispatched Shipment", entity: "SHP-2025-001", detail: "15,000 units Paracetamol dispatched from Mumbai", time: "2025-08-10T14:30:00", type: "update" as const },
  { id: "AL008", user: "Admin Portal", action: "Created Drug Recall Notice", entity: "RECALL-2025-001", detail: "Batch OMP-2025-4410 recalled — quality issue", time: "2025-08-15T11:00:00", type: "alert" as const },
  { id: "AL009", user: "System (IoT Gateway)", action: "Cold Chain Alert Triggered", entity: "CCU-B", detail: "Humidity reached 85% — threshold 75%", time: "2025-08-18T09:30:00", type: "alert" as const },
  { id: "AL010", user: "Dr. Anil Mehta (Hospital)", action: "Raised Emergency Request", entity: "ER-2025-001", detail: "500 units Insulin Glargine — 6 hour window", time: "2025-08-18T06:30:00", type: "create" as const },
];

export const recalls = [
  { id: "RECALL-2025-001", batchNumber: "OMP-2025-4410", drugName: "Omeprazole 20mg", reason: "Quality defect: tablet dissolution failure", severity: "Moderate" as const, affectedHospitals: 3, affectedQty: 320, status: "Active" as const, initiatedBy: "Ranbaxy QC Dept", date: "2025-08-15", hospitals: ["AIIMS New Delhi", "Safdarjung Hospital", "District Hospital Jaipur"] },
  { id: "RECALL-2025-002", batchNumber: "PCM-2026-4521", drugName: "Paracetamol 500mg", reason: "Subpotency — active ingredient below specification", severity: "High" as const, affectedHospitals: 12, affectedQty: 1240, status: "Investigating" as const, initiatedBy: "CDSCO National Recall", date: "2025-08-12", hospitals: ["AIIMS New Delhi", "PGI Chandigarh", "KGMU Lucknow", "Seth GS Medical Mumbai", "Safdarjung Hospital", "ESI Hospital Hyderabad", "District Hospital Jaipur", "Civil Hospital Ahmedabad", "Victoria Hospital Bengaluru", "Government Hospital Chennai", "GMCH Guwahati", "SCB Medical College Cuttack"] },
];

export const procurementOrders = [
  { id: "PO-2025-0182", drugName: "Paracetamol 500mg", supplier: "Cipla Ltd", quantity: 15000, unitPrice: 2.5, totalValue: 37500, status: "Confirmed" as const, createdDate: "2025-08-18", expectedDelivery: "2025-08-28", hospital: "Central Warehouse, Delhi" },
  { id: "PO-2025-0181", drugName: "Insulin Glargine 100IU", supplier: "Novo Nordisk", quantity: 1000, unitPrice: 650.0, totalValue: 650000, status: "Pending" as const, createdDate: "2025-08-17", expectedDelivery: "2025-08-25", hospital: "AIIMS New Delhi" },
  { id: "PO-2025-0180", drugName: "Vancomycin 500mg Inj", supplier: "Aurobindo Pharma", quantity: 500, unitPrice: 220.0, totalValue: 110000, status: "Approved" as const, createdDate: "2025-08-16", expectedDelivery: "2025-08-26", hospital: "Central Warehouse, Mumbai" },
  { id: "PO-2025-0179", drugName: "Ceftriaxone 1g Inj", supplier: "Wockhardt", quantity: 2000, unitPrice: 85.0, totalValue: 170000, status: "Delivered" as const, createdDate: "2025-08-10", expectedDelivery: "2025-08-16", hospital: "Regional Warehouse, Kolkata" },
  { id: "PO-2025-0178", drugName: "Azithromycin 500mg", supplier: "Cipla Ltd", quantity: 3000, unitPrice: 45.0, totalValue: 135000, status: "Confirmed" as const, createdDate: "2025-08-17", expectedDelivery: "2025-08-19", hospital: "Civil Hospital, Ahmedabad" },
  { id: "PO-2025-0177", drugName: "ORS Sachet", supplier: "FDC Ltd", quantity: 50000, unitPrice: 5.0, totalValue: 250000, status: "Delivered" as const, createdDate: "2025-08-05", expectedDelivery: "2025-08-12", hospital: "Regional Warehouse, Bhopal" },
];

export const kpiData = {
  totalDrugs: 20,
  totalInventoryValue: 42580000,
  criticalStock: 4,
  expiringSoon: 3,
  activeShipments: 6,
  emergencyRequests: 5,
  activeSuppliers: 8,
  hospitalsCovered: 12,
};

export const consumptionTrend = [
  { month: "Mar", procurement: 1820000, consumption: 1640000, waste: 42000 },
  { month: "Apr", procurement: 1950000, consumption: 1780000, waste: 38000 },
  { month: "May", procurement: 2100000, consumption: 1920000, waste: 35000 },
  { month: "Jun", procurement: 1880000, consumption: 1750000, waste: 31000 },
  { month: "Jul", procurement: 2250000, consumption: 2080000, waste: 28000 },
  { month: "Aug", procurement: 2180000, consumption: 1950000, waste: 24000 },
];

export const stockByCategory = [
  { category: "Antibiotics", value: 38, color: "#06b6d4" },
  { category: "Analgesics", value: 18, color: "#3b82f6" },
  { category: "Antidiabetics", value: 15, color: "#8b5cf6" },
  { category: "Cardiovascular", value: 12, color: "#10b981" },
  { category: "Others", value: 17, color: "#f59e0b" },
];

export const regionalShortages = [
  { region: "North India", normal: 62, low: 24, critical: 14 },
  { region: "South India", normal: 75, low: 18, critical: 7 },
  { region: "East India", normal: 55, low: 28, critical: 17 },
  { region: "West India", normal: 70, low: 20, critical: 10 },
  { region: "Central India", normal: 58, low: 26, critical: 16 },
  { region: "North East", normal: 48, low: 30, critical: 22 },
];
