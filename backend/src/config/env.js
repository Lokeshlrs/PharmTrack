import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Possible .env locations
const envPaths = [
  path.resolve(__dirname, '../../.env'),           // backend/.env relative to env.js
  path.resolve(process.cwd(), 'backend/.env'),     // backend/.env relative to cwd
  path.resolve(process.cwd(), '.env'),             // root .env relative to cwd
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    // Also parse bare lines if MONGODB_URI wasn't keyed properly
    if (!process.env.MONGODB_URI) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('mongodb+srv://') || (trimmed.startsWith('mongodb://') && !trimmed.startsWith('MONGODB_URI='))) {
            process.env.MONGODB_URI = trimmed;
            break;
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pharmtrack',
  JWT_SECRET: process.env.JWT_SECRET || 'pharmtrack_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'https://lokeshlrs.github.io,http://localhost:5173,http://localhost:8443,http://localhost:3000',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
