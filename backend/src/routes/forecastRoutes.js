import express from 'express';
import {
  getForecastForDrug,
  getAllDrugForecasts,
  getSmartReorderRecommendation,
  generatePurchaseOrderFromForecast,
} from '../services/aiForecastService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/forecast (all active forecasts)
router.get('/', async (req, res, next) => {
  try {
    const forecasts = await getAllDrugForecasts();
    res.status(200).json({ success: true, count: forecasts.length, data: forecasts });
  } catch (error) {
    next(error);
  }
});

// POST /api/forecast/generate
router.post('/generate', async (req, res, next) => {
  try {
    const { drugId, days } = req.body;
    const forecast = await getForecastForDrug(drugId, days || 30);
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/forecast/:drugId/reorder
router.get('/:drugId/reorder', async (req, res, next) => {
  try {
    const reorder = await getSmartReorderRecommendation(req.params.drugId);
    res.status(200).json({ success: true, data: reorder });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/forecast/:drugId/generate-purchase-order
router.post('/:drugId/generate-purchase-order', optionalAuth, async (req, res, next) => {
  try {
    const result = await generatePurchaseOrderFromForecast(req.params.drugId, req.user, req.body?.quantity);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/forecast/:drugId
router.get('/:drugId', async (req, res, next) => {
  try {
    const days = req.query.days ? Number(req.query.days) : 30;
    const forecast = await getForecastForDrug(req.params.drugId, days);
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
