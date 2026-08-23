import express from 'express';
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  getSupplierPerformance,
  getSupplierRanking,
} from '../services/supplierService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/suppliers/ranking
router.get('/ranking', async (req, res, next) => {
  try {
    const ranking = await getSupplierRanking();
    res.status(200).json({ success: true, count: ranking.length, data: ranking });
  } catch (error) {
    next(error);
  }
});

// GET /api/suppliers
router.get('/', async (req, res, next) => {
  try {
    const suppliers = await listSuppliers(req.query);
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    next(error);
  }
});

// GET /api/suppliers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const supplier = await getSupplierById(req.params.id);
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/suppliers/:id/performance
router.get('/:id/performance', async (req, res, next) => {
  try {
    const perf = await getSupplierPerformance(req.params.id);
    res.status(200).json({ success: true, data: perf });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/suppliers
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const supplier = await createSupplier(req.body, req.user);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
