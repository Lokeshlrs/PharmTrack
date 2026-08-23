import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  user,
  userRole,
  userId,
  action,
  entity,
  entityId,
  detail,
  type = 'update',
  previousValue = null,
  newValue = null,
  ipAddress = '127.0.0.1',
}) => {
  try {
    const log = await AuditLog.create({
      logId: `AL-${Date.now().toString().slice(-6)}`,
      user: user || 'System Admin',
      userRole: userRole || 'admin',
      userId: userId || null,
      action,
      entity,
      entityId: entityId || '',
      detail: detail || '',
      type,
      time: new Date().toISOString(),
      previousValue,
      newValue,
      ipAddress,
    });
    return log;
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
};
