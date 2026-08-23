import { connectDB, disconnectDB } from '../src/config/database.js';
import { registerUser, loginUser } from '../src/services/authService.js';
import { listDrugs, createDrug } from '../src/services/drugService.js';
import { listInventory, createStock, adjustStock, consumeStock } from '../src/services/inventoryService.js';
import { getFEFOBatchesForDrug, consumeFEFO } from '../src/services/fefoService.js';
import { createPO, updatePOStatus, listPurchaseOrders } from '../src/services/procurementService.js';
import { createShipment, updateShipmentStatus, listShipments } from '../src/services/shipmentService.js';
import { getRedistributionRecommendations, approveTransfer } from '../src/services/redistributionService.js';
import { createEmergencyRequest, approveEmergencyRequest, findBestEmergencySource } from '../src/services/emergencyService.js';
import { recordReading, simulateColdChainAnomaly } from '../src/services/coldChainService.js';
import { initiateRecall, quarantineRecallBatch } from '../src/services/recallService.js';
import { seedDatabase } from '../src/seed/seed.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING PHARMTRACK BACKEND INTEGRATION TESTS');
  console.log('==================================================\n');

  try {
    await connectDB();
    await seedDatabase();

    // TEST 1: Authentication & Role Tokens
    console.log('\n[Test Suite 1: Authentication]');
    const authRes = await loginUser({ email: 'admin@pharmtrack.gov.in', password: 'Admin@2025' });
    assert(authRes && authRes.token != null, 'Admin login returns valid JWT token');
    assert(authRes.role === 'admin', 'User role is correctly set to admin');

    // TEST 2: Inventory CRUD & Dynamic Status
    console.log('\n[Test Suite 2: Inventory Management]');
    const invList = await listInventory();
    assert(invList.length >= 10, `Inventory contains ${invList.length} items (>= 10)`);
    const paracetamol = invList.find((i) => i.drugId === 'D001');
    assert(paracetamol != null, 'Paracetamol inventory item found');

    // Stock adjustment
    const adjusted = await adjustStock(paracetamol._id.toString(), { quantityAdjustment: 500, reason: 'Physical stock recount' });
    assert(adjusted.quantity === paracetamol.quantity + 500, `Stock adjusted from ${paracetamol.quantity} to ${adjusted.quantity}`);

    // TEST 3: FEFO (First Expiry First Out) Engine
    console.log('\n[Test Suite 3: FEFO Batch Prioritization & Sequential Consumption]');
    const fefoBatches = await getFEFOBatchesForDrug('D001');
    assert(fefoBatches.length > 0, `Found ${fefoBatches.length} valid FEFO batches for Paracetamol`);
    
    // Verify sorting by expiry ascending
    let isSorted = true;
    for (let i = 0; i < fefoBatches.length - 1; i++) {
      if (new Date(fefoBatches[i].expiryDate) > new Date(fefoBatches[i + 1].expiryDate)) {
        isSorted = false;
        break;
      }
    }
    assert(isSorted, 'Batches are strictly ordered by earliest expiry date (FEFO)');

    const fefoResult = await consumeFEFO({ drugId: 'D001', quantity: 200, department: 'ICU' });
    assert(fefoResult.success === true && fefoResult.totalConsumed === 200, 'FEFO sequential consumption executed successfully');

    // TEST 4: Purchase Orders & Lifecycle
    console.log('\n[Test Suite 4: Purchase Order Lifecycle]');
    const newPO = await createPO({
      drugId: 'D002',
      drugName: 'Amoxicillin 500mg',
      supplier: 'Sun Pharmaceutical',
      quantity: 5000,
      unitPrice: 8.0,
      totalValue: 40000,
    });
    assert(newPO && newPO.status === 'Pending', `Created PO ${newPO.poNumber} with status Pending`);

    const approvedPO = await updatePOStatus(newPO.poNumber, 'Approved');
    assert(approvedPO.status === 'Approved', `Approved PO ${approvedPO.poNumber}`);

    // TEST 5: Shipments & Milestone Progression
    console.log('\n[Test Suite 5: Shipment Tracking & Automated Stock Receipt]');
    const newShipment = await createShipment({
      supplierName: 'Cipla Ltd',
      supplierId: 'S001',
      origin: 'Cipla Warehouse Mumbai',
      destination: 'AIIMS New Delhi',
      drugName: 'Paracetamol 500mg',
      drugId: 'D001',
      quantity: 1000,
      batchNumber: 'TEST-PCM-999',
    });
    assert(newShipment && newShipment.status === 'Order Placed', `Created Shipment ${newShipment.shipmentId}`);

    const inTransitShipment = await updateShipmentStatus(newShipment.shipmentId, 'In Transit');
    assert(inTransitShipment.progress > 0, `Shipment progressed to In Transit (${inTransitShipment.progress}%)`);

    const receivedShipment = await updateShipmentStatus(newShipment.shipmentId, 'Received');
    assert(receivedShipment.status === 'Received' && receivedShipment.progress === 100, 'Shipment marked Received (100%)');

    // TEST 6: Smart Stock Redistribution Engine
    console.log('\n[Test Suite 6: Smart Stock Redistribution Engine]');
    const recommendations = await getRedistributionRecommendations();
    assert(recommendations.length > 0, `Redistribution engine produced ${recommendations.length} transfer recommendations`);
    const firstRec = recommendations[0];
    assert(firstRec.sourceStock > firstRec.sourceExpected, 'Recommendation identifies source with excess surplus');
    assert(firstRec.targetStock < firstRec.targetExpected, 'Recommendation identifies destination with stock shortage');

    const approvedTransfer = await approveTransfer(firstRec.transferId);
    assert(approvedTransfer.transfer.status === 'Approved', `Transfer ${firstRec.transferId} approved`);
    assert(approvedTransfer.shipment != null, `Transfer automatically spawned tracking shipment ${approvedTransfer.shipment.shipmentId}`);

    // TEST 7: Emergency Drug Requests & Sourcing Engine
    console.log('\n[Test Suite 7: Emergency Requests & Sourcing Engine]');
    const bestSource = await findBestEmergencySource('D003', 'H003', 500);
    assert(bestSource && bestSource.recommendedSource != null, `Source recommender suggested: ${bestSource.recommendedSource} (${bestSource.distance} km away)`);

    const emergencyReq = await createEmergencyRequest({
      hospitalId: 'H003',
      hospitalName: 'KGMU Lucknow',
      drugId: 'D003',
      drugName: 'Insulin Glargine',
      requiredQty: 500,
      priority: 'Critical',
      requiredBy: '4 Hours',
    });
    assert(emergencyReq.status === 'Pending', `Created emergency request ${emergencyReq.requestId}`);

    const approvedEmergency = await approveEmergencyRequest(emergencyReq.requestId);
    assert(approvedEmergency.request.status === 'Approved', `Approved emergency request ${emergencyReq.requestId}`);
    assert(approvedEmergency.shipment != null, 'Priority escort shipment automatically dispatched');

    // TEST 8: Cold Chain IoT Telemetry & Anomaly Alerts
    console.log('\n[Test Suite 8: Cold Chain IoT Telemetry & Breach Alarms]');
    const anomalyResult = await simulateColdChainAnomaly('CCU-B', 11.8, 85);
    assert(anomalyResult.status === 'Critical', `Cold chain breach correctly flagged as Critical (Temp: ${anomalyResult.temperature}°C)`);
    assert(anomalyResult.alerts > 0, 'Active breach alarm incremented');

    // TEST 9: Drug Recall & Facility Quarantine
    console.log('\n[Test Suite 9: National Drug Recall & Automated Quarantine]');
    const recallResult = await initiateRecall({
      drugId: 'D008',
      drugName: 'Omeprazole 20mg',
      batchNumber: 'OMP-2025-4410',
      reason: 'Tablet dissolution failure',
      severity: 'High',
    });
    assert(recallResult.status === 'Active', `Recall ${recallResult.recallId} initiated`);
    
    // Check that inventory is quarantined
    const quarantinedInv = await listInventory({ search: 'OMP-2025-4410' });
    const allQuarantined = quarantinedInv.every((i) => i.status === 'Quarantined');
    assert(allQuarantined, 'All batches with recalled batch number automatically transitioned to Quarantined state');

    console.log('\n==================================================');
    console.log(`🎉 ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');

    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test execution encountered an error:', error);
    await disconnectDB();
    process.exit(1);
  }
}

runAllTests();
