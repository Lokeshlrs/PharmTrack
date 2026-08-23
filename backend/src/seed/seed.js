import mongoose from 'mongoose';
import User from '../models/User.js';
import Drug from '../models/Drug.js';
import DrugBatch from '../models/DrugBatch.js';
import Inventory from '../models/Inventory.js';
import Hospital from '../models/Hospital.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Shipment from '../models/Shipment.js';
import StockTransfer from '../models/StockTransfer.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Consumption from '../models/Consumption.js';
import QualityCheck from '../models/QualityCheck.js';
import ColdChainReading from '../models/ColdChainReading.js';
import Notification from '../models/Notification.js';
import Recall from '../models/Recall.js';
import AuditLog from '../models/AuditLog.js';
import { generateQRCodeDataUrl, buildBatchQRPayload } from '../utils/qrGenerator.js';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding PharmTrack database with realistic healthcare dataset...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Drug.deleteMany({}),
    DrugBatch.deleteMany({}),
    Inventory.deleteMany({}),
    Hospital.deleteMany({}),
    Supplier.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    Shipment.deleteMany({}),
    StockTransfer.deleteMany({}),
    EmergencyRequest.deleteMany({}),
    Consumption.deleteMany({}),
    QualityCheck.deleteMany({}),
    ColdChainReading.deleteMany({}),
    Notification.deleteMany({}),
    Recall.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 2. Seed Users (System Roles & Dedicated Organization Credentials)
  const users = [
    // Core Roles
    { name: 'Dr. Rajesh Kumar', email: 'admin@pharmtrack.gov.in', password: 'Admin@2025', role: 'admin', organization: 'National Drug Authority', phone: '+91 98110 12345' },
    { name: 'Sec. Priya Menon', email: 'authority@mohfw.gov.in', password: 'Govt@2025', role: 'government', organization: 'Ministry of Health & FW', phone: '+91 98110 54321' },
    { name: 'Dr. Meena Iyer', email: 'aiims@mohfw.gov.in', password: 'Hospital@2025', role: 'hospital', organization: 'AIIMS New Delhi', hospital: 'AIIMS New Delhi', hospitalId: 'H001', phone: '+91 98440 66778' },
    { name: 'Ramesh Singh', email: 'supply@cipla.com', password: 'Supplier@2025', role: 'supplier', organization: 'Cipla Ltd', supplierId: 'S001', phone: '+91 98220 11223' },
    { name: 'Suresh Verma', email: 'wh.delhi@pharmtrack.gov.in', password: 'Warehouse@2025', role: 'warehouse', organization: 'Central Warehouse Delhi', warehouse: 'Central Warehouse, Delhi', warehouseId: 'WH-DEL', phone: '+91 98330 99887' },
    { name: 'Kavitha Nair', email: 'pharma@kgmu.edu.in', password: 'Pharma@2025', role: 'pharmacist', organization: 'KGMU Pharmacy', hospital: 'KGMU Lucknow', hospitalId: 'H003', phone: '+91 98550 44332' },

    // Unique Hospital Accounts
    { name: 'AIIMS Delhi Node', email: 'aiims.delhi@pharmtrack.gov.in', password: 'Aiims@2025', role: 'hospital', organization: 'AIIMS New Delhi', hospital: 'AIIMS New Delhi', hospitalId: 'H001', phone: '+91 11 2658 8500' },
    { name: 'PGI Chandigarh Node', email: 'pgi.chd@pharmtrack.gov.in', password: 'Pgi@2025', role: 'hospital', organization: 'PGI Chandigarh', hospital: 'PGI Chandigarh', hospitalId: 'H002', phone: '+91 172 274 7585' },
    { name: 'KGMU Lucknow Node', email: 'kgmu.lko@pharmtrack.gov.in', password: 'Kgmu@2025', role: 'hospital', organization: 'KGMU Lucknow', hospital: 'KGMU Lucknow', hospitalId: 'H003', phone: '+91 522 225 7540' },
    { name: 'Seth GS Medical Mumbai Node', email: 'sethgs.mum@pharmtrack.gov.in', password: 'Sethgs@2025', role: 'hospital', organization: 'Seth GS Medical Mumbai', hospital: 'Seth GS Medical Mumbai', hospitalId: 'H004', phone: '+91 22 2410 7000' },
    { name: 'Safdarjung Hospital Node', email: 'safdarjung.delhi@pharmtrack.gov.in', password: 'Safdarjung@2025', role: 'hospital', organization: 'Safdarjung Hospital', hospital: 'Safdarjung Hospital', hospitalId: 'H005', phone: '+91 11 2616 5060' },
    { name: 'ESI Hospital Hyderabad Node', email: 'esi.hyd@pharmtrack.gov.in', password: 'Esi@2025', role: 'hospital', organization: 'ESI Hospital Hyderabad', hospital: 'ESI Hospital Hyderabad', hospitalId: 'H006', phone: '+91 40 2381 4939' },
    { name: 'District Hospital Jaipur Node', email: 'dh.jaipur@pharmtrack.gov.in', password: 'Jaipur@2025', role: 'hospital', organization: 'District Hospital Jaipur', hospital: 'District Hospital Jaipur', hospitalId: 'H007', phone: '+91 141 260 1122' },
    { name: 'Civil Hospital Ahmedabad Node', email: 'civil.ahmedabad@pharmtrack.gov.in', password: 'Civil@2025', role: 'hospital', organization: 'Civil Hospital Ahmedabad', hospital: 'Civil Hospital Ahmedabad', hospitalId: 'H008', phone: '+91 79 2268 0074' },
    { name: 'Victoria Hospital Bengaluru Node', email: 'victoria.blr@pharmtrack.gov.in', password: 'Victoria@2025', role: 'hospital', organization: 'Victoria Hospital Bengaluru', hospital: 'Victoria Hospital Bengaluru', hospitalId: 'H009', phone: '+91 80 2670 1150' },
    { name: 'Government Hospital Chennai Node', email: 'gh.chennai@pharmtrack.gov.in', password: 'Chennai@2025', role: 'hospital', organization: 'Government Hospital Chennai', hospital: 'Government Hospital Chennai', hospitalId: 'H010', phone: '+91 44 2530 5000' },
    { name: 'GMCH Guwahati Node', email: 'gmch.guwahati@pharmtrack.gov.in', password: 'Gmch@2025', role: 'hospital', organization: 'GMCH Guwahati', hospital: 'GMCH Guwahati', hospitalId: 'H011', phone: '+91 361 252 9457' },
    { name: 'SCB Medical College Cuttack Node', email: 'scb.cuttack@pharmtrack.gov.in', password: 'Scb@2025', role: 'hospital', organization: 'SCB Medical College Cuttack', hospital: 'SCB Medical College Cuttack', hospitalId: 'H012', phone: '+91 671 241 4080' },

    // Unique Supplier Accounts
    { name: 'Sun Pharmaceutical Supply', email: 'supply@sunpharma.com', password: 'Sun@2025', role: 'supplier', organization: 'Sun Pharmaceutical', supplierId: 'S002', phone: '+91 22 4324 4324' },
    { name: "Dr. Reddy's Laboratories Orders", email: 'orders@drreddys.com', password: 'Reddys@2025', role: 'supplier', organization: "Dr. Reddy's Laboratories", supplierId: 'S003', phone: '+91 40 4900 2900' },
    { name: 'Lupin Pharma Supply', email: 'supply@lupin.com', password: 'Lupin@2025', role: 'supplier', organization: 'Lupin Ltd', supplierId: 'S004', phone: '+91 22 6640 2222' },
    { name: 'Aurobindo Pharma Orders', email: 'orders@aurobindo.com', password: 'Aurobindo@2025', role: 'supplier', organization: 'Aurobindo Pharma', supplierId: 'S005', phone: '+91 40 6672 5000' },
    { name: 'Alkem Laboratories Supply', email: 'supply@alkem.com', password: 'Alkem@2025', role: 'supplier', organization: 'Alkem Laboratories', supplierId: 'S006', phone: '+91 22 3982 9999' },
    { name: 'Macleods Pharmaceuticals Orders', email: 'orders@macleods.com', password: 'Macleods@2025', role: 'supplier', organization: 'Macleods Pharmaceuticals', supplierId: 'S007', phone: '+91 22 6676 2800' },
    { name: 'Cadila Healthcare Supply', email: 'supply@cadila.com', password: 'Cadila@2025', role: 'supplier', organization: 'Cadila Healthcare', supplierId: 'S008', phone: '+91 79 2686 8100' },

    // Unique Regional Warehouse Accounts
    { name: 'Regional Warehouse Mumbai Mgr', email: 'wh.mumbai@pharmtrack.gov.in', password: 'Warehouse@2025', role: 'warehouse', organization: 'Regional Warehouse Mumbai', warehouse: 'Regional Warehouse, Mumbai', warehouseId: 'WH-MUM', phone: '+91 22 2847 1122' },
    { name: 'Regional Warehouse Chennai Mgr', email: 'wh.chennai@pharmtrack.gov.in', password: 'Warehouse@2025', role: 'warehouse', organization: 'Regional Warehouse Chennai', warehouse: 'Regional Warehouse, Chennai', warehouseId: 'WH-CHE', phone: '+91 44 2256 3344' },
    { name: 'Regional Warehouse Kolkata Mgr', email: 'wh.kolkata@pharmtrack.gov.in', password: 'Warehouse@2025', role: 'warehouse', organization: 'Regional Warehouse Kolkata', warehouse: 'Regional Warehouse, Kolkata', warehouseId: 'WH-KOL', phone: '+91 33 2411 5566' },
    { name: 'Central Warehouse Bengaluru Mgr', email: 'wh.bengaluru@pharmtrack.gov.in', password: 'Warehouse@2025', role: 'warehouse', organization: 'Central Warehouse Bengaluru', warehouse: 'Central Warehouse, Bengaluru', warehouseId: 'WH-BLR', phone: '+91 80 2344 7788' },
  ];

  for (const u of users) {
    await User.create(u);
  }
  console.log(`[Seed] Created ${users.length} authenticated organization users across all entities and roles`);


  // 3. Seed Drugs
  const drugsData = [
    { drugId: 'D001', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Cipla Ltd', unitPrice: 2.5, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 5000, safetyStock: 2000 },
    { drugId: 'D002', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', manufacturer: 'Sun Pharma', unitPrice: 8.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 3000, safetyStock: 1200 },
    { drugId: 'D003', name: 'Insulin Glargine 100IU', genericName: 'Insulin Glargine', category: 'Antidiabetic', manufacturer: 'Novo Nordisk', unitPrice: 650.0, storageCondition: 'Refrigerated 2–8°C', temperatureMin: 2, temperatureMax: 8, reorderLevel: 500, safetyStock: 200 },
    { drugId: 'D004', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', manufacturer: "Dr. Reddy's", unitPrice: 5.5, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 4000, safetyStock: 1500 },
    { drugId: 'D005', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Lupin Ltd', unitPrice: 3.2, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 5000, safetyStock: 2000 },
    { drugId: 'D006', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Cipla Ltd', unitPrice: 45.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 2000, safetyStock: 800 },
    { drugId: 'D007', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin Calcium', category: 'Statin', manufacturer: 'Pfizer India', unitPrice: 12.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 3000, safetyStock: 1000 },
    { drugId: 'D008', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', manufacturer: 'Ranbaxy', unitPrice: 6.5, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 4000, safetyStock: 1500 },
    { drugId: 'D009', name: 'Ceftriaxone 1g Inj', genericName: 'Ceftriaxone Sodium', category: 'Antibiotic', manufacturer: 'Wockhardt', unitPrice: 85.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 1000, safetyStock: 400 },
    { drugId: 'D010', name: 'Dexamethasone 4mg Inj', genericName: 'Dexamethasone Sodium Phosphate', category: 'Corticosteroid', manufacturer: 'Cadila Healthcare', unitPrice: 35.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 800, safetyStock: 300 },
    { drugId: 'D011', name: 'Salbutamol 100mcg Inhaler', genericName: 'Albuterol Sulfate', category: 'Bronchodilator', manufacturer: 'GSK India', unitPrice: 125.0, storageCondition: 'Room Temp below 30°C', temperatureMin: 15, temperatureMax: 30, reorderLevel: 600, safetyStock: 250 },
    { drugId: 'D012', name: 'Folic Acid 5mg', genericName: 'Folic Acid', category: 'Vitamin', manufacturer: 'Alkem Labs', unitPrice: 1.5, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 8000, safetyStock: 3000 },
    { drugId: 'D013', name: 'ORS Sachet', genericName: 'Oral Rehydration Salts', category: 'Electrolyte', manufacturer: 'FDC Ltd', unitPrice: 5.0, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 10000, safetyStock: 4000 },
    { drugId: 'D014', name: 'Heparin 5000IU Inj', genericName: 'Heparin Sodium', category: 'Anticoagulant', manufacturer: 'Piramal Healthcare', unitPrice: 95.0, storageCondition: 'Refrigerated 2–8°C', temperatureMin: 2, temperatureMax: 8, reorderLevel: 300, safetyStock: 100 },
    { drugId: 'D015', name: 'Morphine 10mg Inj', genericName: 'Morphine Sulfate', category: 'Opioid Analgesic', manufacturer: 'Neon Laboratories', unitPrice: 45.0, storageCondition: 'Controlled Room Temp', temperatureMin: 15, temperatureMax: 25, reorderLevel: 200, safetyStock: 80 },
    { drugId: 'D016', name: 'Vancomycin 500mg Inj', genericName: 'Vancomycin HCl', category: 'Antibiotic', manufacturer: 'Aurobindo Pharma', unitPrice: 220.0, storageCondition: 'Refrigerated 2–8°C', temperatureMin: 2, temperatureMax: 8, reorderLevel: 400, safetyStock: 150 },
    { drugId: 'D017', name: 'Ranitidine 150mg', genericName: 'Ranitidine HCl', category: 'H2 Blocker', manufacturer: 'Cipla Ltd', unitPrice: 4.5, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 5000, safetyStock: 2000 },
    { drugId: 'D018', name: 'Prednisolone 5mg', genericName: 'Prednisolone', category: 'Corticosteroid', manufacturer: 'Macleods Pharma', unitPrice: 3.8, storageCondition: 'Room Temp 15–25°C', temperatureMin: 15, temperatureMax: 25, reorderLevel: 3000, safetyStock: 1000 },
    { drugId: 'D019', name: 'Diazepam 5mg Inj', genericName: 'Diazepam', category: 'Benzodiazepine', manufacturer: 'Neon Laboratories', unitPrice: 28.0, storageCondition: 'Room Temp below 30°C', temperatureMin: 15, temperatureMax: 30, reorderLevel: 200, safetyStock: 80 },
    { drugId: 'D020', name: 'Dopamine 200mg Inj', genericName: 'Dopamine HCl', category: 'Vasopressor', manufacturer: 'Pfizer India', unitPrice: 180.0, storageCondition: 'Refrigerated 2–8°C', temperatureMin: 2, temperatureMax: 8, reorderLevel: 150, safetyStock: 60 },
  ];
  await Drug.insertMany(drugsData);
  console.log(`[Seed] Created ${drugsData.length} drugs`);

  // 4. Seed Hospitals
  const hospitalsData = [
    { hospitalId: 'H001', name: 'AIIMS New Delhi', city: 'New Delhi', state: 'Delhi', type: 'Tertiary', beds: 2500, latitude: 28.5665, longitude: 77.2100, status: 'Normal' },
    { hospitalId: 'H002', name: 'PGI Chandigarh', city: 'Chandigarh', state: 'Punjab', type: 'Tertiary', beds: 1800, latitude: 30.7650, longitude: 76.7770, status: 'Normal' },
    { hospitalId: 'H003', name: 'KGMU Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', type: 'Tertiary', beds: 2200, latitude: 26.8700, longitude: 80.9463, status: 'Emergency' },
    { hospitalId: 'H004', name: 'Seth GS Medical Mumbai', city: 'Mumbai', state: 'Maharashtra', type: 'Tertiary', beds: 1900, latitude: 19.0960, longitude: 72.8820, status: 'Normal' },
    { hospitalId: 'H005', name: 'Safdarjung Hospital', city: 'New Delhi', state: 'Delhi', type: 'Tertiary', beds: 1531, latitude: 28.5685, longitude: 77.2014, status: 'Normal' },
    { hospitalId: 'H006', name: 'ESI Hospital Hyderabad', city: 'Hyderabad', state: 'Telangana', type: 'Secondary', beds: 850, latitude: 17.3850, longitude: 78.4867, status: 'Low Stock' },
    { hospitalId: 'H007', name: 'District Hospital Jaipur', city: 'Jaipur', state: 'Rajasthan', type: 'Secondary', beds: 650, latitude: 26.9124, longitude: 75.7873, status: 'Emergency' },
    { hospitalId: 'H008', name: 'Civil Hospital Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', type: 'Secondary', beds: 1200, latitude: 23.0225, longitude: 72.5714, status: 'Normal' },
    { hospitalId: 'H009', name: 'Victoria Hospital Bengaluru', city: 'Bengaluru', state: 'Karnataka', type: 'Tertiary', beds: 1400, latitude: 12.9716, longitude: 77.5946, status: 'Normal' },
    { hospitalId: 'H010', name: 'Government Hospital Chennai', city: 'Chennai', state: 'Tamil Nadu', type: 'Tertiary', beds: 2100, latitude: 13.0827, longitude: 80.2707, status: 'Normal' },
    { hospitalId: 'H011', name: 'GMCH Guwahati', city: 'Guwahati', state: 'Assam', type: 'Tertiary', beds: 900, latitude: 26.1445, longitude: 91.7362, status: 'Emergency' },
    { hospitalId: 'H012', name: 'SCB Medical College Cuttack', city: 'Cuttack', state: 'Odisha', type: 'Tertiary', beds: 1400, latitude: 20.4625, longitude: 85.8830, status: 'Normal' },
  ];
  await Hospital.insertMany(hospitalsData);
  console.log(`[Seed] Created ${hospitalsData.length} hospitals`);

  // 5. Seed Suppliers
  const suppliersData = [
    { supplierId: 'S001', name: 'Cipla Ltd', contactPerson: 'Ramesh Singh', email: 'procurement@cipla.com', city: 'Mumbai', state: 'Maharashtra', score: 94, onTime: 96, quality: 95, fulfillment: 91, rejectedBatches: 2, delayedShipments: 3, totalOrders: 48 },
    { supplierId: 'S002', name: 'Sun Pharmaceutical', contactPerson: 'Alok Patel', email: 'supply@sunpharma.com', city: 'Mumbai', state: 'Maharashtra', score: 91, onTime: 93, quality: 92, fulfillment: 88, rejectedBatches: 3, delayedShipments: 4, totalOrders: 42 },
    { supplierId: 'S003', name: "Dr. Reddy's Laboratories", contactPerson: 'Venkatesh Rao', email: 'orders@drreddys.com', city: 'Hyderabad', state: 'Telangana', score: 89, onTime: 90, quality: 91, fulfillment: 86, rejectedBatches: 4, delayedShipments: 5, totalOrders: 38 },
    { supplierId: 'S004', name: 'Lupin Ltd', contactPerson: 'Deepak Joshi', email: 'supply@lupin.com', city: 'Mumbai', state: 'Maharashtra', score: 87, onTime: 88, quality: 89, fulfillment: 84, rejectedBatches: 5, delayedShipments: 6, totalOrders: 35 },
    { supplierId: 'S005', name: 'Aurobindo Pharma', contactPerson: 'Naveen Reddy', email: 'orders@aurobindo.com', city: 'Hyderabad', state: 'Telangana', score: 85, onTime: 86, quality: 87, fulfillment: 82, rejectedBatches: 6, delayedShipments: 7, totalOrders: 30 },
    { supplierId: 'S006', name: 'Alkem Laboratories', contactPerson: 'Manish Shah', email: 'supply@alkem.com', city: 'Mumbai', state: 'Maharashtra', score: 92, onTime: 94, quality: 93, fulfillment: 89, rejectedBatches: 2, delayedShipments: 3, totalOrders: 40 },
    { supplierId: 'S007', name: 'Macleods Pharmaceuticals', contactPerson: 'Sanjay Aggarwal', email: 'orders@macleods.com', city: 'Mumbai', state: 'Maharashtra', score: 88, onTime: 89, quality: 90, fulfillment: 85, rejectedBatches: 4, delayedShipments: 5, totalOrders: 32 },
    { supplierId: 'S008', name: 'Cadila Healthcare', contactPerson: 'Bhavin Desai', email: 'supply@cadila.com', city: 'Ahmedabad', state: 'Gujarat', score: 90, onTime: 91, quality: 92, fulfillment: 87, rejectedBatches: 3, delayedShipments: 4, totalOrders: 36 },
  ];
  await Supplier.insertMany(suppliersData);
  console.log(`[Seed] Created ${suppliersData.length} suppliers`);

  // 6. Seed Batches & Inventory (With realistic relative dates)
  const now = new Date();
  const futureDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const pastDays = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const inventoryData = [
    { invId: 'INV001', drugId: 'D001', drugName: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Analgesic', manufacturer: 'Cipla Ltd', batchNumber: 'PCM-2026-4521', mfgDate: pastDays(180), expiryDate: futureDays(286), quantity: 1240, unitPrice: 2.5, storageCondition: 'Room Temp', location: 'Central Warehouse, Delhi', supplierId: 'S001', supplierName: 'Cipla Ltd', status: 'Low Stock', daysToExpiry: 286 },
    { invId: 'INV002', drugId: 'D002', drugName: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Sun Pharma', batchNumber: 'AMX-2025-8832', mfgDate: pastDays(240), expiryDate: futureDays(208), quantity: 4800, unitPrice: 8.0, storageCondition: 'Room Temp', location: 'Regional Warehouse, Mumbai', supplierId: 'S002', supplierName: 'Sun Pharma', status: 'Healthy', daysToExpiry: 208 },
    { invId: 'INV003', drugId: 'D003', drugName: 'Insulin Glargine 100IU', generic: 'Insulin Glargine', category: 'Antidiabetic', manufacturer: 'Novo Nordisk', batchNumber: 'INS-2025-1194', mfgDate: pastDays(300), expiryDate: futureDays(14), quantity: 280, unitPrice: 650.0, storageCondition: 'Refrigerated', location: 'Cold Storage Unit A, Delhi', supplierId: 'S003', supplierName: "Dr. Reddy's", status: 'Critical', daysToExpiry: 14 },
    { invId: 'INV004', drugId: 'D004', drugName: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', category: 'Antihypertensive', manufacturer: "Dr. Reddy's", batchNumber: 'AML-2026-3341', mfgDate: pastDays(90), expiryDate: futureDays(439), quantity: 8200, unitPrice: 5.5, storageCondition: 'Room Temp', location: 'Central Warehouse, Delhi', supplierId: 'S003', supplierName: "Dr. Reddy's", status: 'Overstocked', daysToExpiry: 439 },
    { invId: 'INV005', drugId: 'D005', drugName: 'Metformin 500mg', generic: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'Lupin Ltd', batchNumber: 'MET-2025-7721', mfgDate: pastDays(150), expiryDate: futureDays(316), quantity: 3200, unitPrice: 3.2, storageCondition: 'Room Temp', location: 'Regional Warehouse, Chennai', supplierId: 'S004', supplierName: 'Lupin Ltd', status: 'Healthy', daysToExpiry: 316 },
    { invId: 'INV006', drugId: 'D006', drugName: 'Azithromycin 500mg', generic: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Cipla Ltd', batchNumber: 'AZI-2025-2210', mfgDate: pastDays(320), expiryDate: futureDays(28), quantity: 180, unitPrice: 45.0, storageCondition: 'Room Temp', location: 'District Hospital, Jaipur', supplierId: 'S001', supplierName: 'Cipla Ltd', status: 'Expiring Soon', daysToExpiry: 28 },
    { invId: 'INV007', drugId: 'D007', drugName: 'Atorvastatin 10mg', generic: 'Atorvastatin', category: 'Statin', manufacturer: 'Pfizer India', batchNumber: 'ATV-2026-5532', mfgDate: pastDays(60), expiryDate: futureDays(469), quantity: 5600, unitPrice: 12.0, storageCondition: 'Room Temp', location: 'Central Warehouse, Mumbai', supplierId: 'S002', supplierName: 'Sun Pharma', status: 'Healthy', daysToExpiry: 469 },
    { invId: 'INV008', drugId: 'D008', drugName: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'PPI', manufacturer: 'Ranbaxy', batchNumber: 'OMP-2025-4410', mfgDate: pastDays(330), expiryDate: futureDays(13), quantity: 320, unitPrice: 6.5, storageCondition: 'Room Temp', location: 'AIIMS, New Delhi', supplierId: 'S008', supplierName: 'Cadila Healthcare', status: 'Expiring Soon', daysToExpiry: 13 },
    { invId: 'INV009', drugId: 'D009', drugName: 'Ceftriaxone 1g Inj', generic: 'Ceftriaxone', category: 'Antibiotic', manufacturer: 'Wockhardt', batchNumber: 'CFT-2026-9921', mfgDate: pastDays(40), expiryDate: futureDays(500), quantity: 620, unitPrice: 85.0, storageCondition: 'Room Temp', location: 'Regional Warehouse, Kolkata', supplierId: 'S005', supplierName: 'Aurobindo Pharma', status: 'Healthy', daysToExpiry: 500 },
    { invId: 'INV010', drugId: 'D010', drugName: 'Dexamethasone 4mg Inj', generic: 'Dexamethasone', category: 'Corticosteroid', manufacturer: 'Cadila', batchNumber: 'DEX-2025-1122', mfgDate: pastDays(400), expiryDate: pastDays(18), quantity: 45, unitPrice: 35.0, storageCondition: 'Room Temp', location: 'ICU Store, KGMU', supplierId: 'S008', supplierName: 'Cadila Healthcare', status: 'Expired', daysToExpiry: -18 },
    { invId: 'INV011', drugId: 'D011', drugName: 'Salbutamol Inhaler', generic: 'Albuterol', category: 'Bronchodilator', manufacturer: 'GSK India', batchNumber: 'SAL-2026-3341', mfgDate: pastDays(50), expiryDate: futureDays(531), quantity: 1800, unitPrice: 125.0, storageCondition: 'Room Temp', location: 'Central Warehouse, Bengaluru', supplierId: 'S006', supplierName: 'Alkem Labs', status: 'Healthy', daysToExpiry: 531 },
    { invId: 'INV012', drugId: 'D016', drugName: 'Vancomycin 500mg Inj', generic: 'Vancomycin HCl', category: 'Antibiotic', manufacturer: 'Aurobindo Pharma', batchNumber: 'VAN-2026-8812', mfgDate: pastDays(45), expiryDate: futureDays(514), quantity: 95, unitPrice: 220.0, storageCondition: 'Refrigerated', location: 'Cold Storage Unit B, Mumbai', supplierId: 'S005', supplierName: 'Aurobindo Pharma', status: 'Low Stock', daysToExpiry: 514 },
    { invId: 'INV013', drugId: 'D014', drugName: 'Heparin 5000IU Inj', generic: 'Heparin Sodium', category: 'Anticoagulant', manufacturer: 'Piramal Healthcare', batchNumber: 'HEP-2026-1044', mfgDate: pastDays(120), expiryDate: futureDays(408), quantity: 410, unitPrice: 95.0, storageCondition: 'Refrigerated', location: 'Cold Room Alpha, Delhi', supplierId: 'S003', supplierName: "Dr. Reddy's", status: 'Healthy', daysToExpiry: 408 },
    { invId: 'INV014', drugId: 'D015', drugName: 'Morphine 10mg Inj', generic: 'Morphine Sulfate', category: 'Opioid Analgesic', manufacturer: 'Neon Laboratories', unitPrice: 45.0, batchNumber: 'MOR-2026-0091', mfgDate: pastDays(110), expiryDate: futureDays(348), quantity: 380, storageCondition: 'Room Temp', location: 'AIIMS New Delhi', supplierId: 'S006', supplierName: 'Alkem Labs', status: 'Healthy', daysToExpiry: 348 },
    { invId: 'INV015', drugId: 'D020', drugName: 'Dopamine 200mg Inj', generic: 'Dopamine HCl', category: 'Vasopressor', manufacturer: 'Pfizer India', unitPrice: 180.0, batchNumber: 'DOP-2025-7734', mfgDate: pastDays(160), expiryDate: futureDays(75), quantity: 60, storageCondition: 'Refrigerated', location: 'PGI Chandigarh', supplierId: 'S002', supplierName: 'Sun Pharma', status: 'Critical', daysToExpiry: 75 },
  ];

  for (const item of inventoryData) {
    const inv = new Inventory(item);
    inv.calculateStatus();
    await inv.save();

    // Create corresponding DrugBatch record with QR code
    const qrPayload = buildBatchQRPayload(item);
    const qrDataUrl = await generateQRCodeDataUrl(qrPayload);

    await DrugBatch.create({
      batchNumber: item.batchNumber,
      drugId: item.drugId,
      drugName: item.drugName,
      manufacturingDate: item.mfgDate,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      initialQuantity: item.quantity + 500,
      unitPrice: item.unitPrice,
      supplierId: item.supplierId,
      supplierName: item.supplierName,
      currentLocation: item.location,
      storageCondition: item.storageCondition,
      qualityStatus: item.daysToExpiry < 0 ? 'Expired' : item.daysToExpiry <= 30 ? 'Expiring Soon' : 'Passed',
      qrCode: qrDataUrl,
      movementHistory: [
        { date: item.mfgDate, from: item.supplierName, to: 'Central Warehouse', quantity: item.quantity + 500, action: 'Manufactured and Certified' },
        { date: new Date().toISOString().split('T')[0], from: 'Central Warehouse', to: item.location, quantity: item.quantity, action: 'Transferred and Stocked' },
      ],
    });
  }
  console.log(`[Seed] Created ${inventoryData.length} inventory records and batches with QR payloads`);

  // 7. Seed Purchase Orders
  const poData = [
    { poNumber: 'PO-2025-0182', drugName: 'Paracetamol 500mg', drugId: 'D001', supplier: 'Cipla Ltd', supplierId: 'S001', quantity: 15000, unitPrice: 2.5, totalValue: 37500, status: 'Confirmed', createdDate: pastDays(1), expectedDelivery: futureDays(10), hospital: 'Central Warehouse, Delhi' },
    { poNumber: 'PO-2025-0181', drugName: 'Insulin Glargine 100IU', drugId: 'D003', supplier: 'Novo Nordisk', supplierId: 'S003', quantity: 1000, unitPrice: 650.0, totalValue: 650000, status: 'Pending', createdDate: pastDays(2), expectedDelivery: futureDays(7), hospital: 'AIIMS New Delhi' },
    { poNumber: 'PO-2025-0180', drugName: 'Vancomycin 500mg Inj', drugId: 'D016', supplier: 'Aurobindo Pharma', supplierId: 'S005', quantity: 500, unitPrice: 220.0, totalValue: 110000, status: 'Approved', createdDate: pastDays(3), expectedDelivery: futureDays(8), hospital: 'Central Warehouse, Mumbai' },
    { poNumber: 'PO-2025-0179', drugName: 'Ceftriaxone 1g Inj', drugId: 'D009', supplier: 'Wockhardt', supplierId: 'S005', quantity: 2000, unitPrice: 85.0, totalValue: 170000, status: 'Delivered', createdDate: pastDays(9), expectedDelivery: pastDays(3), hospital: 'Regional Warehouse, Kolkata' },
    { poNumber: 'PO-2025-0178', drugName: 'Azithromycin 500mg', drugId: 'D006', supplier: 'Cipla Ltd', supplierId: 'S001', quantity: 3000, unitPrice: 45.0, totalValue: 135000, status: 'Confirmed', createdDate: pastDays(2), expectedDelivery: futureDays(1), hospital: 'Civil Hospital, Ahmedabad' },
    { poNumber: 'PO-2025-0177', drugName: 'ORS Sachet', drugId: 'D013', supplier: 'FDC Ltd', supplierId: 'S006', quantity: 50000, unitPrice: 5.0, totalValue: 250000, status: 'Delivered', createdDate: pastDays(14), expectedDelivery: pastDays(7), hospital: 'Regional Warehouse, Bhopal' },
  ];
  await PurchaseOrder.insertMany(poData);
  console.log(`[Seed] Created ${poData.length} purchase orders`);

  // 8. Seed Shipments
  const shipmentsData = [
    { shipmentId: 'SHP-2025-001', supplierId: 'S001', supplierName: 'Cipla Ltd', origin: 'Mumbai, MH', destination: 'AIIMS, New Delhi', drugName: 'Paracetamol 500mg', quantity: 15000, batchNumber: 'PCM-2025-9901', dispatchDate: pastDays(8), expectedArrival: futureDays(2), status: 'In Transit', progress: 65, currentLocation: 'Toll Plaza, NH48 near Kota', drugId: 'D001' },
    { shipmentId: 'SHP-2025-002', supplierId: 'S002', supplierName: 'Sun Pharma', origin: 'Vadodara, GJ', destination: 'PGI, Chandigarh', drugName: 'Amoxicillin 500mg', quantity: 8000, batchNumber: 'AMX-2025-5542', dispatchDate: pastDays(6), expectedArrival: futureDays(1), status: 'In Transit', progress: 80, currentLocation: 'Ambala, Haryana', drugId: 'D002' },
    { shipmentId: 'SHP-2025-003', supplierId: 'S003', supplierName: "Dr. Reddy's", origin: 'Hyderabad, TS', destination: 'Victoria Hospital, Bengaluru', drugName: 'Atorvastatin 10mg', quantity: 5000, batchNumber: 'ATV-2025-7721', dispatchDate: pastDays(4), expectedArrival: pastDays(1), status: 'Arrived', progress: 100, currentLocation: 'Victoria Hospital, Bengaluru', drugId: 'D007' },
    { shipmentId: 'SHP-2025-004', supplierId: 'S004', supplierName: 'Lupin Ltd', origin: 'Pune, MH', destination: 'KGMU, Lucknow', drugName: 'Metformin 500mg', quantity: 12000, batchNumber: 'MET-2025-4432', dispatchDate: pastDays(10), expectedArrival: futureDays(4), status: 'Dispatched', progress: 20, currentLocation: 'Nashik, Maharashtra', drugId: 'D005' },
    { shipmentId: 'SHP-2025-005', supplierId: 'S005', supplierName: 'Aurobindo Pharma', origin: 'Hyderabad, TS', destination: 'Government Hospital, Chennai', drugName: 'Insulin Glargine 100IU', quantity: 2000, batchNumber: 'INS-2025-3321', dispatchDate: pastDays(3), expectedArrival: futureDays(1), status: 'Packed', progress: 10, currentLocation: 'Aurobindo Warehouse, Hyderabad', drugId: 'D003' },
    { shipmentId: 'SHP-2025-006', supplierId: 'S006', supplierName: 'Alkem Labs', origin: 'Mumbai, MH', destination: 'ESI Hospital, Hyderabad', drugName: 'Folic Acid 5mg', quantity: 20000, batchNumber: 'FOL-2025-8810', dispatchDate: pastDays(2), expectedArrival: futureDays(3), status: 'In Transit', progress: 45, currentLocation: 'Solapur, Maharashtra', drugId: 'D012' },
    { shipmentId: 'SHP-2025-007', supplierId: 'S001', supplierName: 'Cipla Ltd', origin: 'Mumbai, MH', destination: 'Civil Hospital, Ahmedabad', drugName: 'Azithromycin 500mg', quantity: 3000, batchNumber: 'AZI-2025-6620', dispatchDate: pastDays(1), expectedArrival: futureDays(1), status: 'Approved', progress: 5, currentLocation: 'Cipla Warehouse, Mumbai', drugId: 'D006' },
    { shipmentId: 'SHP-2025-008', supplierId: 'S008', supplierName: 'Cadila Healthcare', origin: 'Ahmedabad, GJ', destination: 'SCB Medical, Cuttack', drugName: 'Ceftriaxone 1g Inj', quantity: 4000, batchNumber: 'CFT-2025-9901', dispatchDate: pastDays(5), expectedArrival: futureDays(6), status: 'In Transit', progress: 55, currentLocation: 'Nagpur, Maharashtra', drugId: 'D009' },
  ];
  await Shipment.insertMany(shipmentsData);
  console.log(`[Seed] Created ${shipmentsData.length} shipments`);

  // 9. Seed Emergency Requests
  const emergencyData = [
    { requestId: 'ER-2025-001', hospitalId: 'H003', hospitalName: 'KGMU Lucknow', drugName: 'Insulin Glargine', requiredQty: 500, priority: 'Critical', requiredBy: '6 Hours', status: 'Pending', recommendedSource: 'Central Warehouse, Delhi', distance: 498, createdAt: new Date(), drugId: 'D003' },
    { requestId: 'ER-2025-002', hospitalId: 'H007', hospitalName: 'District Hospital Jaipur', drugName: 'Dopamine 200mg Inj', requiredQty: 100, priority: 'Critical', requiredBy: '4 Hours', status: 'Sourcing', recommendedSource: 'AIIMS New Delhi', distance: 267, createdAt: new Date(), drugId: 'D020' },
    { requestId: 'ER-2025-003', hospitalId: 'H011', hospitalName: 'GMCH Guwahati', drugName: 'Vancomycin 500mg Inj', requiredQty: 200, priority: 'High', requiredBy: '12 Hours', status: 'Approved', recommendedSource: 'SCB Medical College, Cuttack', distance: 490, createdAt: new Date(), drugId: 'D016' },
    { requestId: 'ER-2025-004', hospitalId: 'H006', hospitalName: 'ESI Hospital Hyderabad', drugName: 'Heparin 5000IU', requiredQty: 150, priority: 'High', requiredBy: '8 Hours', status: 'Pending', recommendedSource: 'Regional Warehouse, Chennai', distance: 628, createdAt: new Date(), drugId: 'D014' },
    { requestId: 'ER-2025-005', hospitalId: 'H012', hospitalName: 'SCB Medical Cuttack', drugName: 'Morphine 10mg Inj', requiredQty: 80, priority: 'Medium', requiredBy: '24 Hours', status: 'Pending', recommendedSource: 'Regional Warehouse, Kolkata', distance: 195, createdAt: new Date(), drugId: 'D015' },
  ];
  await EmergencyRequest.insertMany(emergencyData);
  console.log(`[Seed] Created ${emergencyData.length} emergency requests`);

  // 10. Seed Stock Redistribution Opportunities
  const redistributionData = [
    { transferId: 'RD-001', drugName: 'Paracetamol 500mg', drugId: 'D001', sourceHospital: 'Civil Hospital, Ahmedabad', sourceId: 'H008', sourceStock: 5000, sourceExpected: 2500, excess: 2500, targetHospital: 'KGMU, Lucknow', targetId: 'H003', targetStock: 300, targetExpected: 1800, shortage: 1500, recommended: 1500, urgency: 'High', distance: 1042, expiryDays: 316, estimatedSavings: 37500, status: 'Pending' },
    { transferId: 'RD-002', drugName: 'Amoxicillin 500mg', drugId: 'D002', sourceHospital: 'Victoria Hospital, Bengaluru', sourceId: 'H009', sourceStock: 4200, sourceExpected: 1800, excess: 2400, targetHospital: 'GMCH, Guwahati', targetId: 'H011', targetStock: 120, targetExpected: 900, shortage: 780, recommended: 800, urgency: 'Critical', distance: 1936, expiryDays: 208, estimatedSavings: 64000, status: 'Pending' },
    { transferId: 'RD-003', drugName: 'Metformin 500mg', drugId: 'D005', sourceHospital: 'Government Hospital, Chennai', sourceId: 'H010', sourceStock: 7200, sourceExpected: 3200, excess: 4000, targetHospital: 'ESI Hospital, Hyderabad', targetId: 'H006', targetStock: 400, targetExpected: 1600, shortage: 1200, recommended: 1200, urgency: 'High', distance: 628, expiryDays: 316, estimatedSavings: 38400, status: 'Pending' },
    { transferId: 'RD-004', drugName: 'Atorvastatin 10mg', drugId: 'D007', sourceHospital: 'PGI, Chandigarh', sourceId: 'H002', sourceStock: 3800, sourceExpected: 1500, excess: 2300, targetHospital: 'Safdarjung Hospital', targetId: 'H005', targetStock: 600, targetExpected: 2200, shortage: 1600, recommended: 1600, urgency: 'Medium', distance: 260, expiryDays: 469, estimatedSavings: 19200, status: 'Pending' },
  ];
  await StockTransfer.insertMany(redistributionData);
  console.log(`[Seed] Created ${redistributionData.length} stock redistribution recommendations`);

  // 11. Seed Cold Chain Units & Historical Readings
  const genLogs = (baseTemp) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      temp: parseFloat((baseTemp + (Math.sin(i / 3) * 1.5)).toFixed(1)),
      humidity: Math.floor(60 + Math.cos(i / 3) * 10),
      timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000),
    }));
  };

  const coldUnitsData = [
    { storageUnitId: 'CCU-A', name: 'Cold Room Alpha', location: 'Central Warehouse, Delhi', temperature: 4.3, humidity: 62, status: 'Safe', minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ['Insulin Glargine', 'Heparin 5000IU', 'Dopamine 200mg'], lastUpdated: new Date().toISOString(), alerts: 0, hourlyLogs: genLogs(4.3) },
    { storageUnitId: 'CCU-B', name: 'Cold Room Beta', location: 'Regional Warehouse, Mumbai', temperature: 11.8, humidity: 85, status: 'Critical', minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ['Vancomycin 500mg', 'Insulin Glargine'], lastUpdated: new Date().toISOString(), alerts: 3, hourlyLogs: genLogs(10.5) },
    { storageUnitId: 'CCU-C', name: 'Cold Room Gamma', location: 'Cold Storage, Bengaluru', temperature: 7.1, humidity: 68, status: 'Safe', minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ['Insulin Glargine 100IU', 'Vaccine Storage'], lastUpdated: new Date().toISOString(), alerts: 0, hourlyLogs: genLogs(6.8) },
    { storageUnitId: 'CCU-D', name: 'Cold Room Delta', location: 'Warehouse, Hyderabad', temperature: 8.5, humidity: 71, status: 'Warning', minTemp: 2, maxTemp: 8, minHumidity: 40, maxHumidity: 75, drugs: ['Dopamine 200mg', 'Heparin 5000IU'], lastUpdated: new Date().toISOString(), alerts: 1, hourlyLogs: genLogs(8.0) },
  ];
  await ColdChainReading.insertMany(coldUnitsData);
  console.log(`[Seed] Created ${coldUnitsData.length} cold chain storage units with hourly telemetry`);

  // 12. Seed Recalls
  const recallsData = [
    { recallId: 'RECALL-2025-001', batchNumber: 'OMP-2025-4410', drugName: 'Omeprazole 20mg', reason: 'Quality defect: tablet dissolution failure', severity: 'Moderate', affectedHospitals: 3, affectedQty: 320, status: 'Active', initiatedBy: 'Ranbaxy QC Dept', date: pastDays(5), hospitals: ['AIIMS New Delhi', 'Safdarjung Hospital', 'District Hospital Jaipur'] },
    { recallId: 'RECALL-2025-002', batchNumber: 'PCM-2026-4521', drugName: 'Paracetamol 500mg', reason: 'Subpotency — active ingredient below specification', severity: 'High', affectedHospitals: 12, affectedQty: 1240, status: 'Investigating', initiatedBy: 'CDSCO National Recall', date: pastDays(7), hospitals: ['AIIMS New Delhi', 'PGI Chandigarh', 'KGMU Lucknow', 'Seth GS Medical Mumbai', 'Safdarjung Hospital', 'ESI Hospital Hyderabad', 'District Hospital Jaipur', 'Civil Hospital Ahmedabad', 'Victoria Hospital Bengaluru', 'Government Hospital Chennai', 'GMCH Guwahati', 'SCB Medical College Cuttack'] },
  ];
  await Recall.insertMany(recallsData);
  console.log(`[Seed] Created ${recallsData.length} national recall records`);

  // 13. Seed Notifications
  const notificationsData = [
    { notifId: 'N001', type: 'critical', message: 'Critical stock: Insulin Glargine at KGMU Lucknow — only 14 days remaining', time: '2 min ago', read: false, entityType: 'Inventory', severity: 'Critical' },
    { notifId: 'N002', type: 'warning', message: 'Drug batch AZI-2025-2210 expiring in 28 days — 180 units at Jaipur', time: '8 min ago', read: false, entityType: 'Inventory', severity: 'High' },
    { notifId: 'N003', type: 'critical', message: 'Cold-chain breach: Cold Room Beta temperature at 11.8°C (safe range: 2–8°C)', time: '15 min ago', read: false, entityType: 'ColdChain', severity: 'Critical' },
    { notifId: 'N004', type: 'warning', message: 'Shipment SHP-2025-004 delayed by 2 days due to route congestion near Nashik', time: '32 min ago', read: false, entityType: 'Shipment', severity: 'Medium' },
    { notifId: 'N005', type: 'info', message: 'Emergency request ER-2025-001 received from KGMU Lucknow for Insulin Glargine', time: '1 hr ago', read: true, entityType: 'Emergency', severity: 'High' },
    { notifId: 'N006', type: 'info', message: 'Redistribution opportunity: Transfer 1,500 units Paracetamol from Ahmedabad → Lucknow', time: '2 hr ago', read: true, entityType: 'Transfer', severity: 'Medium' },
    { notifId: 'N007', type: 'success', message: 'Purchase Order PO-2025-0182 generated for 15,000 units Paracetamol — Cipla Ltd', time: '3 hr ago', read: true, entityType: 'PurchaseOrder', severity: 'Low' },
    { notifId: 'N008', type: 'info', message: 'Shipment SHP-2025-003 arrived at Victoria Hospital, Bengaluru', time: '4 hr ago', read: true, entityType: 'Shipment', severity: 'Low' },
    { notifId: 'N009', type: 'critical', message: 'Batch DEX-2025-1122 expired — 45 units of Dexamethasone 4mg at KGMU', time: '6 hr ago', read: true, entityType: 'Inventory', severity: 'Critical' },
    { notifId: 'N010', type: 'warning', message: "Supplier Dr. Reddy's fulfillment rate dropped to 86% this quarter", time: '1 day ago', read: true, entityType: 'Supplier', severity: 'Medium' },
  ];
  await Notification.insertMany(notificationsData);
  console.log(`[Seed] Created ${notificationsData.length} notifications`);

  // 14. Seed Audit Logs
  const auditLogsData = [
    { logId: 'AL001', user: 'Dr. Rajesh Kumar (Admin)', action: 'Generated Purchase Order', entity: 'PO-2025-0182', detail: '15,000 units Paracetamol 500mg — Cipla Ltd', time: new Date().toISOString(), type: 'create' },
    { logId: 'AL002', user: 'Ramesh Singh (Supplier)', action: 'Accepted Purchase Order', entity: 'PO-2025-0182', detail: 'Cipla Ltd confirmed order acceptance', time: new Date().toISOString(), type: 'update' },
    { logId: 'AL003', user: 'Priya Sharma (Warehouse)', action: 'Flagged Cold Chain Breach', entity: 'CCU-B', detail: 'Temperature at 11.8°C — safe range 2–8°C', time: new Date().toISOString(), type: 'alert' },
    { logId: 'AL004', user: 'System (AI Engine)', action: 'Generated Redistribution Recommendation', entity: 'RD-001', detail: 'Transfer 1,500 units Paracetamol from Ahmedabad to Lucknow', time: new Date().toISOString(), type: 'ai' },
    { logId: 'AL005', user: 'Dr. Meena Iyer (Admin)', action: 'Approved Emergency Transfer', entity: 'ER-2025-003', detail: '200 units Vancomycin — GMCH Guwahati', time: new Date().toISOString(), type: 'approve' },
    { logId: 'AL006', user: 'Suresh Verma (Pharmacist)', action: 'Reported Expired Batch', entity: 'DEX-2025-1122', detail: '45 units Dexamethasone 4mg — quarantined', time: new Date().toISOString(), type: 'alert' },
    { logId: 'AL007', user: 'System', action: 'Dispatched Shipment', entity: 'SHP-2025-001', detail: '15,000 units Paracetamol dispatched from Mumbai', time: new Date().toISOString(), type: 'update' },
    { logId: 'AL008', user: 'Admin Portal', action: 'Created Drug Recall Notice', entity: 'RECALL-2025-001', detail: 'Batch OMP-2025-4410 recalled — quality issue', time: new Date().toISOString(), type: 'alert' },
    { logId: 'AL009', user: 'System (IoT Gateway)', action: 'Cold Chain Alert Triggered', entity: 'CCU-B', detail: 'Humidity reached 85% — threshold 75%', time: new Date().toISOString(), type: 'alert' },
    { logId: 'AL010', user: 'Dr. Anil Mehta (Hospital)', action: 'Raised Emergency Request', entity: 'ER-2025-001', detail: '500 units Insulin Glargine — 6 hour window', time: new Date().toISOString(), type: 'create' },
  ];
  await AuditLog.insertMany(auditLogsData);
  console.log(`[Seed] Created ${auditLogsData.length} audit trail logs`);

  console.log('[Seed] Database initialization complete!');
};

export const seedDatabaseIfEmpty = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[Seed] Empty database detected. Running automated seed script...');
    await seedDatabase();
  }
};

// If run directly: node src/seed/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  import('../config/database.js').then(async ({ connectDB }) => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  });
}
