import express from 'express';
import { listDrugs, getDrugById, createDrug, updateDrug, deleteDrug } from '../services/drugService.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/drugs
router.get('/', async (req, res, next) => {
  try {
    const drugs = await listDrugs(req.query);
    res.status(200).json({ success: true, count: drugs.length, data: drugs });
  } catch (error) {
    next(error);
  }
});

// GET /api/drugs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const drug = await getDrugById(req.params.id);
    res.status(200).json({ success: true, data: drug });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/drugs
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const drug = await createDrug(req.body, req.user);
    res.status(201).json({ success: true, data: drug });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/drugs/:id
router.patch('/:id', optionalAuth, async (req, res, next) => {
  try {
    const drug = await updateDrug(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: drug });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/drugs/:id
router.delete('/:id', optionalAuth, async (req, res, next) => {
  try {
    const drug = await deleteDrug(req.params.id, req.user);
    res.status(200).json({ success: true, data: drug });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
