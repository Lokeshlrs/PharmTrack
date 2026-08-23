import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Tertiary', 'Secondary', 'Primary'], default: 'Tertiary' },
    beds: { type: Number, default: 500 },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Normal', 'Low Stock', 'Emergency'],
      default: 'Normal',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Hospital', hospitalSchema);
