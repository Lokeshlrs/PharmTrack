import http from 'http';
import fs from 'fs';
import path from 'path';

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

async function runVerification() {
  console.log('\n==================================================');
  console.log('PHARMTRACK END-TO-END REMAINING TASKS VERIFICATION');
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

  // 1. QR Code Traceability Verification
  console.log('--- 1. QR Traceability ---');
  try {
    const batch1 = await request('GET', '/traceability/batch/PCM-2026-4521');
    assert(batch1.status === 200 && batch1.body.data?.batchNumber === 'PCM-2026-4521', 'Traceability Query for PCM-2026-4521', `Found batch with ${batch1.body.data?.journey?.length || 0} journey steps`);

    const batch2 = await request('GET', '/traceability/batch/INS-2025-1194');
    assert(batch2.status === 200 && batch2.body.data?.batchNumber === 'INS-2025-1194', 'Traceability Query for INS-2025-1194', `Found batch with ${batch2.body.data?.journey?.length || 0} journey steps`);

    const scanRes = await request('POST', '/traceability/scan', { batchNumber: 'AMX-2025-8832' });
    assert(scanRes.status === 200 && scanRes.body.data?.batchNumber === 'AMX-2025-8832', 'QR Traceability Scan API', 'Scanned and decoded GS1 batch');
  } catch (err) {
    assert(false, 'QR Traceability Endpoint Verification', err.message);
  }

  // 2. Smart Stock Redistribution Persistence
  console.log('\n--- 2. Smart Stock Redistribution Persistence ---');
  try {
    const recs = await request('GET', '/transfers/recommendations');
    assert(recs.status === 200 && Array.isArray(recs.body.data) && recs.body.data.length > 0, 'Get Redistribution Recommendations', `Fetched ${recs.body.data?.length || 0} recommendations`);

    const targetTransfer = recs.body.data[0];
    const targetId = targetTransfer.transferId || targetTransfer._id;

    // Approve the transfer
    const approveRes = await request('POST', `/transfers/${targetId}/approve`);
    assert(approveRes.status === 200 && approveRes.body.data?.transfer?.status === 'Approved', 'Approve Redistribution Transfer', `Approved transfer ${targetId}`);

    // Reload recommendations to verify persistence across refreshes
    const recheckRecs = await request('GET', '/transfers/recommendations');
    const approvedItem = recheckRecs.body.data?.find((d) => d.transferId === targetId || d._id === targetId);
    assert(approvedItem && approvedItem.status === 'Approved', 'Database Persistence on Reload', `Transfer ${targetId} remains Approved in MongoDB Atlas`);
  } catch (err) {
    assert(false, 'Redistribution Persistence Verification', err.message);
  }

  // 3. User Registration & Validation
  console.log('\n--- 3. User Signup / Registration & Validation ---');
  const uniqueEmail = `test.nurse.${Date.now()}@hospital.org`;
  try {
    // Valid registration
    const regRes = await request('POST', '/auth/register', {
      name: 'Sister Mary Joseph',
      email: uniqueEmail,
      password: 'SecurePass@123',
      role: 'hospital',
      organization: 'St. Stephens Hospital',
      phone: '+91 98111 22233',
    });
    assert(regRes.status === 201 && regRes.body.data?.token, 'User Registration Successful', `Registered ${uniqueEmail} with JWT token`);

    // Duplicate email rejection
    const dupRes = await request('POST', '/auth/register', {
      name: 'Duplicate Attempt',
      email: uniqueEmail,
      password: 'SecurePass@123',
      role: 'hospital',
    });
    assert(dupRes.status === 400 && dupRes.body.success === false, 'Duplicate Email Rejection', 'Properly rejected duplicate email with HTTP 400');
  } catch (err) {
    assert(false, 'Registration Verification', err.message);
  }

  // 4. Unique Login Credentials for Organizations
  console.log('\n--- 4. Unique Organization Credentials ---');
  const orgCreds = [
    { role: 'Admin', email: 'admin@pharmtrack.gov.in', pass: 'Admin@2025' },
    { role: 'Government', email: 'authority@mohfw.gov.in', pass: 'Govt@2025' },
    { role: 'Hospital (AIIMS Delhi)', email: 'aiims.delhi@pharmtrack.gov.in', pass: 'Aiims@2025' },
    { role: 'Hospital (PGI Chd)', email: 'pgi.chd@pharmtrack.gov.in', pass: 'Pgi@2025' },
    { role: 'Supplier (Sun Pharma)', email: 'supply@sunpharma.com', pass: 'Sun@2025' },
    { role: 'Supplier (Dr. Reddys)', email: 'orders@drreddys.com', pass: 'Reddys@2025' },
    { role: 'Warehouse (Delhi)', email: 'wh.delhi@pharmtrack.gov.in', pass: 'Warehouse@2025' },
    { role: 'Pharmacist (KGMU)', email: 'pharma@kgmu.edu.in', pass: 'Pharma@2025' },
  ];

  for (const cred of orgCreds) {
    try {
      const loginRes = await request('POST', '/auth/login', {
        email: cred.email,
        password: cred.pass,
      });
      assert(loginRes.status === 200 && loginRes.body.data?.token, `Login for ${cred.role}`, `${cred.email}`);
    } catch (err) {
      assert(false, `Login for ${cred.role}`, err.message);
    }
  }

  // 5. Add New Hospital Workflow
  console.log('\n--- 5. Add New Hospital Workflow ---');
  const newHospName = `Max Super Specialty Hospital ${Date.now().toString().slice(-4)}`;
  const hospEmail = `contact.${Date.now().toString().slice(-4)}@maxhealthcare.in`;
  try {
    const addHospRes = await request('POST', '/hospitals', {
      name: newHospName,
      city: 'Gurugram',
      state: 'Haryana',
      type: 'Tertiary',
      beds: 650,
      contactPerson: 'Dr. Rajiv Singhal',
      email: hospEmail,
      password: 'MaxHospital@2025',
      phone: '+91 124 662 3000',
    });
    assert(addHospRes.status === 201 && addHospRes.body.data?.name === newHospName, 'Create Hospital via API', `Created ${newHospName}`);

    // Verify it appears in hospital list
    const hospList = await request('GET', '/hospitals');
    const found = hospList.body.data?.find((h) => h.name === newHospName);
    assert(found !== undefined, 'New Hospital Present in List & MongoDB', `Hospital ID: ${found?.hospitalId}`);

    // Verify hospital login account was created
    const hospLogin = await request('POST', '/auth/login', {
      email: hospEmail,
      password: 'MaxHospital@2025',
    });
    assert(hospLogin.status === 200 && hospLogin.body.data?.token, 'New Hospital Account Login', `Logged in as ${hospEmail}`);
  } catch (err) {
    assert(false, 'Add New Hospital Verification', err.message);
  }

  // 6. Website Title & 7. Website Favicon
  console.log('\n--- 6 & 7. Website Title & Favicon ---');
  try {
    const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
    const hasTitle = indexHtml.includes('<title>PharmTrack – Intelligent Drug Inventory & Supply Chain</title>');
    assert(hasTitle, 'Website Title in index.html', 'PharmTrack – Intelligent Drug Inventory & Supply Chain');

    const hasFaviconLink = indexHtml.includes('href="/favicon.svg"');
    const faviconExists = fs.existsSync(path.resolve('public/favicon.svg'));
    assert(hasFaviconLink && faviconExists, 'Website Favicon referenced & file exists in public/favicon.svg', 'Vector SVG Favicon Verified');
  } catch (err) {
    assert(false, 'Website Title / Favicon Check', err.message);
  }

  console.log('\n==================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runVerification();
