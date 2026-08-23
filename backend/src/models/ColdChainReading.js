import mongoose from 'mongoose';

const coldChainReadingSchema = new mongoose.Schema(
  {
    storageUnitId: { type: String, required: true }, // e.g. "CCU-A"
    name: { type: String, required: true }, // e.g. "Cold Room Alpha"
    location: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Safe', 'Warning', 'Critical'],
      default: 'Safe',
    },
    minTemp: { type: Number, default: 2 },
    maxTemp: { type: Number, default: 8 },
    minHumidity: { type: Number, default: 40 },
    maxHumidity: { type: Number, default: 75 },
    drugs: [{ type: String }],
    alerts: { type: Number, default: 0 },
    sensorId: { type: String, default: 'ESP32-DHT22-01' },
    lastUpdated: { type: String },
    hourlyLogs: [
      {
        time: { type: String },
        temp: { type: Number },
        humidity: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Method to evaluate status based on temperature & humidity
coldChainReadingSchema.methods.evaluateStatus = function () {
  if (this.temperature > this.maxTemp + 2 || this.temperature < this.minTemp - 2 || this.humidity > this.maxHumidity + 10) {
    this.status = 'Critical';
    this.alerts = Math.max(1, (this.alerts || 0) + 1);
  } else if (this.temperature > this.maxTemp || this.temperature < this.minTemp || this.humidity > this.maxHumidity || this.humidity < this.minHumidity) {
    this.status = 'Warning';
    this.alerts = Math.max(1, this.alerts || 0);
  } else {
    this.status = 'Safe';
    this.alerts = 0;
  }
  return this.status;
};

export default mongoose.model('ColdChainReading', coldChainReadingSchema);
