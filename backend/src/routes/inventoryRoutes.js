import express from 'express';
import {
  listInventory,
  getInventoryById,
  createStock,
  adjustStock,
  consumeStock,
  getCriticalStock,
  getExpiringStock,
  getExpiredStock,
} from '../services/inventoryService.js';
import { getFEFOBatchesForDrug, consumeFEFO } from '../services/fefoService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/inventory/critical
router.get('/critical', async (req, res, next) => {
  try {
    const items = await getCriticalStock();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/low-stock
router.get('/low-stock', async (req, res, next) => {
  try {
    const items = await getCriticalStock();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/expiring
router.get('/expiring', async (req, res, next) => {
  try {
    const items = await getExpiringStock(req.query.days ? Number(req.query.days) : 30);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/expired
router.get('/expired', async (req, res, next) => {
  try {
    const items = await getExpiredStock();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/fefo
router.get('/fefo', async (req, res, next) => {
  try {
    const items = await listInventory(req.query);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/fefo/:drugId
router.get('/fefo/:drugId', async (req, res, next) => {
  try {
    const items = await getFEFOBatchesForDrug(req.params.drugId, req.query.location);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/consume-fefo
router.post('/consume-fefo', optionalAuth, async (req, res, next) => {
  try {
    const result = await consumeFEFO(req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/inventory/consume
router.post('/consume', optionalAuth, async (req, res, next) => {
  try {
    const { id, quantity, department, dispensedTo } = req.body;
    const result = await consumeStock(id, { quantity, department, dispensedTo }, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/inventory/adjust
router.post('/adjust', optionalAuth, async (req, res, next) => {
  try {
    const { id, quantityAdjustment, reason } = req.body;
    const result = await adjustStock(id, { quantityAdjustment, reason }, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/inventory
router.get('/', async (req, res, next) => {
  try {
    const items = await listInventory(req.query);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await getInventoryById(req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/inventory
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const item = await createStock(req.body, req.user);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/inventory/:id
router.patch('/:id', optionalAuth, async (req, res, next) => {
  try {
    const item = await adjustStock(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
