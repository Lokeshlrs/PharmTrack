import express from 'express';
import {
  listEmergencyRequests,
  getEmergencyRequestById,
  createEmergencyRequest,
  approveEmergencyRequest,
  rejectEmergencyRequest,
  findBestEmergencySource,
} from '../services/emergencyService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/emergency-requests
router.get('/', async (req, res, next) => {
  try {
    const requests = await listEmergencyRequests(req.query);
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
});

// GET /api/emergency-requests/:id
router.get('/:id', async (req, res, next) => {
  try {
    const request = await getEmergencyRequestById(req.params.id);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/emergency-requests
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const request = await createEmergencyRequest(req.body, req.user);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/emergency-requests/:id/approve
router.post('/:id/approve', optionalAuth, async (req, res, next) => {
  try {
    const result = await approveEmergencyRequest(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/emergency-requests/:id/reject
router.post('/:id/reject', optionalAuth, async (req, res, next) => {
  try {
    const request = await rejectEmergencyRequest(req.params.id, req.user);
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/emergency-requests/:id/recommend-source
router.post('/:id/recommend-source', async (req, res, next) => {
  try {
    const request = await getEmergencyRequestById(req.params.id);
    const sourceRec = await findBestEmergencySource(request.drugId, request.hospitalId, request.requiredQty);
    res.status(200).json({ success: true, data: sourceRec });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
