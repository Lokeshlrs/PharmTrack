import express from 'express';
import {
  listShipments,
  getShipmentById,
  createShipment,
  updateShipmentStatus,
  updateShipmentLocation,
} from '../services/shipmentService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/shipments
router.get('/', async (req, res, next) => {
  try {
    const shipments = await listShipments(req.query);
    res.status(200).json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    next(error);
  }
});

// GET /api/shipments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const shipment = await getShipmentById(req.params.id);
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/shipments/:id/tracking
router.get('/:id/tracking', async (req, res, next) => {
  try {
    const shipment = await getShipmentById(req.params.id);
    res.status(200).json({
      success: true,
      data: {
        shipmentId: shipment.shipmentId,
        drugName: shipment.drugName,
        status: shipment.status,
        progress: shipment.progress,
        currentLocation: shipment.currentLocation,
        routeHistory: shipment.route,
      },
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/shipments
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const shipment = await createShipment(req.body, req.user);
    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/shipments/:id/status
router.post('/:id/status', optionalAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const shipment = await updateShipmentStatus(req.params.id, status, req.user);
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/shipments/:id/location
router.post('/:id/location', optionalAuth, async (req, res, next) => {
  try {
    const shipment = await updateShipmentLocation(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: shipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
