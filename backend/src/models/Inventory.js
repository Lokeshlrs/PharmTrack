import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    invId: { type: String, unique: true, sparse: true },
    drug: { type: mongoose.Schema.Types.ObjectId, ref: 'Drug' },
    drugId: { type: String, required: true },
    drugName: { type: String, required: true },
    generic: { type: String, default: '' },
    category: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'DrugBatch' },
    batchNumber: { type: String, required: true },
    mfgDate: { type: String },
    expiryDate: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    unitPrice: { type: Number, default: 0 },
    storageCondition: { type: String, default: 'Room Temp' },
    location: { type: String, required: true },
    supplierId: { type: String },
    supplierName: { type: String },
    reorderLevel: { type: Number, default: 1000 },
    safetyStock: { type: Number, default: 500 },
    status: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Critical', 'Overstocked', 'Expiring Soon', 'Expired', 'Quarantined'],
      default: 'Healthy',
    },
    daysToExpiry: { type: Number },
  },
  { timestamps: true }
);

// Method / Pre-save to auto-calculate available quantity and status
inventorySchema.methods.calculateStatus = function () {
  this.availableQuantity = Math.max(0, this.quantity - (this.reservedQuantity || 0));

  // Expiry calculation
  if (this.expiryDate) {
    const today = new Date();
    const exp = new Date(this.expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    this.daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    this.daysToExpiry = 999;
  }

  if (this.status === 'Quarantined') {
    return this.status;
  }

  if (this.daysToExpiry <= 0) {
    this.status = 'Expired';
  } else if (this.daysToExpiry <= 30) {
    this.status = 'Expiring Soon';
  } else if (this.availableQuantity <= (this.safetyStock || 300) * 0.5) {
    this.status = 'Critical';
  } else if (this.availableQuantity <= (this.reorderLevel || 1000)) {
    this.status = 'Low Stock';
  } else if (this.availableQuantity >= (this.reorderLevel || 1000) * 4) {
    this.status = 'Overstocked';
  } else {
    this.status = 'Healthy';
  }

  return this.status;
};

inventorySchema.pre('save', function (next) {
  this.calculateStatus();
  next();
});

export default mongoose.model('Inventory', inventorySchema);
