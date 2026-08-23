import mongoose from 'mongoose';

const drugBatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
    drugId: { type: String, required: true },
    drugName: { type: String, required: true },
    manufacturingDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    initialQuantity: { type: Number, required: true, default: 0 },
    unitPrice: { type: Number, default: 0 },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplierId: { type: String },
    supplierName: { type: String },
    currentLocation: { type: String, required: true },
    storageCondition: { type: String, default: 'Room Temp' },
    qualityStatus: {
      type: String,
      enum: ['Passed', 'Expiring Soon', 'Expired', 'Quarantined', 'Recalled', 'Under Inspection'],
      default: 'Passed',
    },
    qrCode: { type: String },
    recalled: { type: Boolean, default: false },
    recallId: { type: String, default: null },
    movementHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        date: { type: String },
        from: { type: String },
        to: { type: String },
        quantity: { type: Number },
        action: { type: String },
        recordedBy: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('DrugBatch', drugBatchSchema);
