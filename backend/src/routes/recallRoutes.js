import express from 'express';
import {
  listRecalls,
  getRecallById,
  initiateRecall,
  quarantineRecallBatch,
  notifyRecallHospitals,
} from '../services/recallService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/recalls
router.get('/', async (req, res, next) => {
  try {
    const recalls = await listRecalls();
    res.status(200).json({ success: true, count: recalls.length, data: recalls });
  } catch (error) {
    next(error);
  }
});

// GET /api/recalls/:id
router.get('/:id', async (req, res, next) => {
  try {
    const recall = await getRecallById(req.params.id);
    res.status(200).json({ success: true, data: recall });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/recalls
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const recall = await initiateRecall(req.body, req.user);
    res.status(201).json({ success: true, data: recall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/recalls/:id/initiate
router.post('/:id/initiate', optionalAuth, async (req, res, next) => {
  try {
    const recall = await initiateRecall(req.body, req.user);
    res.status(200).json({ success: true, data: recall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/recalls/:id/quarantine
router.post('/:id/quarantine', optionalAuth, async (req, res, next) => {
  try {
    const recall = await quarantineRecallBatch(req.params.id, req.user);
    res.status(200).json({ success: true, data: recall });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/recalls/:id/notify
router.post('/:id/notify', optionalAuth, async (req, res, next) => {
  try {
    const result = await notifyRecallHospitals(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
