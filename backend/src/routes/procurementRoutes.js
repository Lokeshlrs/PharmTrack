import express from 'express';
import {
  listPurchaseOrders,
  getPOById,
  createPO,
  updatePOStatus,
} from '../services/procurementService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/purchase-orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await listPurchaseOrders(req.query);
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/purchase-orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const po = await getPOById(req.params.id);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const po = await createPO(req.body, req.user);
    res.status(201).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders/:id/approve
router.post('/:id/approve', optionalAuth, async (req, res, next) => {
  try {
    const po = await updatePOStatus(req.params.id, 'Approved', req.user);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders/:id/accept
router.post('/:id/accept', optionalAuth, async (req, res, next) => {
  try {
    const po = await updatePOStatus(req.params.id, 'Confirmed', req.user);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders/:id/confirm
router.post('/:id/confirm', optionalAuth, async (req, res, next) => {
  try {
    const po = await updatePOStatus(req.params.id, 'Confirmed', req.user);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders/:id/reject
router.post('/:id/reject', optionalAuth, async (req, res, next) => {
  try {
    const po = await updatePOStatus(req.params.id, 'Rejected', req.user);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/purchase-orders/:id/deliver
router.post('/:id/deliver', optionalAuth, async (req, res, next) => {
  try {
    const po = await updatePOStatus(req.params.id, 'Delivered', req.user);
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
