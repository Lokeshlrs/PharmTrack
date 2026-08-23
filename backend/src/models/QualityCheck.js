import mongoose from 'mongoose';

const qualityCheckSchema = new mongoose.Schema(
  {
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'DrugBatch' },
    batchNumber: { type: String, required: true },
    drugName: { type: String, required: true },
    inspector: { type: String, required: true },
    result: {
      type: String,
      enum: ['Passed', 'Failed', 'Quarantined', 'Conditional'],
      default: 'Passed',
    },
    remarks: { type: String, default: '' },
    temperature: { type: Number },
    humidity: { type: Number },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('QualityCheck', qualityCheckSchema);
