import Recall from '../models/Recall.js';
import DrugBatch from '../models/DrugBatch.js';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listRecalls = async () => {
  return await Recall.find().sort({ createdAt: -1 });
};

export const getRecallById = async (id) => {
  const recall = await Recall.findOne({
    $or: [{ recallId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!recall) {
    throw new Error(`Recall notice ${id} not found`);
  }
  return recall;
};

export const initiateRecall = async (data, user = null) => {
  const recallId = data.recallId || `RECALL-2026-0${Math.floor(Math.random() * 900) + 100}`;

  // Find all locations with this batch
  const inventories = await Inventory.find({ batchNumber: data.batchNumber });
  const totalAffectedQty = inventories.reduce((acc, i) => acc + i.quantity, 0);
  const hospitals = [...new Set(inventories.map((i) => i.location))];

  const recall = await Recall.create({
    recallId,
    drugId: data.drugId,
    drugName: data.drugName,
    batchNumber: data.batchNumber,
    reason: data.reason || 'Quality defect identified',
    severity: data.severity || 'High',
    affectedQty: totalAffectedQty || data.affectedQty || 0,
    affectedHospitals: hospitals.length || (data.hospitals ? data.hospitals.length : 0),
    hospitals: hospitals.length > 0 ? hospitals : data.hospitals || [],
    status: 'Active',
    initiatedBy: data.initiatedBy || (user ? user.name : 'Central Drug Authority (CDSCO)'),
    date: data.date || new Date().toISOString().split('T')[0],
  });

  // Mark DrugBatch as recalled
  await DrugBatch.updateMany(
    { batchNumber: data.batchNumber },
    { recalled: true, recallId, qualityStatus: 'Recalled' }
  );

  // Quarantine all inventory
  await Inventory.updateMany(
    { batchNumber: data.batchNumber },
    { status: 'Quarantined' }
  );

  await logAudit({
    user: user ? user.name : 'National Recall Authority',
    userRole: user ? user.role : 'government',
    userId: user ? user._id : null,
    action: 'Initiated National Drug Recall',
    entity: 'Recall',
    entityId: recall.recallId,
    detail: `Batch ${recall.batchNumber} (${recall.drugName}) recalled across ${recall.affectedHospitals} facilities. Reason: ${recall.reason}`,
    type: 'alert',
  });

  await Notification.create({
    type: 'critical',
    title: `DRUG RECALL: ${recall.drugName}`,
    message: `Batch ${recall.batchNumber} recalled by ${recall.initiatedBy}. Quarantined ${recall.affectedQty} units across ${recall.affectedHospitals} facilities.`,
    severity: recall.severity,
    entityType: 'Recall',
    entityId: recall.recallId,
    time: 'Just now',
  });

  emitEvent('recall:created', recall);
  emitEvent('notification:new', {
    type: 'critical',
    message: `Drug batch ${recall.batchNumber} (${recall.drugName}) recalled and quarantined`,
  });

  return recall;
};

export const quarantineRecallBatch = async (id, user = null) => {
  const recall = await getRecallById(id);
  recall.status = 'Quarantined';
  await recall.save();

  await Inventory.updateMany(
    { batchNumber: recall.batchNumber },
    { status: 'Quarantined' }
  );

  await logAudit({
    user: user ? user.name : 'Hospital Pharmacist',
    userRole: user ? user.role : 'pharmacist',
    userId: user ? user._id : null,
    action: 'Confirmed Recall Quarantine',
    entity: 'Recall',
    entityId: recall.recallId,
    detail: `All units of batch ${recall.batchNumber} secured in isolation quarantine storage`,
    type: 'alert',
  });

  return recall;
};

export const notifyRecallHospitals = async (id, user = null) => {
  const recall = await getRecallById(id);

  if (recall.hospitals?.length) {
    const notifs = recall.hospitals.map((hosp) => ({
      type: 'critical',
      title: 'URGENT DRUG RECALL NOTICE',
      message: `Quarantine required immediately: Batch ${recall.batchNumber} (${recall.drugName}) at ${hosp}`,
      severity: 'Critical',
      entityType: 'Recall',
      entityId: recall.recallId,
      time: 'Just now',
    }));
    await Notification.insertMany(notifs);
  }

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Dispatched Recall Broadcast to Facilities',
    entity: 'Recall',
    entityId: recall.recallId,
    detail: `Notified ${recall.hospitals.length} hospital nodes regarding recall of ${recall.batchNumber}`,
    type: 'update',
  });

  return {
    success: true,
    hospitalsNotified: recall.hospitals.length,
    hospitals: recall.hospitals,
  };
};
