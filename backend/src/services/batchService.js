import DrugBatch from '../models/DrugBatch.js';
import QualityCheck from '../models/QualityCheck.js';
import Inventory from '../models/Inventory.js';
import { generateQRCodeDataUrl, buildBatchQRPayload } from '../utils/qrGenerator.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listBatches = async (query = {}) => {
  const filter = {};
  if (query.drugId) filter.drugId = query.drugId;
  if (query.status) filter.qualityStatus = query.status;
  if (query.recalled != null) filter.recalled = query.recalled === 'true';
  if (query.search) {
    filter.$or = [
      { batchNumber: { $regex: query.search, $options: 'i' } },
      { drugName: { $regex: query.search, $options: 'i' } },
      { currentLocation: { $regex: query.search, $options: 'i' } },
    ];
  }
  return await DrugBatch.find(filter).sort({ expiryDate: 1 });
};

export const getBatchById = async (id) => {
  const batch = await DrugBatch.findOne({
    $or: [{ batchNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!batch) {
    throw new Error(`Batch ${id} not found`);
  }
  return batch;
};

export const createBatch = async (data, user = null) => {
  const existing = await DrugBatch.findOne({ batchNumber: data.batchNumber });
  if (existing) {
    throw new Error(`Batch number ${data.batchNumber} already exists`);
  }

  // Generate QR payload & QR code Data URL
  const qrPayload = buildBatchQRPayload(data);
  const qrCodeDataUrl = await generateQRCodeDataUrl(qrPayload);

  const batch = await DrugBatch.create({
    ...data,
    initialQuantity: data.quantity,
    qrCode: qrCodeDataUrl,
    movementHistory: [
      {
        date: data.manufacturingDate || new Date().toISOString().split('T')[0],
        from: data.supplierName || 'Manufacturing Plant',
        to: data.currentLocation || 'Central Warehouse',
        quantity: data.quantity,
        action: 'Batch Manufactured & Logged',
        recordedBy: user ? user.name : 'System Admin',
      },
    ],
  });

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'warehouse',
    userId: user ? user._id : null,
    action: 'Registered Drug Batch',
    entity: 'DrugBatch',
    entityId: batch.batchNumber,
    detail: `Batch ${batch.batchNumber} — ${batch.quantity} units of ${batch.drugName}`,
    type: 'create',
  });

  emitEvent('batch:created', batch);
  return batch;
};

export const recordQualityCheck = async (batchId, checkData, user = null) => {
  const batch = await getBatchById(batchId);

  const qc = await QualityCheck.create({
    batch: batch._id,
    batchNumber: batch.batchNumber,
    drugName: batch.drugName,
    inspector: user ? user.name : checkData.inspector || 'QC Inspector',
    result: checkData.result || 'Passed',
    remarks: checkData.remarks || 'Standard QC compliance passed',
    temperature: checkData.temperature,
    humidity: checkData.humidity,
    checkedAt: new Date(),
  });

  // Update batch quality status
  batch.qualityStatus = checkData.result === 'Failed' ? 'Quarantined' : checkData.result;
  batch.movementHistory.push({
    date: new Date().toISOString().split('T')[0],
    from: batch.currentLocation,
    to: batch.currentLocation,
    quantity: batch.quantity,
    action: `QC Inspection: ${qc.result} (${qc.remarks})`,
    recordedBy: qc.inspector,
  });
  await batch.save();

  // If quarantined, update inventory status
  if (qc.result === 'Quarantined' || qc.result === 'Failed') {
    await Inventory.updateMany(
      { batchNumber: batch.batchNumber },
      { status: 'Quarantined' }
    );
    emitEvent('inventory:updated', { batchNumber: batch.batchNumber, status: 'Quarantined' });
  }

  await logAudit({
    user: qc.inspector,
    userRole: 'pharmacist',
    action: 'Quality Check Recorded',
    entity: 'QualityCheck',
    entityId: batch.batchNumber,
    detail: `Inspection Result: ${qc.result} for ${batch.drugName}`,
    type: qc.result === 'Passed' ? 'update' : 'alert',
  });

  return { batch, qualityCheck: qc };
};

export const getBatchHistory = async (batchId) => {
  const batch = await getBatchById(batchId);
  const checks = await QualityCheck.find({ batchNumber: batch.batchNumber }).sort({ checkedAt: -1 });
  return {
    batch,
    movementHistory: batch.movementHistory || [],
    qualityChecks: checks,
  };
};
