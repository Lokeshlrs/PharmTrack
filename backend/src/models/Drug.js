import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema(
  {
    drugId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    unit: { type: String, default: 'units' },
    unitPrice: { type: Number, required: true, min: 0 },
    storageCondition: { type: String, default: 'Room Temp 15–25°C' },
    temperatureMin: { type: Number, default: 15 },
    temperatureMax: { type: Number, default: 25 },
    reorderLevel: { type: Number, default: 1000 },
    safetyStock: { type: Number, default: 500 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Drug', drugSchema);
