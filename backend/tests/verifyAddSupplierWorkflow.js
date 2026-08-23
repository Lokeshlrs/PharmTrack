import http from 'http';

const API_BASE = 'http://localhost:5000/api';

const request = (method, endpoint, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

async function runSupplierVerification() {
  console.log('\n==================================================');
  console.log('🧪 PHARMTRACK ADD SUPPLIER WORKFLOW VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  const testSupplierName = `Bharat Biotech Diagnostics ${Date.now().toString().slice(-4)}`;
  const testSupplierEmail = `orders.${Date.now().toString().slice(-4)}@bharatbiotech.com`;
  const testSupplierPassword = 'BharatBiotech@2025';

  try {
    // 1. Create Supplier via POST /api/suppliers
    console.log('--- 1. Create Supplier via Real Backend API ---');
    const createRes = await request('POST', '/suppliers', {
      name: testSupplierName,
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Genome Valley, Shameerpet',
      contactPerson: 'Dr. Krishna Ella',
      phone: '+91 40 2348 0567',
      email: testSupplierEmail,
      password: testSupplierPassword,
      score: 94,
      onTime: 96,
      quality: 98,
      fulfillment: 92,
    });

    assert(createRes.status === 201 && createRes.body.data?.name === testSupplierName, 'POST /api/suppliers API Call', `Created ${testSupplierName} with ID: ${createRes.body.data?.supplierId}`);
    const createdSupplierId = createRes.body.data?.supplierId;

    // 2. Fetch Supplier List to Verify Persistence & Immediate Appearance
    console.log('\n--- 2. Verify Supplier List & MongoDB Persistence ---');
    const listRes = await request('GET', '/suppliers');
    const foundInList = listRes.body.data?.find((s) => s.supplierId === createdSupplierId || s.name === testSupplierName);
    assert(foundInList != null, 'Supplier Visible in List Query', `Found in ${listRes.body.data?.length} registered suppliers`);
    assert(foundInList?.email === testSupplierEmail, 'Email & Attributes Persisted', `Email: ${foundInList?.email}, City: ${foundInList?.city}`);

    // 3. Query Specific Supplier by ID
    console.log('\n--- 3. Query Specific Supplier by ID ---');
    const getRes = await request('GET', `/suppliers/${createdSupplierId}`);
    assert(getRes.status === 200 && getRes.body.data?.name === testSupplierName, 'GET /api/suppliers/:id', `Retrieved ${getRes.body.data?.name}`);

    // 4. Verify Supplier Portal Login Authentication
    console.log('\n--- 4. Verify Supplier Portal Login Credentials ---');
    const loginRes = await request('POST', '/auth/login', {
      email: testSupplierEmail,
      password: testSupplierPassword,
    });
    assert(loginRes.status === 200 && loginRes.body.data?.token != null, 'Supplier Portal Login', `Successfully authenticated ${testSupplierEmail}`);
    assert(loginRes.body.data?.role === 'supplier', 'Supplier Role Assignment', `Assigned role: ${loginRes.body.data?.role}`);
    assert(loginRes.body.data?.organization === testSupplierName, 'Supplier Organization Association', `Organization: ${loginRes.body.data?.organization}`);

    // 5. Verify Supplier Performance & Scorecard Integration
    console.log('\n--- 5. Verify Supplier Performance Radar & Scorecard ---');
    const perfRes = await request('GET', `/suppliers/${createdSupplierId}/performance`);
    assert(perfRes.status === 200 && Array.isArray(perfRes.body.data?.radarMetrics), 'GET /api/suppliers/:id/performance', `Radar metrics count: ${perfRes.body.data?.radarMetrics?.length}`);

    console.log('\n==================================================');
    console.log(`SUPPLIER WORKFLOW SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runSupplierVerification();
