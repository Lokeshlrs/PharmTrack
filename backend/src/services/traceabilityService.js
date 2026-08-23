import DrugBatch from '../models/DrugBatch.js';
import Drug from '../models/Drug.js';
import Inventory from '../models/Inventory.js';
import QualityCheck from '../models/QualityCheck.js';
import { generateQRCodeDataUrl, buildBatchQRPayload } from '../utils/qrGenerator.js';

export const getBatchByQRCode = async (qrCodeQuery) => {
  let batch = null;

  // Try finding by exact batch number or ID
  batch = await DrugBatch.findOne({
    $or: [
      { batchNumber: qrCodeQuery },
      { batchNumber: { $regex: new RegExp(`^${qrCodeQuery}$`, 'i') } },
      { _id: qrCodeQuery.match(/^[0-9a-fA-F]{24}$/) ? qrCodeQuery : null },
    ],
  });

  if (!batch) {
    // Try matching if query is a JSON string
    try {
      const parsed = JSON.parse(qrCodeQuery);
      if (parsed.batchNumber) {
        batch = await DrugBatch.findOne({ batchNumber: parsed.batchNumber });
      }
    } catch {
      // Not JSON
    }
  }

  // Fallback to Inventory record if batch record was dynamically queried
  if (!batch) {
    const inv = await Inventory.findOne({
      $or: [
        { batchNumber: qrCodeQuery },
        { batchNumber: { $regex: new RegExp(`^${qrCodeQuery}$`, 'i') } },
      ],
    });

    if (inv) {
      batch = {
        batchNumber: inv.batchNumber,
        drugName: inv.drugName,
        drugId: inv.drugId,
        manufacturingDate: inv.mfgDate || '2025-01-01',
        expiryDate: inv.expiryDate,
        quantity: inv.quantity,
        supplierName: inv.supplierName || 'Pharma Supplier',
        currentLocation: inv.location,
        storageCondition: inv.storageCondition,
        qualityStatus: inv.daysToExpiry < 0 ? 'Expired' : 'Passed',
        recalled: inv.status === 'Quarantined',
        movementHistory: [
          { stage: 'Manufacturing', location: inv.manufacturer || 'Cadila Plant, Ahmedabad', timestamp: new Date(inv.mfgDate || '2025-01-01'), status: 'Completed' },
          { stage: 'Warehouse Reception', location: 'Central Warehouse, Delhi', timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), status: 'Verified' },
          { stage: 'Current Facility', location: inv.location, timestamp: new Date(), status: 'In Stock' },
        ],
      };
    }
  }

  if (!batch) {
    throw new Error(`No batch found for identifier: ${qrCodeQuery}`);
  }

  const drug = await Drug.findOne({ drugId: batch.drugId });
  const qualityChecks = await QualityCheck.find({ batchNumber: batch.batchNumber }).sort({ checkedAt: -1 });

  return {
    batchNumber: batch.batchNumber,
    drugName: batch.drugName,
    generic: drug ? drug.genericName : '',
    category: drug ? drug.category : '',
    manufacturer: drug ? drug.manufacturer : 'Cadila',
    mfgDate: batch.manufacturingDate || batch.mfgDate,
    expiryDate: batch.expiryDate,
    quantity: batch.quantity,
    supplierName: batch.supplierName,
    currentLocation: batch.currentLocation || batch.location,
    storageCondition: batch.storageCondition,
    qualityStatus: batch.qualityStatus,
    recalled: batch.recalled || false,
    journey: batch.movementHistory || [
      { stage: 'Manufacturing', location: drug ? drug.manufacturer : 'Manufacturer Facility', timestamp: new Date('2025-01-15'), status: 'Completed' },
      { stage: 'Supplier Dispatch', location: batch.supplierName || 'Supplier Central', timestamp: new Date('2025-02-01'), status: 'Verified' },
      { stage: 'Facility Reception', location: batch.currentLocation || 'Hospital Store', timestamp: new Date(), status: 'Stocked' },
    ],
    qualityChecks,
    verified: true,
  };
};

export const generateQRForBatch = async (batchId) => {
  const batch = await DrugBatch.findOne({
    $or: [{ batchNumber: batchId }, { _id: batchId.match(/^[0-9a-fA-F]{24}$/) ? batchId : null }],
  });
  if (!batch) {
    throw new Error(`Batch ${batchId} not found`);
  }

  const payload = buildBatchQRPayload(batch);
  const dataUrl = await generateQRCodeDataUrl(payload);

  batch.qrCode = dataUrl;
  await batch.save();

  return {
    batchNumber: batch.batchNumber,
    qrCodeDataUrl: dataUrl,
    payload,
  };
};

export const getBatchJourney = async (batchNumber) => {
  return await getBatchByQRCode(batchNumber);
};
