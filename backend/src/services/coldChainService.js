import ColdChainReading from '../models/ColdChainReading.js';
import Notification from '../models/Notification.js';
import DrugBatch from '../models/DrugBatch.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { emitEvent } from '../sockets/socketHandler.js';

export const listColdChainUnits = async () => {
  return await ColdChainReading.find().sort({ storageUnitId: 1 });
};

export const getUnitById = async (storageUnitId) => {
  const unit = await ColdChainReading.findOne({
    $or: [{ storageUnitId }, { name: { $regex: storageUnitId, $options: 'i' } }],
  });
  if (!unit) {
    throw new Error(`Cold chain storage unit ${storageUnitId} not found`);
  }
  return unit;
};

export const recordReading = async ({ storageUnitId, temperature, humidity, sensorId, timestamp }) => {
  const unit = await getUnitById(storageUnitId);

  unit.temperature = Number(temperature);
  unit.humidity = Number(humidity);
  unit.lastUpdated = new Date().toISOString();
  if (sensorId) unit.sensorId = sensorId;

  const prevStatus = unit.status;
  unit.evaluateStatus();

  // Append hourly telemetry log
  const timeLabel = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  unit.hourlyLogs.push({
    time: timeLabel,
    temp: unit.temperature,
    humidity: unit.humidity,
    timestamp: new Date(),
  });
  if (unit.hourlyLogs.length > 48) {
    unit.hourlyLogs.shift();
  }

  await unit.save();

  // If Critical Breach detected:
  if (unit.status === 'Critical') {
    // Identify affected refrigerated batches in this unit
    const affectedBatches = await DrugBatch.find({
      currentLocation: { $regex: unit.name, $options: 'i' },
      storageCondition: { $regex: 'Refrigerated', $options: 'i' },
    });

    const alertMessage = `Cold Chain Breach: ${unit.name} temperature reached ${unit.temperature}°C (safe range: ${unit.minTemp}–${unit.maxTemp}°C). ${unit.drugs.join(', ')} batches may be compromised.`;

    await Notification.create({
      type: 'critical',
      title: 'Critical Cold Chain Breach',
      message: alertMessage,
      severity: 'Critical',
      entityType: 'ColdChain',
      entityId: unit.storageUnitId,
      time: 'Just now',
    });

    await logAudit({
      user: 'IoT Gateway (ESP32)',
      userRole: 'warehouse',
      action: 'Cold Chain Breach Flagged',
      entity: 'ColdChain',
      entityId: unit.storageUnitId,
      detail: `Temperature at ${unit.temperature}°C, Humidity at ${unit.humidity}% in ${unit.name}`,
      type: 'alert',
    });

    emitEvent('coldchain:alert', {
      storageUnitId: unit.storageUnitId,
      name: unit.name,
      temperature: unit.temperature,
      humidity: unit.humidity,
      status: unit.status,
      affectedDrugs: unit.drugs,
      alertMessage,
    });

    emitEvent('notification:new', {
      type: 'critical',
      message: alertMessage,
    });
  }

  return unit;
};

/**
 * Simulate Cold Chain IoT telemetry for hackathon demo
 */
export const simulateColdChainAnomaly = async (storageUnitId = 'CCU-B', targetTemp = 11.8, targetHumidity = 85) => {
  return await recordReading({
    storageUnitId,
    temperature: targetTemp,
    humidity: targetHumidity,
    sensorId: 'ESP32-DEMO-SIM',
  });
};
