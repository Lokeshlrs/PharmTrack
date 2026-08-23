import mongoose from 'mongoose';

const consumptionSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    drugId: { type: String, required: true },
    drugName: { type: String, required: true },
    batchNumber: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
    month: { type: String }, // e.g. "Jan", "Feb", "Aug"
    year: { type: Number },
    department: { type: String, default: 'General Pharmacy' },
    dispensedTo: { type: String, default: 'In-Patient' },
    recordedBy: { type: String, default: 'Pharmacist' },
  },
  { timestamps: true }
);

export default mongoose.model('Consumption', consumptionSchema);
