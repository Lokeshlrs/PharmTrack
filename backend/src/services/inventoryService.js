import Inventory from '../models/Inventory.js';
import Drug from '../models/Drug.js';
import DrugBatch from '../models/DrugBatch.js';
import Consumption from '../models/Consumption.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listInventory = async (query = {}) => {
  const filter = {};
  if (query.drugId) filter.drugId = query.drugId;
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };
  if (query.status && query.status !== 'All') filter.status = query.status;
  if (query.category && query.category !== 'All') filter.category = query.category;
  if (query.search) {
    const s = query.search;
    filter.$or = [
      { drugName: { $regex: s, $options: 'i' } },
      { generic: { $regex: s, $options: 'i' } },
      { batchNumber: { $regex: s, $options: 'i' } },
      { location: { $regex: s, $options: 'i' } },
      { manufacturer: { $regex: s, $options: 'i' } },
    ];
  }

  const items = await Inventory.find(filter).sort({ expiryDate: 1 });
  // Ensure real-time dynamic status & daysToExpiry calculation
  return items.map((item) => {
    item.calculateStatus();
    return item;
  });
};

export const getInventoryById = async (id) => {
  const item = await Inventory.findOne({
    $or: [{ invId: id }, { batchNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!item) {
    throw new Error(`Inventory record ${id} not found`);
  }
  item.calculateStatus();
  return item;
};

export const createStock = async (data, user = null) => {
  let drugId = data.drugId;
  let generic = data.generic || '';
  let category = data.category || '';
  let manufacturer = data.manufacturer || '';
  let unitPrice = data.unitPrice || 0;
  let storageCondition = data.storageCondition || 'Room Temp';

  if (!drugId && data.drugName) {
    const drug = await Drug.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${data.drugName}$`, 'i') } },
        { name: { $regex: new RegExp(data.drugName, 'i') } },
      ],
    });
    if (drug) {
      drugId = drug.drugId;
      generic = drug.genericName || generic;
      category = drug.category || category;
      manufacturer = drug.manufacturer || manufacturer;
      unitPrice = drug.unitPrice || unitPrice;
      storageCondition = drug.storageCondition || storageCondition;
    } else {
      drugId = `D${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  const inv = new Inventory({
    invId: data.invId || `INV-${Date.now().toString().slice(-6)}`,
    drugId: drugId || 'D001',
    drugName: data.drugName,
    generic,
    category,
    manufacturer,
    batchNumber: data.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
    expiryDate: data.expiryDate,
    mfgDate: data.mfgDate || new Date().toISOString().split('T')[0],
    quantity: Number(data.quantity) || 0,
    unitPrice: Number(unitPrice) || 5.0,
    storageCondition,
    location: data.location || 'Central Warehouse, Delhi',
    supplierName: data.supplierName || 'Cipla Ltd',
    supplierId: data.supplierId || 'S001',
    status: data.status,
  });

  inv.calculateStatus();
  await inv.save();

  // Ensure corresponding DrugBatch record
  try {
    const existingBatch = await DrugBatch.findOne({ batchNumber: inv.batchNumber });
    if (!existingBatch) {
      await DrugBatch.create({
        batchNumber: inv.batchNumber,
        drugId: inv.drugId,
        drugName: inv.drugName,
        manufacturingDate: inv.mfgDate || new Date().toISOString().split('T')[0],
        expiryDate: inv.expiryDate,
        quantity: inv.quantity,
        supplierName: inv.supplierName,
        currentLocation: inv.location,
        storageCondition: inv.storageCondition,
        qualityStatus: inv.daysToExpiry <= 0 ? 'Expired' : 'Passed',
        recalled: false,
        movementHistory: [
          { stage: 'Manufacturing', location: inv.manufacturer || 'Manufacturing Facility', timestamp: new Date(), status: 'Completed' },
          { stage: 'Stock Inbound', location: inv.location, timestamp: new Date(), status: 'In Stock' },
        ],
      });
    }
  } catch {
    // Non-blocking
  }

  await logAudit({
    user: user ? user.name : 'Warehouse Manager',
    userRole: user ? user.role : 'warehouse',
    userId: user ? user._id : null,
    action: 'Added Inventory Stock',
    entity: 'Inventory',
    entityId: inv.batchNumber,
    detail: `Added ${inv.quantity} units of ${inv.drugName} (${inv.batchNumber}) at ${inv.location}`,
    type: 'create',
  });

  emitEvent('inventory:updated', inv);
  return inv;
};

export const adjustStock = async (id, { quantityAdjustment, reason }, user = null) => {
  const item = await getInventoryById(id);
  const oldQty = item.quantity;
  item.quantity = Math.max(0, item.quantity + Number(quantityAdjustment));
  if (item.quantity === 0 && reason?.toLowerCase().includes('dispos')) {
    item.status = 'Expired';
  } else if (reason?.toLowerCase().includes('quarantin')) {
    item.status = 'Quarantined';
  } else {
    item.calculateStatus();
  }
  await item.save();

  await logAudit({
    user: user ? user.name : 'Pharmacist',
    userRole: user ? user.role : 'pharmacist',
    userId: user ? user._id : null,
    action: 'Adjusted Stock Quantity',
    entity: 'Inventory',
    entityId: item.batchNumber,
    detail: `Adjusted by ${quantityAdjustment} units (${reason || 'Manual count'}). New: ${item.quantity}`,
    type: 'update',
    previousValue: { quantity: oldQty },
    newValue: { quantity: item.quantity },
  });

  emitEvent('inventory:updated', item);
  return item;
};

export const consumeStock = async (id, { quantity, department, dispensedTo }, user = null) => {
  const item = await getInventoryById(id);
  if (item.status === 'Quarantined' || item.status === 'Expired') {
    throw new Error(`Cannot consume from ${item.status} batch ${item.batchNumber}`);
  }

  const consumeQty = Number(quantity);
  if (consumeQty > item.quantity) {
    throw new Error(`Insufficient stock in batch ${item.batchNumber}. Available: ${item.quantity}`);
  }

  item.quantity -= consumeQty;
  item.calculateStatus();
  await item.save();

  // Log hospital consumption record for forecasting model
  await Consumption.create({
    hospitalId: item.location.slice(0, 10),
    hospitalName: item.location,
    drugId: item.drugId,
    drugName: item.drugName,
    batchNumber: item.batchNumber,
    quantity: consumeQty,
    date: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('en-US', { month: 'short' }),
    year: new Date().getFullYear(),
    department: department || 'Hospital Ward',
    dispensedTo: dispensedTo || 'In-Patient',
    recordedBy: user ? user.name : 'Pharmacist',
  });

  await logAudit({
    user: user ? user.name : 'Pharmacist',
    userRole: user ? user.role : 'pharmacist',
    userId: user ? user._id : null,
    action: 'Dispensed Drug Batch',
    entity: 'Inventory',
    entityId: item.batchNumber,
    detail: `Dispensed ${consumeQty} units to ${dispensedTo || 'Ward'} (${department || 'General'})`,
    type: 'update',
  });

  emitEvent('inventory:updated', item);
  return item;
};

export const getCriticalStock = async () => {
  const items = await Inventory.find({
    $or: [{ status: { $in: ['Critical', 'Low Stock', 'Expiring Soon'] } }],
  });
  return items.map((i) => {
    i.calculateStatus();
    return i;
  });
};

export const getExpiringStock = async (days = 30) => {
  const all = await Inventory.find({ status: { $ne: 'Quarantined' } });
  return all
    .map((i) => {
      i.calculateStatus();
      return i;
    })
    .filter((i) => i.daysToExpiry > 0 && i.daysToExpiry <= days);
};

export const getExpiredStock = async () => {
  const all = await Inventory.find({});
  return all
    .map((i) => {
      i.calculateStatus();
      return i;
    })
    .filter((i) => i.daysToExpiry <= 0);
};
