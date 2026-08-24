import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { ENV } from './src/config/env.js';
import { connectDB } from './src/config/database.js';
import { initSocket } from './src/sockets/socketHandler.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import drugRoutes from './src/routes/drugRoutes.js';
import batchRoutes from './src/routes/batchRoutes.js';
import inventoryRoutes from './src/routes/inventoryRoutes.js';
import procurementRoutes from './src/routes/procurementRoutes.js';
import supplierRoutes from './src/routes/supplierRoutes.js';
import shipmentRoutes from './src/routes/shipmentRoutes.js';
import hospitalRoutes from './src/routes/hospitalRoutes.js';
import redistributionRoutes from './src/routes/redistributionRoutes.js';
import emergencyRoutes from './src/routes/emergencyRoutes.js';
import forecastRoutes from './src/routes/forecastRoutes.js';
import coldChainRoutes from './src/routes/coldChainRoutes.js';
import traceabilityRoutes from './src/routes/traceabilityRoutes.js';
import expiryRoutes from './src/routes/expiryRoutes.js';
import recallRoutes from './src/routes/recallRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';

// Seed Helper
import { seedDatabaseIfEmpty } from './src/seed/seed.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer, ENV.CLIENT_URL);

// Security & Utility Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = ENV.CLIENT_URL
  ? ENV.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['https://lokeshlrs.github.io', 'http://localhost:5173', 'http://localhost:8443', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.github.io') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiter for general requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PharmTrack Backend Core',
    version: '2.4.1',
    features: {
      socketIO: true,
      fefoEngine: true,
      redistributionAI: true,
      coldChainTelemetry: true,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', procurementRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use(['/api/transfers', '/api/redistribution'], redistributionRoutes);
app.use(['/api/emergency-requests', '/api/emergency'], emergencyRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/cold-chain', coldChainRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/expiry', expiryRoutes);
app.use('/api/recalls', recallRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();

    httpServer.listen(ENV.PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 PharmTrack Backend Server running on port ${ENV.PORT}`);
      console.log(`📡 WebSocket / Socket.IO ready`);
      console.log(`🏥 Environment: ${ENV.NODE_ENV}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
