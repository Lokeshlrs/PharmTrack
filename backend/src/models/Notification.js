import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    notifId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetRole: { type: String, default: 'all' },
    type: {
      type: String,
      enum: ['critical', 'warning', 'info', 'success'],
      default: 'info',
    },
    title: { type: String, default: '' },
    message: { type: String, required: true },
    severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
    read: { type: Boolean, default: false },
    entityType: { type: String, default: 'General' },
    entityId: { type: String, default: '' },
    time: { type: String, default: 'Just now' },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
