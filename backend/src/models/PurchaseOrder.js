import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    drugName: { type: String, required: true },
    drugId: { type: String },
    supplier: { type: String, required: true },
    supplierId: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Confirmed', 'Delivered', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    createdDate: { type: String, required: true },
    expectedDelivery: { type: String, default: 'TBD' },
    actualDelivery: { type: String },
    hospital: { type: String, default: 'Central Warehouse' },
    hospitalId: { type: String },
    createdBy: { type: String, default: 'System Admin' },
    approvedBy: { type: String },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
