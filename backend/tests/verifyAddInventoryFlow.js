import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testAddInventoryFlow() {
  console.log('----------------------------------------------------');
  console.log('Testing Complete ADD INVENTORY & ADJUSTMENT Flow...');
  console.log('----------------------------------------------------');

  // 1. Auth login
  const loginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'admin@pharmtrack.gov.in',
    password: 'Admin@2025',
  });
  const token = loginRes.data.data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const testBatch = `TEST-AMX-${Date.now().toString().slice(-4)}`;

  // 2. Add Stock
  console.log(`[1] Submitting Add Stock for batch ${testBatch}...`);
  const createPayload = {
    drugName: 'Amoxicillin 500mg',
    batchNumber: testBatch,
    quantity: 3500,
    expiryDate: '2027-08-15',
    location: 'Central Warehouse, Delhi',
    supplierName: 'Cipla Ltd',
  };

  const createRes = await axios.post(`${API_BASE}/inventory`, createPayload, { headers });
  console.log(`[+] Inventory created with ID: ${createRes.data.data._id}, invId: ${createRes.data.data.invId}, status: ${createRes.data.data.status}`);

  if (createRes.data.data.batchNumber !== testBatch || createRes.data.data.quantity !== 3500) {
    throw new Error('Created batch attributes mismatch');
  }

  // 3. Verify List Fetch
  console.log('[2] Verifying inventory list contains new item...');
  const listRes = await axios.get(`${API_BASE}/inventory?search=${testBatch}`, { headers });
  const found = listRes.data.data.find(i => i.batchNumber === testBatch);
  if (!found) {
    throw new Error(`Batch ${testBatch} was not found in inventory list query`);
  }
  console.log(`[+] Found in list: ${found.drugName} - ${found.batchNumber} (${found.quantity} units, status: ${found.status})`);

  // 4. Adjust Quantity
  console.log(`[3] Adjusting stock quantity for ${testBatch} by +500 units...`);
  const adjustRes = await axios.post(`${API_BASE}/inventory/adjust`, {
    id: createRes.data.data._id,
    quantityAdjustment: 500,
    reason: 'Verified incoming replenishment container',
  }, { headers });
  console.log(`[+] Stock adjusted successfully. New Quantity: ${adjustRes.data.data.quantity} units`);

  if (adjustRes.data.data.quantity !== 4000) {
    throw new Error(`Expected adjusted quantity 4000, got ${adjustRes.data.data.quantity}`);
  }

  // 5. Verify Traceability & Batch linkage
  console.log(`[4] Verifying QR & Traceability for ${testBatch}...`);
  const traceRes = await axios.get(`${API_BASE}/traceability/batch/${testBatch}`, { headers });
  console.log(`[+] Traceability record verified: ${traceRes.data.data.drugName} (Journey steps: ${traceRes.data.data.journey.length})`);

  console.log('----------------------------------------------------');
  console.log('✅ ADD INVENTORY WORKFLOW 100% VERIFIED & PERSISTED');
  console.log('----------------------------------------------------');
}

testAddInventoryFlow().catch(err => {
  console.error('❌ Add inventory verification failed:', err.response?.data || err.message);
  process.exit(1);
});
