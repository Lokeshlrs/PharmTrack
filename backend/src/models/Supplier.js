import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    supplierId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    contactPerson: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    score: { type: Number, default: 90, min: 0, max: 100 },
    onTime: { type: Number, default: 90, min: 0, max: 100 },
    quality: { type: Number, default: 90, min: 0, max: 100 },
    fulfillment: { type: Number, default: 88, min: 0, max: 100 },
    rejectedBatches: { type: Number, default: 0, min: 0 },
    delayedShipments: { type: Number, default: 0, min: 0 },
    totalOrders: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Helper to recalculate overall supplier score
supplierSchema.methods.recalculateScore = function () {
  this.score = Math.round(
    this.onTime * 0.35 +
    this.quality * 0.35 +
    this.fulfillment * 0.30 -
    (this.rejectedBatches * 2) -
    (this.delayedShipments * 1)
  );
  this.score = Math.max(0, Math.min(100, this.score));
  return this.score;
};

export default mongoose.model('Supplier', supplierSchema);
