import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/auditMiddleware.js';

export const listSuppliers = async (query = {}) => {
  const filter = {};
  if (query.search) {
    const s = query.search;
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { city: { $regex: s, $options: 'i' } },
      { state: { $regex: s, $options: 'i' } },
      { supplierId: { $regex: s, $options: 'i' } },
    ];
  }
  return await Supplier.find(filter).sort({ createdAt: -1, score: -1 });
};

export const getSupplierById = async (id) => {
  const supplier = await Supplier.findOne({
    $or: [{ supplierId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!supplier) {
    throw new Error(`Supplier ${id} not found`);
  }
  return supplier;
};

export const createSupplier = async (data, user = null) => {
  const supplierId = data.supplierId || `S0${Math.floor(Math.random() * 900) + 100}`;

  const supplier = new Supplier({
    supplierId,
    name: data.name,
    address: data.address || '',
    city: data.city,
    state: data.state,
    contactPerson: data.contactPerson || '',
    email: data.email ? data.email.toLowerCase() : '',
    phone: data.phone || '',
    score: Number(data.score) || 90,
    onTime: Number(data.onTime) || 92,
    quality: Number(data.quality) || 95,
    fulfillment: Number(data.fulfillment) || 90,
    rejectedBatches: Number(data.rejectedBatches) || 0,
    delayedShipments: Number(data.delayedShipments) || 0,
    totalOrders: Number(data.totalOrders) || 0,
  });

  supplier.recalculateScore();
  await supplier.save();

  // Automatically register a login account for this supplier if email & password are provided
  if (data.email && data.password) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (!existingUser) {
      await User.create({
        name: data.contactPerson || data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: 'supplier',
        organization: data.name,
        supplierId: supplier.supplierId,
        phone: data.phone || '',
      });
    }
  }

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Registered Pharmaceutical Supplier',
    entity: 'Supplier',
    entityId: supplier.supplierId,
    detail: `${supplier.name} (${supplier.city}, ${supplier.state})`,
    type: 'create',
  });

  return supplier;
};

export const getSupplierPerformance = async (id) => {
  const supplier = await getSupplierById(id);
  const pos = await PurchaseOrder.find({ supplier: supplier.name });
  const shipments = await Shipment.find({ supplierId: supplier.supplierId });

  return {
    supplier,
    radarMetrics: [
      { metric: 'On-Time', value: supplier.onTime },
      { metric: 'Quality', value: supplier.quality },
      { metric: 'Fulfillment', value: supplier.fulfillment },
      { metric: 'Reliability', value: Math.max(0, 100 - (supplier.rejectedBatches || 0) * 3) },
      { metric: 'Responsiveness', value: 90 },
    ],
    totalPurchaseOrders: pos.length,
    activeShipments: shipments.filter((s) => s.status === 'In Transit' || s.status === 'Dispatched').length,
  };
};

export const getSupplierRanking = async () => {
  return await Supplier.find().sort({ score: -1 });
};
