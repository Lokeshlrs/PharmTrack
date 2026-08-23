import Notification from '../models/Notification.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listNotifications = async (query = {}) => {
  const filter = {};
  if (query.unreadOnly === 'true') filter.read = false;
  if (query.type && query.type !== 'all') filter.type = query.type;
  return await Notification.find(filter).sort({ createdAt: -1 });
};

export const getUnreadNotifications = async () => {
  return await Notification.find({ read: false }).sort({ createdAt: -1 });
};

export const markAsRead = async (id) => {
  const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  return notif;
};

export const markAllAsRead = async () => {
  await Notification.updateMany({ read: false }, { read: true });
  return { success: true, message: 'All notifications marked as read' };
};

export const createNotification = async (data) => {
  const notif = await Notification.create({
    ...data,
    time: data.time || 'Just now',
  });
  emitEvent('notification:new', notif);
  return notif;
};
