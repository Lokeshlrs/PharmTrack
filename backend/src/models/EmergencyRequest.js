import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    drugId: { type: String, required: true },
    drugName: { type: String, required: true },
    requiredQty: { type: Number, required: true, min: 1 },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Critical',
    },
    requiredBy: { type: String, required: true }, // e.g. "4 Hours", "6 Hours"
    status: {
      type: String,
      enum: ['Pending', 'Sourcing', 'Approved', 'Fulfilled', 'Rejected'],
      default: 'Pending',
    },
    recommendedSource: { type: String, default: 'Central Warehouse' },
    recommendedSourceId: { type: String },
    distance: { type: Number, default: 0 },
    approvedBy: { type: String },
    notes: { type: String, default: '' },
    createdAtDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);
