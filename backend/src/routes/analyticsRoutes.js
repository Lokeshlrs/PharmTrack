import express from 'express';
import {
  getDashboardAnalytics,
  getConsumptionTrends,
  getStockByCategory,
  getRegionalShortages,
  getShortageHeatmap,
} from '../services/analyticsService.js';
import { listSuppliers } from '../services/supplierService.js';

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const kpis = await getDashboardAnalytics();
    res.status(200).json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/consumption
router.get('/consumption', async (req, res, next) => {
  try {
    const trends = await getConsumptionTrends();
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/procurement
router.get('/procurement', async (req, res, next) => {
  try {
    const trends = await getConsumptionTrends();
    res.status(200).json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getStockByCategory();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/shortages
router.get('/shortages', async (req, res, next) => {
  try {
    const shortages = await getRegionalShortages();
    res.status(200).json({ success: true, data: shortages });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/shortage-map
router.get('/shortage-map', async (req, res, next) => {
  try {
    const heatmap = await getShortageHeatmap();
    res.status(200).json({ success: true, count: heatmap.length, data: heatmap });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/suppliers
router.get('/suppliers', async (req, res, next) => {
  try {
    const suppliers = await listSuppliers();
    const perf = suppliers.map((s) => ({
      name: s.name.split(' ')[0],
      score: s.score,
      onTime: s.onTime,
      quality: s.quality,
      fulfillment: s.fulfillment,
    }));
    res.status(200).json({ success: true, data: perf });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics (combined full analytics package)
router.get('/', async (req, res, next) => {
  try {
    const [kpis, consumptionTrends, stockCategories, regionalShortages, shortageHeatmap] =
      await Promise.all([
        getDashboardAnalytics(),
        getConsumptionTrends(),
        getStockByCategory(),
        getRegionalShortages(),
        getShortageHeatmap(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        kpiData: kpis,
        consumptionTrend: consumptionTrends,
        stockByCategory: stockCategories,
        regionalShortages,
        shortageHeatmap,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
