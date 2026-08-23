import AuditLog from '../models/AuditLog.js';

export const listAuditLogs = async (query = {}) => {
  const filter = {};
  if (query.type && query.type !== 'All') filter.type = query.type;
  if (query.search) {
    const s = query.search;
    filter.$or = [
      { user: { $regex: s, $options: 'i' } },
      { action: { $regex: s, $options: 'i' } },
      { entity: { $regex: s, $options: 'i' } },
      { detail: { $regex: s, $options: 'i' } },
    ];
  }
  return await AuditLog.find(filter).sort({ createdAt: -1 });
};

export const getAuditLogsByEntity = async (entity) => {
  const filter = entity ? { entity: { $regex: new RegExp(`^${entity}$`, 'i') } } : {};
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 });
  return logs || [];
};

export const getAuditLogById = async (id) => {
  const log = await AuditLog.findOne({
    $or: [{ logId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
  });
  if (!log) {
    throw new Error(`Audit log entry ${id} not found`);
  }
  return log;
};
