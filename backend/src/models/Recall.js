import mongoose from 'mongoose';

const recallSchema = new mongoose.Schema(
  {
    recallId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    drugId: { type: String },
    drugName: { type: String, required: true },
    batchNumber: { type: String, required: true },
    reason: { type: String, required: true },
    severity: {
      type: String,
      enum: ['High', 'Moderate', 'Low'],
      default: 'High',
    },
    affectedQty: { type: Number, required: true, default: 0 },
    affectedHospitals: { type: Number, default: 0 },
    hospitals: [{ type: String }],
    status: {
      type: String,
      enum: ['Active', 'Investigating', 'Quarantined', 'Resolved'],
      default: 'Active',
    },
    initiatedBy: { type: String, required: true },
    date: { type: String, required: true },
    quarantinedUnits: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Recall', recallSchema);
