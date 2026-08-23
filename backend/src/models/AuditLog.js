import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    logId: { type: String },
    user: { type: String, required: true },
    userRole: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    detail: { type: String, default: '' },
    type: {
      type: String,
      enum: ['create', 'update', 'alert', 'ai', 'approve', 'delete'],
      default: 'update',
    },
    time: { type: String, required: true },
    previousValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
