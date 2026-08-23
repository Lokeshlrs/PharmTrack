import express from 'express';
import { listBatches, getBatchById, createBatch, recordQualityCheck, getBatchHistory } from '../services/batchService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/batches
router.get('/', async (req, res, next) => {
  try {
    const batches = await listBatches(req.query);
    res.status(200).json({ success: true, count: batches.length, data: batches });
  } catch (error) {
    next(error);
  }
});

// POST /api/batches
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const batch = await createBatch(req.body, req.user);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/batches/:id
router.get('/:id', async (req, res, next) => {
  try {
    const batch = await getBatchById(req.params.id);
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/batches/:id/quality-check
router.post('/:id/quality-check', optionalAuth, async (req, res, next) => {
  try {
    const result = await recordQualityCheck(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/batches/:id/history
router.get('/:id/history', async (req, res, next) => {
  try {
    const history = await getBatchHistory(req.params.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
