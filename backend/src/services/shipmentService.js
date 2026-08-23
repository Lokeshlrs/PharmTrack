import Shipment from '../models/Shipment.js';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

const STEPS = ['Order Placed', 'Approved', 'Packed', 'Dispatched', 'In Transit', 'Arrived', 'Received'];

export const listShipments = async (query = {}) => {
  const filter = {};
  if (query.status && query.status !== 'All') filter.status = query.status;
  if (query.active === 'true') {
    filter.status = { $in: ['In Transit', 'Dispatched', 'Packed', 'Approved'] };
  }
  if (query.search) {
    const s = query.search;
    filter.$or = [
      { shipmentId: { $regex: s, $options: 'i' } },
      { drugName: { $regex: s, $options: 'i' } },
      { supplierName: { $regex: s, $options: 'i' } },
      { origin: { $regex: s, $options: 'i' } },
      { destination: { $regex: s, $options: 'i' } },
      { batchNumber: { $regex: s, $options: 'i' } },
    ];
  }
  return await Shipment.find(filter).sort({ createdAt: -1 });
};

export const getShipmentById = async (id) => {
  const shipment = await Shipment.findOne({
    $or: [{ shipmentId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!shipment) {
    throw new Error(`Shipment ${id} not found`);
  }
  return shipment;
};

export const createShipment = async (data, user = null) => {
  const shipmentId = data.shipmentId || `SHP-2026-0${Math.floor(Math.random() * 900) + 100}`;
  const stepIndex = STEPS.indexOf(data.status || 'Order Placed');
  const progress = Math.min(100, Math.max(0, Math.round((stepIndex / (STEPS.length - 1)) * 100)));

  const shipment = await Shipment.create({
    shipmentId,
    purchaseOrder: data.purchaseOrder || null,
    poNumber: data.poNumber || '',
    supplierId: data.supplierId || 'SUP-001',
    supplierName: data.supplierName || data.supplier || 'Cipla Ltd',
    origin: data.origin || data.source || 'Central Warehouse, Delhi',
    destination: data.destination || 'Central Warehouse',
    drugName: data.drugName,
    drugId: data.drugId || 'D001',
    quantity: Number(data.quantity),
    batchNumber: data.batchNumber || `BATCH-${Date.now()}`,
    dispatchDate: data.dispatchDate || new Date().toISOString().split('T')[0],
    expectedArrival: data.expectedArrival || 'TBD',
    status: data.status || 'Order Placed',
    progress,
    currentLocation: data.currentLocation || data.origin,
    route: [
      {
        location: data.origin || 'Supplier Facility',
        timestamp: new Date(),
        status: data.status || 'Order Placed',
        note: 'Shipment created and scheduled',
      },
    ],
  });

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'supplier',
    userId: user ? user._id : null,
    action: 'Created Shipment',
    entity: 'Shipment',
    entityId: shipment.shipmentId,
    detail: `${shipment.quantity.toLocaleString()} units ${shipment.drugName} (${shipment.origin} → ${shipment.destination})`,
    type: 'create',
  });

  emitEvent('shipment:updated', shipment);
  return shipment;
};

export const updateShipmentStatus = async (id, status, user = null) => {
  const shipment = await getShipmentById(id);
  const oldStatus = shipment.status;
  shipment.status = status;

  const stepIndex = STEPS.indexOf(status);
  if (stepIndex !== -1) {
    shipment.progress = Math.min(100, Math.round((stepIndex / (STEPS.length - 1)) * 100));
  }

  shipment.route.push({
    location: shipment.currentLocation || shipment.destination,
    timestamp: new Date(),
    status,
    note: `Status progressed to ${status}`,
  });

  // If received, auto-stock destination inventory
  if (status === 'Received') {
    shipment.actualArrival = new Date().toISOString().split('T')[0];
    shipment.progress = 100;

    let inv = await Inventory.findOne({
      batchNumber: shipment.batchNumber,
      location: shipment.destination,
    });

    if (inv) {
      inv.quantity += shipment.quantity;
      inv.calculateStatus();
      await inv.save();
    } else {
      inv = new Inventory({
        invId: `INV-${Date.now().toString().slice(-6)}`,
        drugId: shipment.drugId,
        drugName: shipment.drugName,
        batchNumber: shipment.batchNumber,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        quantity: shipment.quantity,
        location: shipment.destination,
        supplierName: shipment.supplierName,
        supplierId: shipment.supplierId,
      });
      inv.calculateStatus();
      await inv.save();
    }

    emitEvent('inventory:updated', inv);
  }

  await shipment.save();

  await logAudit({
    user: user ? user.name : 'Logistics Officer',
    userRole: user ? user.role : 'supplier',
    userId: user ? user._id : null,
    action: `Updated Shipment Status: ${status}`,
    entity: 'Shipment',
    entityId: shipment.shipmentId,
    detail: `Shipment ${shipment.shipmentId} (${shipment.drugName}) changed from ${oldStatus} to ${status}`,
    type: 'update',
    previousValue: { status: oldStatus },
    newValue: { status },
  });

  emitEvent('shipment:updated', shipment);
  return shipment;
};

export const updateShipmentLocation = async (id, { location, note }, user = null) => {
  const shipment = await getShipmentById(id);
  shipment.currentLocation = location;
  shipment.route.push({
    location,
    timestamp: new Date(),
    status: shipment.status,
    note: note || 'Location checkpoint update',
  });
  await shipment.save();

  emitEvent('shipment:location', {
    shipmentId: shipment.shipmentId,
    location,
    progress: shipment.progress,
  });

  return shipment;
};
