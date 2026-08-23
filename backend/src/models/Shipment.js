import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    poNumber: { type: String },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    hospitalId: { type: String },
    drugName: { type: String, required: true },
    drugId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    batchNumber: { type: String, required: true },
    dispatchDate: { type: String, required: true },
    expectedArrival: { type: String, required: true },
    actualArrival: { type: String },
    status: {
      type: String,
      enum: ['Order Placed', 'Approved', 'Packed', 'Dispatched', 'In Transit', 'Arrived', 'Received', 'Delayed'],
      default: 'Order Placed',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    currentLocation: { type: String, default: '' },
    route: [
      {
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        status: { type: String },
        note: { type: String },
      },
    ],
    temperatureStatus: {
      type: String,
      enum: ['Safe', 'Warning', 'Critical'],
      default: 'Safe',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Shipment', shipmentSchema);
