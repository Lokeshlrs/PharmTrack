import PurchaseOrder from '../models/PurchaseOrder.js';
import Drug from '../models/Drug.js';
import Supplier from '../models/Supplier.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';
import Notification from '../models/Notification.js';

export const listPurchaseOrders = async (query = {}) => {
  const filter = {};
  if (query.status && query.status !== 'All') filter.status = query.status;
  if (query.supplier) filter.supplier = { $regex: query.supplier, $options: 'i' };
  if (query.search) {
    filter.$or = [
      { poNumber: { $regex: query.search, $options: 'i' } },
      { drugName: { $regex: query.search, $options: 'i' } },
      { supplier: { $regex: query.search, $options: 'i' } },
      { hospital: { $regex: query.search, $options: 'i' } },
    ];
  }
  return await PurchaseOrder.find(filter).sort({ createdAt: -1 });
};

export const getPOById = async (id) => {
  const po = await PurchaseOrder.findOne({
    $or: [{ poNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!po) {
    throw new Error(`Purchase Order ${id} not found`);
  }
  return po;
};

export const createPO = async (data, user = null) => {
  const poNumber = data.poNumber || `PO-2026-0${Math.floor(Math.random() * 900) + 100}`;
  
  // Calculate total value if unit price provided or lookup drug
  let unitPrice = data.unitPrice || 0;
  if (!unitPrice && data.drugName) {
    const drug = await Drug.findOne({ name: data.drugName });
    if (drug) unitPrice = drug.unitPrice;
  }
  const totalValue = data.totalValue || Number(data.quantity) * unitPrice;

  const po = await PurchaseOrder.create({
    poNumber,
    drugName: data.drugName,
    drugId: data.drugId || 'D001',
    supplier: data.supplier || data.supplierName || 'Cipla Ltd',
    supplierId: data.supplierId || 'SUP-001',
    quantity: Number(data.quantity),
    unitPrice,
    totalValue,
    status: data.status || 'Pending',
    createdDate: data.createdDate || new Date().toISOString().split('T')[0],
    expectedDelivery: data.expectedDelivery || 'TBD',
    hospital: data.hospital || 'Central Warehouse, Delhi',
    createdBy: user ? user.name : 'System Admin',
  });

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Generated Purchase Order',
    entity: 'PurchaseOrder',
    entityId: po.poNumber,
    detail: `${po.quantity.toLocaleString()} units ${po.drugName} — ${po.supplier} (₹${po.totalValue.toLocaleString()})`,
    type: 'create',
  });

  await Notification.create({
    type: 'info',
    title: 'New Purchase Order',
    message: `Purchase Order ${po.poNumber} created for ${po.quantity} units of ${po.drugName} to ${po.supplier}`,
    severity: 'Medium',
    entityType: 'PurchaseOrder',
    entityId: po.poNumber,
    time: 'Just now',
  });

  emitEvent('purchaseorder:created', po);
  emitEvent('notification:new', {
    type: 'info',
    message: `Purchase Order ${po.poNumber} created for ${po.quantity} units of ${po.drugName}`,
  });

  return po;
};

export const updatePOStatus = async (id, status, user = null) => {
  const po = await getPOById(id);
  const oldStatus = po.status;
  po.status = status;
  if (status === 'Approved' && user) {
    po.approvedBy = user.name;
  }
  if (status === 'Delivered') {
    po.actualDelivery = new Date().toISOString().split('T')[0];
  }
  await po.save();

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: `PO Status Changed to ${status}`,
    entity: 'PurchaseOrder',
    entityId: po.poNumber,
    detail: `${po.poNumber} moved from ${oldStatus} to ${status}`,
    type: 'update',
    previousValue: { status: oldStatus },
    newValue: { status },
  });

  emitEvent('purchaseorder:updated', po);
  return po;
};
