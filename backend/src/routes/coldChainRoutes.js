import express from 'express';
import {
  listColdChainUnits,
  getUnitById,
  recordReading,
  simulateColdChainAnomaly,
} from '../services/coldChainService.js';

const router = express.Router();

// GET /api/cold-chain
router.get('/', async (req, res, next) => {
  try {
    const units = await listColdChainUnits();
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    next(error);
  }
});

// POST /api/cold-chain/simulate
router.post('/simulate', async (req, res, next) => {
  try {
    const { storageUnitId, temperature, humidity } = req.body;
    const unit = await simulateColdChainAnomaly(
      storageUnitId || 'CCU-B',
      temperature != null ? Number(temperature) : 11.8,
      humidity != null ? Number(humidity) : 85
    );
    res.status(200).json({ success: true, message: 'Simulated telemetry reading broadcasted', data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/cold-chain/readings
router.post('/readings', async (req, res, next) => {
  try {
    const unit = await recordReading(req.body);
    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/cold-chain/:storageUnit/readings
router.get('/:storageUnit/readings', async (req, res, next) => {
  try {
    const unit = await getUnitById(req.params.storageUnit);
    res.status(200).json({ success: true, data: unit.hourlyLogs || [] });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/cold-chain/:storageUnit
router.get('/:storageUnit', async (req, res, next) => {
  try {
    const unit = await getUnitById(req.params.storageUnit);
    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
