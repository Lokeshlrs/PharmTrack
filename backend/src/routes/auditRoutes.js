import express from 'express';
import { listAuditLogs, getAuditLogById, getAuditLogsByEntity } from '../services/auditService.js';

const router = express.Router();

// GET /api/audit-logs
router.get('/', async (req, res, next) => {
  try {
    const logs = await listAuditLogs(req.query);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
});

// GET /api/audit-logs/entity/:entity
router.get('/entity/:entity', async (req, res, next) => {
  try {
    const logs = await getAuditLogsByEntity(req.params.entity);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(200).json({ success: true, count: 0, data: [] });
  }
});

// GET /api/audit-logs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const log = await getAuditLogById(req.params.id);
    res.status(200).json({ success: true, data: log });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
