import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongod = null;

export const connectDB = async () => {
  const isAtlas = ENV.MONGODB_URI.includes('mongodb+srv://') || (!ENV.MONGODB_URI.includes('127.0.0.1') && !ENV.MONGODB_URI.includes('localhost'));

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      dbName: 'pharmtrack',
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    if (isAtlas) {
      console.log(`[Database] MongoDB Connected to MongoDB Atlas host: ${conn.connection.host} / database: ${conn.connection.name}`);
    } else {
      console.log(`[Database] MongoDB Connected to host: ${conn.connection.host} / database: ${conn.connection.name}`);
    }
    return conn;
  } catch (error) {
    if (isAtlas) {
      console.error(`[Database] Failed to connect to MongoDB Atlas (${ENV.MONGODB_URI}): ${error.message}`);
      throw error;
    }
    console.warn(`[Database] Direct MongoDB connection to ${ENV.MONGODB_URI} failed: ${error.message}`);
    console.log(`[Database] Starting Embedded In-Memory MongoDB for local hackathon demo...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri, { dbName: 'pharmtrack' });
      console.log(`[Database] Embedded In-Memory MongoDB connected at: ${memoryUri}`);
      return conn;
    } catch (memError) {
      console.error(`[Database] Failed to initialize fallback in-memory MongoDB:`, memError);
      throw memError;
    }
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
