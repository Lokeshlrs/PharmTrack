import Hospital from '../models/Hospital.js';
import Inventory from '../models/Inventory.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Consumption from '../models/Consumption.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/auditMiddleware.js';

export const listHospitals = async (query = {}) => {
  const filter = {};
  if (query.city) filter.city = { $regex: query.city, $options: 'i' };
  if (query.state) filter.state = { $regex: query.state, $options: 'i' };
  if (query.type) filter.type = query.type;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { city: { $regex: query.search, $options: 'i' } },
      { state: { $regex: query.search, $options: 'i' } },
      { hospitalId: { $regex: query.search, $options: 'i' } },
    ];
  }
  return await Hospital.find(filter).sort({ createdAt: -1, name: 1 });
};

export const getHospitalById = async (id) => {
  const hospital = await Hospital.findOne({
    $or: [{ hospitalId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!hospital) {
    throw new Error(`Hospital ${id} not found`);
  }
  return hospital;
};

export const createHospital = async (data, user = null) => {
  const hospitalId = data.hospitalId || `H0${Math.floor(Math.random() * 900) + 100}`;
  
  // Default coordinates based on common Indian regions or random variation around center
  const latitude = data.latitude ? Number(data.latitude) : 21.0 + (Math.random() * 7);
  const longitude = data.longitude ? Number(data.longitude) : 76.0 + (Math.random() * 9);

  const hospital = await Hospital.create({
    hospitalId,
    name: data.name,
    address: data.address || '',
    city: data.city,
    state: data.state,
    type: data.type || 'Tertiary',
    beds: Number(data.beds) || 500,
    latitude,
    longitude,
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    email: data.email ? data.email.toLowerCase() : '',
    status: data.status || 'Normal',
  });

  // Automatically register a login account for this hospital if email & password are provided
  if (data.email && data.password) {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (!existingUser) {
      await User.create({
        name: data.contactPerson || data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: 'hospital',
        organization: data.name,
        hospital: data.name,
        hospitalId: hospital.hospitalId,
        phone: data.phone || '',
      });
    }
  }

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Registered Hospital Node',
    entity: 'Hospital',
    entityId: hospital.hospitalId,
    detail: `${hospital.name} (${hospital.city}, ${hospital.state})`,
    type: 'create',
  });

  return hospital;
};

export const getHospitalInventory = async (id) => {
  const hospital = await getHospitalById(id);
  const keyword = hospital.name.split(' ')[0];
  const items = await Inventory.find({
    $or: [
      { location: { $regex: keyword, $options: 'i' } },
      { location: { $regex: hospital.city, $options: 'i' } },
    ],
  });
  return items.map((i) => {
    i.calculateStatus();
    return i;
  });
};

export const getHospitalConsumption = async (id) => {
  const hospital = await getHospitalById(id);
  const keyword = hospital.name.split(' ')[0];
  return await Consumption.find({
    $or: [{ hospitalId: hospital.hospitalId }, { hospitalName: { $regex: keyword, $options: 'i' } }],
  }).sort({ date: -1 });
};

export const getHospitalShortages = async (id) => {
  const hospital = await getHospitalById(id);
  const items = await getHospitalInventory(id);
  return items.filter((i) => i.status === 'Critical' || i.status === 'Low Stock' || i.status === 'Expired');
};
