import Drug from '../models/Drug.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listDrugs = async (query = {}) => {
  const filter = {};
  if (query.search) {
    const s = query.search;
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { genericName: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { manufacturer: { $regex: s, $options: 'i' } },
      { drugId: { $regex: s, $options: 'i' } },
    ];
  }
  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }
  return await Drug.find(filter).sort({ name: 1 });
};

export const getDrugById = async (id) => {
  const drug = await Drug.findOne({ $or: [{ drugId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
  if (!drug) {
    throw new Error(`Drug with ID ${id} not found`);
  }
  return drug;
};

export const createDrug = async (data, user = null) => {
  const drugId = data.drugId || `D0${Date.now().toString().slice(-3)}`;
  const existing = await Drug.findOne({ drugId });
  if (existing) {
    throw new Error(`Drug with ID ${drugId} already exists`);
  }

  const drug = await Drug.create({
    ...data,
    drugId,
  });

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Registered New Drug',
    entity: 'Drug',
    entityId: drug.drugId,
    detail: `${drug.name} (${drug.genericName}) — Price: ₹${drug.unitPrice}`,
    type: 'create',
  });

  emitEvent('drug:created', drug);
  return drug;
};

export const updateDrug = async (id, data, user = null) => {
  const drug = await Drug.findOneAndUpdate(
    { $or: [{ drugId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
    data,
    { new: true }
  );
  if (!drug) {
    throw new Error(`Drug with ID ${id} not found`);
  }

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Updated Drug Formulation',
    entity: 'Drug',
    entityId: drug.drugId,
    detail: `Updated properties for ${drug.name}`,
    type: 'update',
  });

  return drug;
};

export const deleteDrug = async (id, user = null) => {
  const drug = await Drug.findOneAndDelete({
    $or: [{ drugId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!drug) {
    throw new Error(`Drug with ID ${id} not found`);
  }

  await logAudit({
    user: user ? user.name : 'System Admin',
    userRole: user ? user.role : 'admin',
    userId: user ? user._id : null,
    action: 'Deleted Drug Formulation',
    entity: 'Drug',
    entityId: drug.drugId,
    detail: `Removed ${drug.name}`,
    type: 'delete',
  });

  return drug;
};
