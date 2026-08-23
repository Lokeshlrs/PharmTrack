import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';

async function testSpecificFixes() {
  console.log('==================================================');
  console.log('🔍 VERIFYING TARGETED API FIXES & COMPLIANCE');
  console.log('==================================================\n');

  // Login as admin for authenticated routes
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@pharmtrack.gov.in',
    password: 'Admin@2025',
  });
  const token = loginRes.data.data.token;
  const adminAuth = { Authorization: `Bearer ${token}` };

  const testCases = [
    {
      name: 'Issue 1: Audit Logs for Entity',
      method: 'GET',
      url: '/audit-logs/entity/INVENTORY',
      headers: adminAuth,
      expected: 200,
    },
    {
      name: 'Issue 2: Batch QR Traceability for Seeded Batch',
      method: 'GET',
      url: '/traceability/batch/DEX-2025-1122',
      headers: {},
      expected: 200,
    },
    {
      name: 'Issue 3: Generate Purchase Order from Forecast for D004',
      method: 'POST',
      url: '/forecast/D004/generate-purchase-order',
      data: {},
      headers: adminAuth,
      expected: 201,
    },
  ];

  const results = [];

  for (const t of testCases) {
    try {
      const res = await axios({
        method: t.method,
        url: `${BASE_URL}${t.url}`,
        data: t.data,
        headers: t.headers,
        validateStatus: () => true,
      });

      const pass = res.status === t.expected;
      results.push({
        name: t.name,
        method: t.method,
        url: t.url,
        status: res.status,
        expected: t.expected,
        pass,
        data: res.data,
        error: pass ? null : JSON.stringify(res.data),
      });
    } catch (err) {
      results.push({
        name: t.name,
        method: t.method,
        url: t.url,
        status: 'ERR',
        expected: t.expected,
        pass: false,
        error: err.message,
      });
    }
  }

  // Socket.IO test
  let socketConnected = false;
  await new Promise((resolve) => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      timeout: 4000,
    });
    socket.on('connect', () => {
      socketConnected = true;
      socket.disconnect();
      resolve();
    });
    socket.on('connect_error', () => resolve());
    setTimeout(() => {
      socket.disconnect();
      resolve();
    }, 4500);
  });

  results.push({
    name: 'Socket.IO Real-time Connection',
    method: 'WS',
    url: 'ws://localhost:5000',
    status: socketConnected ? 'CONNECTED' : 'FAILED',
    expected: 'CONNECTED',
    pass: socketConnected,
    error: socketConnected ? null : 'Could not connect to WebSocket',
  });

  // Print results
  console.log('--------------------------------------------------');
  for (const r of results) {
    const label = r.pass ? '✓ PASS' : '✗ FAIL';
    console.log(`${label.padEnd(8)} | ${r.method.padEnd(6)} | Status: ${r.status} (Expected: ${r.expected}) | ${r.url}`);
    if (!r.pass) {
      console.log(`         ↳ Error: ${r.error}`);
    } else if (r.data) {
      const summary = r.data.count !== undefined ? `Count: ${r.data.count}` : (r.data.data?.batchNumber || r.data.data?.po?.poNumber || 'OK');
      console.log(`         ↳ Payload Summary: ${summary}`);
    }
  }
  console.log('--------------------------------------------------\n');

  return results;
}

testSpecificFixes();
