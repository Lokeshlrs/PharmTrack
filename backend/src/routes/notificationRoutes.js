import express from 'express';
import {
  listNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
} from '../services/notificationService.js';

const router = express.Router();

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const notifs = await listNotifications(req.query);
    res.status(200).json({ success: true, count: notifs.length, data: notifs });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread
router.get('/unread', async (req, res, next) => {
  try {
    const unread = await getUnreadNotifications();
    res.status(200).json({ success: true, count: unread.length, data: unread });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', async (req, res, next) => {
  try {
    const result = await markAllAsRead();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notif = await markAsRead(req.params.id);
    res.status(200).json({ success: true, data: notif });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// POST /api/notifications
router.post('/', async (req, res, next) => {
  try {
    const notif = await createNotification(req.body);
    res.status(201).json({ success: true, data: notif });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
