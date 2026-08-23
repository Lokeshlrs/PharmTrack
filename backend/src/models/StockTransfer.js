import mongoose from 'mongoose';

const stockTransferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
    drugId: { type: String, required: true },
    drugName: { type: String, required: true },
    sourceHospital: { type: String, required: true },
    sourceId: { type: String, required: true },
    sourceStock: { type: Number, required: true },
    sourceExpected: { type: Number, required: true },
    excess: { type: Number, required: true },
    targetHospital: { type: String, required: true },
    targetId: { type: String, required: true },
    targetStock: { type: Number, required: true },
    targetExpected: { type: Number, required: true },
    shortage: { type: Number, required: true },
    recommended: { type: Number, required: true },
    batchNumber: { type: String },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'High',
    },
    distance: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: '24 Hours' },
    expiryDays: { type: Number, default: 180 },
    estimatedSavings: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 90 },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'In Transit', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    recommendedBy: { type: String, default: 'AI Redistribution Engine' },
    approvedBy: { type: String },
    shipmentId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('StockTransfer', stockTransferSchema);
