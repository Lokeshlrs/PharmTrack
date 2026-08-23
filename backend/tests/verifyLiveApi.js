import axios from 'axios';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';

const results = [];

async function testEndpoint(name, method, url, data = null, headers = {}, expectedStatus = [200, 201]) {
  try {
    const res = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
      validateStatus: () => true, // Don't throw on non-200
    });

    const isExpected = Array.isArray(expectedStatus)
      ? expectedStatus.includes(res.status)
      : res.status === expectedStatus;

    results.push({
      name,
      method: method.toUpperCase(),
      url,
      status: res.status,
      pass: isExpected,
      data: res.data,
      error: isExpected ? null : JSON.stringify(res.data),
    });

    return res;
  } catch (err) {
    results.push({
      name,
      method: method.toUpperCase(),
      url,
      status: 'ERR',
      pass: false,
      error: err.message,
    });
    return null;
  }
}

async function runLiveVerification() {
  console.log('==================================================');
  console.log('🔍 INITIATING LIVE BACKEND API VERIFICATION SUITE');
  console.log('   Target Server: http://localhost:5000');
  console.log('==================================================\n');

  // 1. Authentication & Role-based Tokens
  console.log('[1/7] Testing Authentication for all 6 roles...');
  const roles = [
    { role: 'admin', email: 'admin@pharmtrack.gov.in', password: 'Admin@2025' },
    { role: 'government', email: 'authority@mohfw.gov.in', password: 'Govt@2025' },
    { role: 'supplier', email: 'supply@cipla.com', password: 'Supplier@2025' },
    { role: 'warehouse', email: 'wh.delhi@pharmtrack.gov.in', password: 'Warehouse@2025' },
    { role: 'hospital', email: 'aiims@mohfw.gov.in', password: 'Hospital@2025' },
    { role: 'pharmacist', email: 'pharma@kgmu.edu.in', password: 'Pharma@2025' },
  ];

  const tokens = {};
  for (const r of roles) {
    const res = await testEndpoint(
      `Login (${r.role})`,
      'POST',
      '/auth/login',
      { email: r.email, password: r.password },
      {},
      200
    );
    if (res?.data?.data?.token) {
      tokens[r.role] = res.data.data.token;
    }
  }

  const adminAuth = tokens.admin ? { Authorization: `Bearer ${tokens.admin}` } : {};
  const pharmaAuth = tokens.pharmacist ? { Authorization: `Bearer ${tokens.pharmacist}` } : {};
  const govtAuth = tokens.government ? { Authorization: `Bearer ${tokens.government}` } : {};
  const suppAuth = tokens.supplier ? { Authorization: `Bearer ${tokens.supplier}` } : {};
  const whAuth = tokens.warehouse ? { Authorization: `Bearer ${tokens.warehouse}` } : {};
  const hospAuth = tokens.hospital ? { Authorization: `Bearer ${tokens.hospital}` } : {};

  // Verify /auth/me for each role
  await testEndpoint('Auth Profile: Admin', 'GET', '/auth/me', null, adminAuth, 200);
  await testEndpoint('Auth Profile: Government', 'GET', '/auth/me', null, govtAuth, 200);
  await testEndpoint('Auth Profile: Supplier', 'GET', '/auth/me', null, suppAuth, 200);
  await testEndpoint('Auth Profile: Warehouse', 'GET', '/auth/me', null, whAuth, 200);
  await testEndpoint('Auth Profile: Hospital', 'GET', '/auth/me', null, hospAuth, 200);
  await testEndpoint('Auth Profile: Pharmacist', 'GET', '/auth/me', null, pharmaAuth, 200);

  // 2. Drugs & Formularies
  console.log('[2/7] Testing Drugs & Batches...');
  const drugsRes = await testEndpoint('List Drugs', 'GET', '/drugs', null, {}, 200);
  const sampleDrug = drugsRes?.data?.data?.[0];

  if (sampleDrug) {
    await testEndpoint('Get Drug by ID', 'GET', `/drugs/${sampleDrug._id || sampleDrug.drugId}`, null, {}, 200);
  }

  const createdDrug = await testEndpoint(
    'Create Drug',
    'POST',
    '/drugs',
    {
      name: `Levofloxacin 500mg - ${Date.now().toString().slice(-4)}`,
      genericName: 'Levofloxacin',
      category: 'Antibiotic',
      manufacturer: 'Cipla Ltd',
      unitPrice: 18.5,
      storageCondition: 'Room Temp 15–25°C',
    },
    adminAuth,
    201
  );

  // Batches
  const batchesRes = await testEndpoint('List Batches', 'GET', '/batches', null, {}, 200);
  const sampleBatch = batchesRes?.data?.data?.[0];
  if (sampleBatch) {
    await testEndpoint('Get Batch by ID', 'GET', `/batches/${sampleBatch._id || sampleBatch.batchNumber}`, null, {}, 200);
  }

  // 3. Inventory & FEFO
  console.log('[3/7] Testing Inventory, FEFO & Expiry...');
  const invRes = await testEndpoint('List Inventory', 'GET', '/inventory', null, {}, 200);
  const sampleInv = invRes?.data?.data?.[0];

  await testEndpoint('Inventory Critical Stock', 'GET', '/inventory/critical', null, {}, 200);
  await testEndpoint('Inventory Low Stock', 'GET', '/inventory/low-stock', null, {}, 200);
  await testEndpoint('Inventory Expiring Soon', 'GET', '/inventory/expiring?days=60', null, {}, 200);
  await testEndpoint('Inventory Expired', 'GET', '/inventory/expired', null, {}, 200);
  await testEndpoint('Inventory FEFO Queue', 'GET', '/inventory/fefo', null, {}, 200);

  if (sampleInv) {
    await testEndpoint('Get Inventory by ID', 'GET', `/inventory/${sampleInv._id}`, null, {}, 200);
    await testEndpoint(
      'Adjust Inventory Stock',
      'POST',
      '/inventory/adjust',
      { id: sampleInv._id, quantityAdjustment: 50, reason: 'Stock audit count adjustment' },
      adminAuth,
      200
    );
  }

  // 4. Hospitals, Suppliers & Procurement
  console.log('[4/7] Testing Hospitals, Suppliers & Procurement...');
  const hospRes = await testEndpoint('List Hospitals', 'GET', '/hospitals', null, {}, 200);
  const sampleHosp = hospRes?.data?.data?.[0];
  if (sampleHosp) {
    await testEndpoint('Get Hospital by ID', 'GET', `/hospitals/${sampleHosp._id || sampleHosp.hospitalId}`, null, {}, 200);
    await testEndpoint('Get Hospital Inventory', 'GET', `/hospitals/${sampleHosp._id || sampleHosp.hospitalId}/inventory`, null, {}, 200);
    await testEndpoint('Get Hospital Map Data', 'GET', '/hospitals/map', null, {}, 200);
  }

  const suppRes = await testEndpoint('List Suppliers', 'GET', '/suppliers', null, {}, 200);
  const sampleSupp = suppRes?.data?.data?.[0];
  if (sampleSupp) {
    await testEndpoint('Get Supplier by ID', 'GET', `/suppliers/${sampleSupp._id || sampleSupp.supplierId}`, null, {}, 200);
    await testEndpoint('Get Supplier Performance', 'GET', `/suppliers/${sampleSupp._id || sampleSupp.supplierId}/performance`, null, {}, 200);
    await testEndpoint('Get Supplier Ranking', 'GET', '/suppliers/ranking', null, {}, 200);
  }

  // Purchase Orders
  await testEndpoint('List Purchase Orders', 'GET', '/purchase-orders', null, {}, 200);
  const createdPO = await testEndpoint(
    'Create Purchase Order',
    'POST',
    '/purchase-orders',
    {
      drugId: sampleDrug?.drugId || 'D001',
      drugName: sampleDrug?.name || 'Paracetamol 500mg',
      supplier: sampleSupp?.name || 'Cipla Ltd',
      supplierId: sampleSupp?.supplierId || 'SUP-001',
      hospital: sampleHosp?.name || 'AIIMS New Delhi',
      hospitalId: sampleHosp?.hospitalId || 'H001',
      quantity: 500,
      unitPrice: 5.0,
      notes: 'Urgent ward restock',
    },
    adminAuth,
    201
  );

  const poId = createdPO?.data?.data?._id || createdPO?.data?.data?.poNumber;
  if (poId) {
    await testEndpoint('Get Purchase Order by ID', 'GET', `/purchase-orders/${poId}`, null, {}, 200);
    await testEndpoint('Approve Purchase Order', 'POST', `/purchase-orders/${poId}/approve`, {}, adminAuth, 200);
  }

  // 5. Shipments, Emergency & Stock Redistribution
  console.log('[5/7] Testing Shipments, Emergency Requests & Redistribution...');
  await testEndpoint('List Shipments', 'GET', '/shipments', null, {}, 200);
  const createdShipment = await testEndpoint(
    'Create Shipment',
    'POST',
    '/shipments',
    {
      drugName: sampleDrug?.name || 'Paracetamol 500mg',
      drugId: sampleDrug?.drugId || 'D001',
      batchNumber: `B-TEST-${Date.now().toString().slice(-4)}`,
      origin: 'Central Warehouse, Delhi',
      destination: 'AIIMS New Delhi',
      quantity: 200,
      requiresColdChain: false,
      supplierName: 'Cipla Ltd',
      supplierId: 'SUP-001',
    },
    adminAuth,
    201
  );

  const shipId = createdShipment?.data?.data?._id || createdShipment?.data?.data?.shipmentId;
  if (shipId) {
    await testEndpoint('Get Shipment by ID', 'GET', `/shipments/${shipId}`, null, {}, 200);
    await testEndpoint('Get Shipment Tracking', 'GET', `/shipments/${shipId}/tracking`, null, {}, 200);
    await testEndpoint('Update Shipment Status', 'POST', `/shipments/${shipId}/status`, { status: 'In Transit' }, adminAuth, 200);
  }

  // Emergency Requests
  const createdER = await testEndpoint(
    'Create Emergency Request',
    'POST',
    '/emergency-requests',
    {
      hospitalId: sampleHosp?.hospitalId || 'H001',
      hospitalName: sampleHosp?.name || 'AIIMS New Delhi',
      drugId: sampleDrug?.drugId || 'D001',
      drugName: sampleDrug?.name || 'Paracetamol 500mg',
      requiredQty: 100,
      urgencyLevel: 'Critical',
      reason: 'ICU stock depletion',
    },
    adminAuth,
    201
  );

  const erId = createdER?.data?.data?._id || createdER?.data?.data?.requestId;
  if (erId) {
    await testEndpoint('Get Emergency Request by ID', 'GET', `/emergency-requests/${erId}`, null, {}, 200);
    await testEndpoint('Recommend Emergency Source', 'POST', `/emergency-requests/${erId}/recommend-source`, {}, adminAuth, 200);
    await testEndpoint('Approve Emergency Request', 'POST', `/emergency-requests/${erId}/approve`, {}, adminAuth, 200);
  }

  // Redistribution Recommendations
  const redisRes = await testEndpoint('Get Redistribution Recommendations', 'GET', '/transfers/recommendations', null, {}, 200);
  const sampleRec = redisRes?.data?.data?.[0];
  if (sampleRec && sampleRec.transferId) {
    await testEndpoint('Approve Redistribution Transfer', 'POST', `/transfers/${sampleRec.transferId}/approve`, {}, adminAuth, 200);
  }

  // 6. Cold Chain, Recalls, Notifications, Audit & Analytics
  console.log('[6/7] Testing Cold Chain, Recalls, Notifications, Audit, AI Forecast & Analytics...');
  const ccUnits = await testEndpoint('List Cold Chain Units', 'GET', '/cold-chain', null, {}, 200);
  const sampleUnit = ccUnits?.data?.data?.[0];
  if (sampleUnit) {
    await testEndpoint('Get Cold Chain Unit by ID', 'GET', `/cold-chain/${sampleUnit.storageUnitId || sampleUnit._id}`, null, {}, 200);
    await testEndpoint('Get Cold Chain Readings', 'GET', `/cold-chain/${sampleUnit.storageUnitId || sampleUnit._id}/readings`, null, {}, 200);
  }
  await testEndpoint('Simulate Cold Chain Anomaly', 'POST', '/cold-chain/simulate', { storageUnitId: 'CCU-B', temperature: 13.5, humidity: 89 }, adminAuth, 200);

  // Recalls
  const recallRes = await testEndpoint('List Drug Recalls', 'GET', '/recalls', null, {}, 200);
  const sampleRecall = recallRes?.data?.data?.[0];
  if (sampleRecall) {
    await testEndpoint('Get Recall by ID', 'GET', `/recalls/${sampleRecall.recallId || sampleRecall._id}`, null, {}, 200);
    await testEndpoint('Quarantine Recalled Batch', 'POST', `/recalls/${sampleRecall.recallId || sampleRecall._id}/quarantine`, {}, adminAuth, 200);
    await testEndpoint('Notify Hospitals of Recall', 'POST', `/recalls/${sampleRecall.recallId || sampleRecall._id}/notify`, {}, adminAuth, 200);
  }

  // Notifications
  await testEndpoint('List Notifications', 'GET', '/notifications', null, {}, 200);
  await testEndpoint('Get Unread Notifications', 'GET', '/notifications/unread', null, {}, 200);
  await testEndpoint('Mark All Notifications Read', 'PATCH', '/notifications/read-all', {}, adminAuth, 200);

  // Audit Logs
  await testEndpoint('List Audit Logs', 'GET', '/audit-logs', null, {}, 200);
  await testEndpoint('Get Audit Logs for Entity', 'GET', '/audit-logs/entity/INVENTORY', null, {}, 200);

  // AI Forecasting & Analytics
  await testEndpoint('List AI Forecasts', 'GET', '/forecast', null, {}, 200);
  if (sampleDrug) {
    await testEndpoint('Get Forecast for Drug', 'GET', `/forecast/${sampleDrug.drugId}?days=30`, null, {}, 200);
    await testEndpoint('Get Reorder Recommendation', 'GET', `/forecast/${sampleDrug.drugId}/reorder`, null, {}, 200);
    await testEndpoint('Generate PO from Forecast', 'POST', `/forecast/${sampleDrug.drugId}/generate-purchase-order`, {}, adminAuth, 201);
  }

  await testEndpoint('Get Analytics Overview', 'GET', '/analytics', null, {}, 200);
  await testEndpoint('Get Analytics Dashboard', 'GET', '/analytics/dashboard', null, {}, 200);
  await testEndpoint('Get Shortage Map', 'GET', '/analytics/shortage-map', null, {}, 200);

  // Traceability
  if (sampleBatch) {
    await testEndpoint('Get Batch QR Traceability', 'GET', `/traceability/batch/${sampleBatch.batchNumber}`, null, {}, 200);
  }

  // 7. Socket.IO Real-time Events
  console.log('[7/7] Testing Socket.IO Real-time Connection & Events...');
  let socketConnected = false;

  await new Promise((resolve) => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      timeout: 5000,
    });

    socket.on('connect', () => {
      socketConnected = true;
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', () => {
      resolve();
    });

    setTimeout(() => {
      socket.disconnect();
      resolve();
    }, 6000);
  });

  results.push({
    name: 'Socket.IO Real-Time Connection',
    method: 'WS',
    url: 'ws://localhost:5000',
    status: socketConnected ? 'CONNECTED' : 'FAILED',
    pass: socketConnected,
    error: socketConnected ? null : 'Could not connect via WebSocket',
  });

  // Output summary
  console.log('\n==================================================');
  console.log('📊 BACKEND API VERIFICATION SUMMARY TABLE');
  console.log('==================================================');
  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    const statusLabel = r.pass ? '✓ PASS' : '✗ FAIL';
    if (r.pass) passedCount++;
    else failedCount++;

    console.log(`${statusLabel.padEnd(8)} | ${r.method.padEnd(6)} | ${(r.status + '').padEnd(6)} | ${r.url.padEnd(45)} | ${r.name}`);
    if (!r.pass && r.error) {
      console.log(`         ↳ Error: ${r.error}`);
    }
  }

  console.log('==================================================');
  console.log(`TOTAL ENDPOINTS TESTED: ${results.length}`);
  console.log(`PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('==================================================\n');

  return { total: results.length, passed: passedCount, failed: failedCount, results };
}

runLiveVerification();
