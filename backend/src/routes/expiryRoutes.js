import express from 'express';
import {
  listInventory,
  getExpiringStock,
  getExpiredStock,
} from '../services/inventoryService.js';

const router = express.Router();

// GET /api/expiry
router.get('/', async (req, res, next) => {
  try {
    const items = await listInventory();
    const sorted = items.sort((a, b) => (a.daysToExpiry || 0) - (b.daysToExpiry || 0));
    const expired = sorted.filter((i) => (i.daysToExpiry || 0) <= 0);
    const expiringSoon = sorted.filter((i) => (i.daysToExpiry || 0) > 0 && (i.daysToExpiry || 0) <= 30);
    const goodStanding = sorted.filter((i) => (i.daysToExpiry || 0) > 30);

    res.status(200).json({
      success: true,
      data: {
        all: sorted,
        expired,
        expiringSoon,
        goodStanding,
        counts: {
          expired: expired.length,
          expiringSoon: expiringSoon.length,
          goodStanding: goodStanding.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/expiry/soon
router.get('/soon', async (req, res, next) => {
  try {
    const items = await getExpiringStock(req.query.days ? Number(req.query.days) : 30);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/expiry/expired
router.get('/expired', async (req, res, next) => {
  try {
    const items = await getExpiredStock();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
});

// GET /api/expiry/calendar
router.get('/calendar', async (req, res, next) => {
  try {
    const items = await listInventory();
    const calendar = {};
    for (const item of items) {
      const monthYear = item.expiryDate ? item.expiryDate.slice(0, 7) : 'Unknown';
      if (!calendar[monthYear]) calendar[monthYear] = [];
      calendar[monthYear].push({
        drugName: item.drugName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        location: item.location,
        expiryDate: item.expiryDate,
        daysToExpiry: item.daysToExpiry,
      });
    }
    res.status(200).json({ success: true, data: calendar });
  } catch (error) {
    next(error);
  }
});

export default router;
