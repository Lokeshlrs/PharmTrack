import express from 'express';
import {
  getRedistributionRecommendations,
  createTransfer,
  approveTransfer,
  rejectTransfer,
} from '../services/redistributionService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/transfers/recommendations or /api/redistribution/recommendations
router.get('/recommendations', async (req, res, next) => {
  try {
    const recommendations = await getRedistributionRecommendations();
    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
});

// GET /api/transfers or /api/redistribution
router.get('/', async (req, res, next) => {
  try {
    const recommendations = await getRedistributionRecommendations();
    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
});

// POST /api/transfers
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const transfer = await createTransfer(req.body, req.user);
    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/transfers/:id/approve or /api/transfers/approve/:id
router.post(['/:id/approve', '/approve/:id'], optionalAuth, async (req, res, next) => {
  try {
    const result = await approveTransfer(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/transfers/:id/reject or /api/transfers/reject/:id
router.post(['/:id/reject', '/reject/:id'], optionalAuth, async (req, res, next) => {
  try {
    const transfer = await rejectTransfer(req.params.id, req.user);
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
