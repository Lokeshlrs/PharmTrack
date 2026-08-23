import express from 'express';
import {
  getBatchByQRCode,
  generateQRForBatch,
  getBatchJourney,
} from '../services/traceabilityService.js';

const router = express.Router();

// POST /api/traceability/scan
router.post('/scan', async (req, res, next) => {
  try {
    const { qrData, batchNumber } = req.body;
    const query = qrData || batchNumber;
    const result = await getBatchByQRCode(query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/traceability/generate/:batchId
router.post('/generate/:batchId', async (req, res, next) => {
  try {
    const result = await generateQRForBatch(req.params.batchId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/traceability/batch/:batchId/history
router.get('/batch/:batchId/history', async (req, res, next) => {
  try {
    const result = await getBatchJourney(req.params.batchId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/traceability/batch/:batchId
router.get('/batch/:batchId', async (req, res, next) => {
  try {
    const result = await getBatchJourney(req.params.batchId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// GET /api/traceability/:qrCode
router.get('/:qrCode', async (req, res, next) => {
  try {
    const result = await getBatchByQRCode(decodeURIComponent(req.params.qrCode));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export default router;
