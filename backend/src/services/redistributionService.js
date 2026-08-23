import StockTransfer from '../models/StockTransfer.js';
import Inventory from '../models/Inventory.js';
import Hospital from '../models/Hospital.js';
import Shipment from '../models/Shipment.js';
import { calculateDistanceKm, estimateTransitHours } from '../utils/haversine.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

/**
 * Smart Stock Redistribution Engine
 * Scans facility inventory balances and dynamically identifies surplus/deficit pairs
 */
export const getRedistributionRecommendations = async () => {
  // Check existing transfers stored in DB
  const existingTransfers = await StockTransfer.find({ status: { $ne: 'Rejected' } });
  if (existingTransfers.length > 0) {
    return existingTransfers;
  }

  // Dynamic calculation logic
  const allInventories = await Inventory.find({ status: { $nin: ['Quarantined', 'Expired'] } });
  const hospitals = await Hospital.find();
  const hospitalMap = new Map(hospitals.map((h) => [h.hospitalId, h]));

  const surplusList = [];
  const deficitList = [];

  for (const item of allInventories) {
    item.calculateStatus();
    const safetyStock = item.safetyStock || 500;
    const reorderLevel = item.reorderLevel || 1000;

    if (item.status === 'Overstocked' || item.quantity > reorderLevel * 2) {
      surplusList.push(item);
    } else if (item.status === 'Critical' || item.status === 'Low Stock' || item.quantity < safetyStock) {
      deficitList.push(item);
    }
  }

  const generatedTransfers = [];

  for (const deficit of deficitList) {
    // Find a matching surplus for the same drug
    const match = surplusList.find((s) => s.drugId === deficit.drugId && s.location !== deficit.location);
    if (!match) continue;

    const sourceHosp = hospitals.find((h) => match.location.includes(h.name.split(' ')[0]));
    const targetHosp = hospitals.find((h) => deficit.location.includes(h.name.split(' ')[0]));

    const distance =
      sourceHosp && targetHosp
        ? calculateDistanceKm(sourceHosp.latitude, sourceHosp.longitude, targetHosp.latitude, targetHosp.longitude)
        : 450;

    const transferQty = Math.min(
      match.quantity - (match.reorderLevel || 1000),
      (deficit.reorderLevel || 1500) - deficit.quantity
    );

    if (transferQty <= 0) continue;

    const urgency = deficit.status === 'Critical' ? 'Critical' : distance > 1000 ? 'High' : 'Medium';
    const estimatedSavings = Math.round(transferQty * (deficit.unitPrice || 10));

    const transfer = await StockTransfer.create({
      transferId: `RD-00${generatedTransfers.length + 1}`,
      drugId: deficit.drugId,
      drugName: deficit.drugName,
      sourceHospital: match.location,
      sourceId: sourceHosp ? sourceHosp.hospitalId : 'H008',
      sourceStock: match.quantity,
      sourceExpected: Math.round(match.quantity * 0.5),
      excess: match.quantity - Math.round(match.quantity * 0.5),
      targetHospital: deficit.location,
      targetId: targetHosp ? targetHosp.hospitalId : 'H003',
      targetStock: deficit.quantity,
      targetExpected: deficit.reorderLevel || 1800,
      shortage: (deficit.reorderLevel || 1800) - deficit.quantity,
      recommended: transferQty,
      batchNumber: match.batchNumber,
      distance,
      estimatedDeliveryTime: estimateTransitHours(distance),
      urgency,
      expiryDays: match.daysToExpiry || 300,
      estimatedSavings,
      confidenceScore: 92,
      status: 'Pending',
    });

    generatedTransfers.push(transfer);
  }

  return generatedTransfers.length > 0 ? generatedTransfers : await StockTransfer.find();
};

export const createTransfer = async (data, user = null) => {
  const transfer = await StockTransfer.create(data);

  await logAudit({
    user: user ? user.name : 'Redistribution Engine',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Created Redistribution Opportunity',
    entity: 'StockTransfer',
    entityId: transfer.transferId,
    detail: `Transfer ${transfer.recommended} units ${transfer.drugName} (${transfer.sourceHospital} → ${transfer.targetHospital})`,
    type: 'ai',
  });

  emitEvent('transfer:recommended', transfer);
  return transfer;
};

export const approveTransfer = async (id, user = null) => {
  const transfer = await StockTransfer.findOne({
    $or: [{ transferId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!transfer) {
    throw new Error(`Transfer ${id} not found`);
  }

  transfer.status = 'Approved';
  transfer.approvedBy = user ? user.name : 'System Admin';

  // Automatically create a tracking shipment for this transfer
  const shipment = await Shipment.create({
    shipmentId: `SHP-${Date.now().toString().slice(-6)}`,
    supplierId: transfer.sourceId,
    supplierName: transfer.sourceHospital,
    origin: transfer.sourceHospital,
    destination: transfer.targetHospital,
    drugName: transfer.drugName,
    drugId: transfer.drugId,
    quantity: transfer.recommended,
    batchNumber: transfer.batchNumber || `RD-BATCH-${Date.now().toString().slice(-4)}`,
    dispatchDate: new Date().toISOString().split('T')[0],
    expectedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Dispatched',
    progress: 25,
    currentLocation: `${transfer.sourceHospital} (Dispatched)`,
  });

  transfer.shipmentId = shipment.shipmentId;
  await transfer.save();

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Approved Stock Redistribution',
    entity: 'StockTransfer',
    entityId: transfer.transferId,
    detail: `Approved transfer of ${transfer.recommended} units of ${transfer.drugName} from ${transfer.sourceHospital} to ${transfer.targetHospital}. Created shipment ${shipment.shipmentId}.`,
    type: 'approve',
  });

  emitEvent('shipment:updated', shipment);
  return { transfer, shipment };
};

export const rejectTransfer = async (id, user = null) => {
  const transfer = await StockTransfer.findOne({
    $or: [{ transferId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!transfer) {
    throw new Error(`Transfer ${id} not found`);
  }

  transfer.status = 'Rejected';
  await transfer.save();

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Rejected Stock Redistribution',
    entity: 'StockTransfer',
    entityId: transfer.transferId,
    detail: `Rejected transfer ${transfer.transferId}`,
    type: 'update',
  });

  return transfer;
};
