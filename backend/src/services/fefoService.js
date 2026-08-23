import Inventory from '../models/Inventory.js';
import Consumption from '../models/Consumption.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

/**
 * Get available batches for a drug ordered by earliest expiry date (FEFO)
 */
export const getFEFOBatchesForDrug = async (drugId, location = null) => {
  const filter = {
    drugId,
    status: { $nin: ['Quarantined', 'Expired'] },
    quantity: { $gt: 0 },
  };
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  const batches = await Inventory.find(filter).sort({ expiryDate: 1 });
  return batches.filter((b) => {
    b.calculateStatus();
    return b.daysToExpiry > 0;
  });
};

/**
 * Consume stock using FEFO principle (First Expiry First Out)
 */
export const consumeFEFO = async ({ drugId, quantity, location, department, dispensedTo }, user = null) => {
  let needed = Number(quantity);
  if (needed <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const validBatches = await getFEFOBatchesForDrug(drugId, location);
  const totalAvailable = validBatches.reduce((acc, b) => acc + b.quantity, 0);

  if (totalAvailable < needed) {
    throw new Error(
      `Insufficient FEFO stock for drug ${drugId}. Requested: ${needed}, Available across valid batches: ${totalAvailable}`
    );
  }

  const consumptionPlan = [];

  for (const batch of validBatches) {
    if (needed <= 0) break;

    const deduct = Math.min(batch.quantity, needed);
    batch.quantity -= deduct;
    batch.calculateStatus();
    await batch.save();

    needed -= deduct;

    // Record consumption event
    await Consumption.create({
      hospitalId: batch.location.slice(0, 10),
      hospitalName: batch.location,
      drugId: batch.drugId,
      drugName: batch.drugName,
      batchNumber: batch.batchNumber,
      quantity: deduct,
      date: new Date().toISOString().split('T')[0],
      month: new Date().toLocaleString('en-US', { month: 'short' }),
      year: new Date().getFullYear(),
      department: department || 'FEFO Dispense Ward',
      dispensedTo: dispensedTo || 'Patient Prescription',
      recordedBy: user ? user.name : 'Pharmacist',
    });

    consumptionPlan.push({
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      daysToExpiry: batch.daysToExpiry,
      quantityDeducted: deduct,
      remainingBatchStock: batch.quantity,
    });
  }

  await logAudit({
    user: user ? user.name : 'Hospital Pharmacist',
    userRole: user ? user.role : 'pharmacist',
    userId: user ? user._id : null,
    action: 'FEFO Consumption Executed',
    entity: 'Inventory',
    entityId: drugId,
    detail: `Consumed ${quantity} units using FEFO across ${consumptionPlan.length} batch(es)`,
    type: 'update',
    newValue: consumptionPlan,
  });

  emitEvent('inventory:updated', { drugId, consumptionPlan });

  return {
    success: true,
    totalConsumed: Number(quantity),
    batchesUsed: consumptionPlan,
  };
};
