import express from 'express';
import {
  listHospitals,
  getHospitalById,
  createHospital,
  getHospitalInventory,
  getHospitalShortages,
  getHospitalConsumption,
} from '../services/hospitalService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/hospitals/map
router.get('/map', async (req, res, next) => {
  try {
    const hospitals = await listHospitals();
    const mapData = hospitals.map((h) => ({
      id: h.hospitalId,
      name: h.name,
      city: h.city,
      state: h.state,
      lat: h.latitude,
      lng: h.longitude,
      beds: h.beds,
      status: h.status,
    }));
    res.status(200).json({ success: true, count: mapData.length, data: mapData });
  } catch (error) {
    next(error);
  }
});

// GET /api/hospitals
router.get('/', async (req, res, next) => {
  try {
    const hospitals = await listHospitals(req.query);
    res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    next(error);
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const hospital = await getHospitalById(req.params.id);
    res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/hospitals/:id/inventory
router.get('/:id/inventory', async (req, res, next) => {
  try {
    const inventory = await getHospitalInventory(req.params.id);
    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/hospitals/:id/shortages
router.get('/:id/shortages', async (req, res, next) => {
  try {
    const shortages = await getHospitalShortages(req.params.id);
    res.status(200).json({ success: true, count: shortages.length, data: shortages });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/hospitals/:id/consumption
router.get('/:id/consumption', async (req, res, next) => {
  try {
    const consumption = await getHospitalConsumption(req.params.id);
    res.status(200).json({ success: true, count: consumption.length, data: consumption });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/hospitals
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const hospital = await createHospital(req.body, req.user);
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
