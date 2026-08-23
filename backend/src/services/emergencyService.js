import EmergencyRequest from '../models/EmergencyRequest.js';
import Inventory from '../models/Inventory.js';
import Hospital from '../models/Hospital.js';
import Notification from '../models/Notification.js';
import Shipment from '../models/Shipment.js';
import { calculateDistanceKm } from '../utils/haversine.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listEmergencyRequests = async (query = {}) => {
  const filter = {};
  if (query.status && query.status !== 'All') filter.status = query.status;
  if (query.priority && query.priority !== 'All') filter.priority = query.priority;
  if (query.hospitalId) filter.hospitalId = query.hospitalId;
  return await EmergencyRequest.find(filter).sort({ createdAt: -1 });
};

export const getEmergencyRequestById = async (id) => {
  const req = await EmergencyRequest.findOne({
    $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!req) {
    throw new Error(`Emergency request ${id} not found`);
  }
  return req;
};

/**
 * Intelligent Source Recommender for Emergency Procurement
 */
export const findBestEmergencySource = async (drugId, hospitalId, requiredQty) => {
  const requestingHospital = await Hospital.findOne({ hospitalId });
  const inventories = await Inventory.find({
    drugId,
    status: { $nin: ['Quarantined', 'Expired'] },
    quantity: { $gte: Number(requiredQty) * 0.5 },
  });

  const candidates = [];

  for (const inv of inventories) {
    const sourceHospital = await Hospital.findOne({
      name: { $regex: inv.location.split(' ')[0], $options: 'i' },
    });

    let distance = 250;
    if (requestingHospital && sourceHospital) {
      distance = calculateDistanceKm(
        requestingHospital.latitude,
        requestingHospital.longitude,
        sourceHospital.latitude,
        sourceHospital.longitude
      );
    } else if (inv.location.includes('Central Warehouse')) {
      distance = 180;
    }

    candidates.push({
      location: inv.location,
      availableStock: inv.quantity,
      batchNumber: inv.batchNumber,
      distance,
      expiryDate: inv.expiryDate,
    });
  }

  // Sort by shortest distance and highest stock
  candidates.sort((a, b) => a.distance - b.distance || b.availableStock - a.availableStock);

  if (candidates.length > 0) {
    return {
      recommendedSource: candidates[0].location,
      distance: candidates[0].distance,
      availableStock: candidates[0].availableStock,
      alternatives: candidates.slice(1, 4),
    };
  }

  return {
    recommendedSource: 'Central Warehouse, Delhi',
    distance: 350,
    availableStock: 5000,
    alternatives: [],
  };
};

export const createEmergencyRequest = async (data, user = null) => {
  const requestId = data.requestId || `ER-2026-0${Math.floor(Math.random() * 900) + 100}`;

  // Find best nearby source
  let recommendedSource = data.recommendedSource;
  let distance = data.distance;

  if (!recommendedSource) {
    const sourceRec = await findBestEmergencySource(data.drugId, data.hospitalId, data.requiredQty);
    recommendedSource = sourceRec.recommendedSource;
    distance = sourceRec.distance;
  }

  const req = await EmergencyRequest.create({
    requestId,
    hospitalId: data.hospitalId || 'H001',
    hospitalName: data.hospitalName || 'Requesting Hospital',
    drugId: data.drugId || 'D001',
    drugName: data.drugName,
    requiredQty: Number(data.requiredQty),
    priority: data.priority || 'Critical',
    requiredBy: data.requiredBy || '6 Hours',
    status: data.status || 'Pending',
    recommendedSource,
    distance: distance || 250,
    notes: data.notes || '',
  });

  await logAudit({
    user: user ? user.name : 'Hospital Superintendent',
    userRole: user ? user.role : 'hospital',
    userId: user ? user._id : null,
    action: 'Raised Emergency Drug Request',
    entity: 'EmergencyRequest',
    entityId: req.requestId,
    detail: `${req.priority} Request: ${req.requiredQty} units of ${req.drugName} for ${req.hospitalName}`,
    type: 'create',
  });

  await Notification.create({
    type: req.priority === 'Critical' ? 'critical' : 'warning',
    title: `Emergency Drug Request — ${req.priority}`,
    message: `Emergency request ${req.requestId}: ${req.requiredQty} units of ${req.drugName} required within ${req.requiredBy} at ${req.hospitalName}`,
    severity: req.priority,
    entityType: 'Emergency',
    entityId: req.requestId,
    time: 'Just now',
  });

  emitEvent('emergency:new', req);
  emitEvent('notification:new', {
    type: 'critical',
    message: `Emergency request from ${req.hospitalName} for ${req.drugName} (${req.requiredQty} units)`,
  });

  return req;
};

export const approveEmergencyRequest = async (id, user = null) => {
  const req = await getEmergencyRequestById(id);
  req.status = 'Approved';
  req.approvedBy = user ? user.name : 'System Admin';
  await req.save();

  // Create fast-track emergency shipment
  const shipment = await Shipment.create({
    shipmentId: `SHP-EMG-${Date.now().toString().slice(-4)}`,
    supplierId: 'EMERGENCY',
    supplierName: req.recommendedSource,
    origin: req.recommendedSource,
    destination: req.hospitalName,
    drugName: req.drugName,
    drugId: req.drugId,
    quantity: req.requiredQty,
    batchNumber: `EMG-BATCH-${Date.now().toString().slice(-4)}`,
    dispatchDate: new Date().toISOString().split('T')[0],
    expectedArrival: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'In Transit',
    progress: 40,
    currentLocation: `En route from ${req.recommendedSource} (Priority Escort)`,
  });

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Approved Emergency Drug Request',
    entity: 'EmergencyRequest',
    entityId: req.requestId,
    detail: `Approved emergency transfer of ${req.requiredQty} units ${req.drugName} from ${req.recommendedSource}. Shipment ${shipment.shipmentId} dispatched.`,
    type: 'approve',
  });

  emitEvent('shipment:updated', shipment);
  return { request: req, shipment };
};

export const rejectEmergencyRequest = async (id, user = null) => {
  const req = await getEmergencyRequestById(id);
  req.status = 'Rejected';
  await req.save();

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Rejected Emergency Drug Request',
    entity: 'EmergencyRequest',
    entityId: req.requestId,
    detail: `Rejected emergency request ${req.requestId}`,
    type: 'update',
  });

  return req;
};
