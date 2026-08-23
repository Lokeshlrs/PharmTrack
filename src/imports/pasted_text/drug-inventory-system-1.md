# Build an Intelligent Drug Inventory & Supply Chain Tracking System

You are an expert **full-stack developer, UI/UX designer, and system architect**. Build a modern, production-quality web application for the following Smart India Hackathon problem statement.

## Problem Statement

**ID:** PSS04

**Title:** Drug Inventory and Supply Chain Tracking System

The goal is to provide the:

> **Right Quantity of the Right Product at the Right Place at the Right Time, in the Right Condition, at the Right Cost, for the Right People.**

The platform should streamline drug procurement and distribution to hospitals/medical institutions and ensure continuous availability of medicines.

The system must improve procurement and distribution efficiency through strong quality controls and provide dashboard-based monitoring of activities at every level, including:

* Vendor activities
* Supply order preparation
* Shipment tracking
* Drug inventory
* Drug consumption patterns at hospitals/medical institutions
* Drug expiry
* Quality control
* Shortage detection
* Emergency drug requirements

---

# 1. Technology Stack

Use the following stack.

## Frontend

* React.js
* Vite
* Tailwind CSS
* shadcn/ui
* React Router
* Axios
* Recharts
* Lucide React icons
* Leaflet / React Leaflet for maps
* Socket.IO client for real-time updates

## Backend

* Node.js
* Express.js
* REST APIs
* Socket.IO
* JWT authentication
* bcrypt
* Zod or Joi validation

## Database

* MongoDB
* Mongoose
* MongoDB Atlas compatible

## AI/ML Service

Use a separate Python service:

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn

The AI service should provide:

* Drug demand forecasting
* Stock-out prediction
* Smart reorder recommendations
* Consumption trend analysis

## IoT

Design the system so it can integrate with:

* ESP32
* DHT22 / DS18B20 temperature sensors
* MQTT or HTTP

The prototype can use simulated IoT data if physical hardware is not available.

## Deployment-ready architecture

The application should be structured so it can later be deployed using:

* Vercel for frontend
* Render/Railway for backend
* MongoDB Atlas for database
* Render/Railway for Python AI service

---

# 2. Important Instruction

Do NOT create a generic pharmacy inventory CRUD website.

This should look like an **intelligent national/regional pharmaceutical supply-chain platform**.

The UI should feel like a combination of:

* Government healthcare platform
* Supply-chain management system
* Logistics tracking platform
* AI analytics dashboard

The project should clearly demonstrate the concept of:

> **Predict → Procure → Track → Monitor → Redistribute → Deliver**

---

# 3. User Roles

Implement role-based dashboards.

### Admin

Can:

* Monitor entire supply chain
* Manage hospitals
* Manage suppliers
* Manage drugs
* Monitor shipments
* Monitor inventory
* View analytics
* View alerts
* Manage users

### Government / Authority

Can:

* View regional drug availability
* Monitor critical shortages
* Monitor hospital demand
* View supplier performance
* View overall supply-chain analytics
* Identify shortage hotspots
* Monitor emergency requests

### Supplier

Can:

* View purchase orders
* Accept/reject orders
* Prepare shipments
* Update shipment status
* View delivery history
* View supplier performance

### Warehouse

Can:

* Manage incoming stock
* Manage outgoing stock
* Scan drug batches
* Perform quality checks
* Monitor expiry
* Manage FEFO
* Update inventory

### Hospital / Medical Institution

Can:

* View inventory
* Request medicines
* Raise emergency requests
* View consumption
* Track shipments
* Request stock transfers
* View expiry alerts

### Pharmacist

Can:

* Manage medicine batches
* Scan QR codes
* Check expiry
* Record consumption
* Perform stock verification
* Report damaged/expired medicines

---

# 4. Main Features

## A. Smart Inventory Management

Create a complete inventory management system with:

* Drug name
* Generic name
* Category
* Manufacturer
* Batch number
* Manufacturing date
* Expiry date
* Quantity
* Unit price
* Storage condition
* Current location
* Supplier
* Stock status

Inventory status:

* Healthy
* Low Stock
* Critical
* Overstocked
* Expiring Soon
* Expired

Use visual indicators and charts.

---

# 5. AI Demand Forecasting

Create an AI-powered module.

Show:

### Predicted Drug Demand

For example:

> Paracetamol 500mg
> Current Stock: 1,240
> Predicted 30-Day Demand: 2,100
> Expected Shortage: 860
> Recommended Order: 1,100

The system should display:

* 7-day forecast
* 30-day forecast
* 90-day forecast
* Historical consumption
* Predicted consumption
* Confidence indicator

Create a visually impressive forecasting chart.

If a real ML model is not yet available, create a realistic mock prediction service with a clean API structure so the actual ML model can later replace it.

---

# 6. Smart Reorder System

Do not use only a basic "stock < threshold" rule.

Calculate recommendations using:

* Current inventory
* Historical consumption
* Predicted demand
* Safety stock
* Lead time
* Supplier reliability

Example:

```text
Current Stock: 500
Predicted Demand: 1,500
Safety Stock: 300
Recommended Order: 1,300
```

Display a button:

**"Generate Purchase Order"**

---

# 7. Drug Redistribution Engine

This should be one of the major innovative features.

The system should identify hospitals with:

### Excess Stock

and hospitals with:

### Critical Shortage

Example:

```text
Hospital A
Paracetamol
Available: 5,000
Expected requirement: 2,500

Excess: 2,500
```

```text
Hospital B
Paracetamol
Available: 300
Expected requirement: 1,800

Shortage: 1,500
```

The system should recommend:

> **Transfer 1,500 units from Hospital A → Hospital B**

Consider:

* Current stock
* Predicted demand
* Expiry date
* Distance
* Delivery time
* Emergency priority

Create a dedicated **Smart Redistribution** page.

---

# 8. QR / Barcode Drug Traceability

Every drug batch should have a unique QR code.

When scanned, show:

```text
Drug Name
Batch Number
Manufacturer
Manufacturing Date
Expiry Date
Quantity
Supplier
Warehouse
Current Location
Quality Status
```

Also display the complete journey:

```text
Manufacturer
      ↓
Supplier
      ↓
Warehouse
      ↓
Transport
      ↓
Hospital
      ↓
Pharmacy
```

Use a clean timeline UI.

Implement QR generation and scanning in the frontend.

---

# 9. Cold Chain Monitoring

Create a dedicated **Cold Chain Monitoring** page.

Display simulated IoT sensor information:

```text
Storage Unit: Cold Room A

Temperature: 4.3°C
Humidity: 62%
Status: SAFE
```

Create different statuses:

* Safe
* Warning
* Critical

Example:

```text
Temperature: 11.8°C

Required Range: 2°C – 8°C

🚨 CRITICAL
```

Show:

* Temperature graph
* Humidity graph
* Storage unit status
* Last updated time
* Alerts

Structure the backend so ESP32 sensors can later send actual data.

---

# 10. Shipment Tracking

Create a modern logistics tracking interface.

Shipment information:

* Shipment ID
* Supplier
* Origin
* Destination
* Drug
* Quantity
* Batch
* Dispatch date
* Expected arrival
* Current status

Statuses:

```text
Order Placed
     ↓
Approved
     ↓
Packed
     ↓
Dispatched
     ↓
In Transit
     ↓
Arrived
     ↓
Received
```

Use:

* Timeline
* Map
* Shipment status
* ETA
* Route

Use Leaflet for the map.

---

# 11. Emergency Drug Request

Hospitals should be able to raise emergency requests.

Example:

```text
Drug: Insulin
Required Quantity: 500
Priority: CRITICAL
Hospital: City Hospital
Required By: 6 Hours
```

The system should identify nearby hospitals/warehouses with available stock.

Show:

> **Recommended Source: Central Warehouse — 12 km away**

Allow the admin to approve the emergency transfer.

---

# 12. Drug Expiry & FEFO

Implement:

### FEFO

**First Expiry, First Out**

The system should automatically prioritize batches that expire earlier.

Example:

```text
Batch A → Expires in 15 days
Batch B → Expires in 90 days

Use Batch A first.
```

Create:

* Expiry dashboard
* Expiry calendar
* Expiry alerts
* Near-expiry inventory
* Expired inventory

---

# 13. Drug Recall Management

Create a recall feature.

If a particular batch is recalled:

```text
Batch: PCM-2026-4521
Status: RECALLED
```

The system should identify:

* Where the batch was supplied
* Which hospitals have it
* Current quantity
* Shipment history

Display:

> **12 hospitals currently hold this recalled batch.**

This is an important safety feature.

---

# 14. Supplier Performance

Create a supplier scoring system.

Score suppliers based on:

* On-time delivery
* Product quality
* Price
* Rejected batches
* Delayed shipments
* Fulfillment rate

Example:

```text
ABC Pharma

Overall Score: 92%

On-time delivery: 95%
Quality score: 94%
Fulfillment: 89%
```

Use charts and ranking cards.

---

# 15. Analytics Dashboard

Create a powerful dashboard containing:

### KPI Cards

* Total Drugs
* Total Inventory Value
* Critical Stock
* Expiring Soon
* Active Shipments
* Emergency Requests
* Active Suppliers
* Hospitals Covered

### Charts

* Drug consumption trend
* Procurement trend
* Stock levels
* Expiry analysis
* Supplier performance
* Regional shortages
* Predicted demand

---

# 16. Drug Shortage Heatmap

Create a map showing areas/hospitals according to stock availability.

Example:

🟢 Normal
🟡 Low
🔴 Critical

Clicking a hospital should show:

```text
Hospital Name
Critical Drugs
Current Stock
Predicted Shortage
Emergency Requests
```

---

# 17. Notification Center

Create a centralized notification system.

Examples:

> 🔴 Critical stock detected

> 🟠 Drug batch expiring in 15 days

> 🚨 Cold-chain temperature exceeded

> 🚚 Shipment delayed

> 🏥 Emergency request received

> 🔄 Redistribution recommended

> 📦 Purchase order generated

Use Socket.IO architecture for real-time notifications.

---

# 18. Audit Trail

Every important action should be logged.

Example:

```text
Admin created Purchase Order #PO-1024
User: Admin
Time: 10:42 AM

Supplier accepted Purchase Order
User: ABC Pharma
Time: 11:05 AM

Shipment dispatched
Time: 2:30 PM
```

Track:

* User
* Action
* Date/time
* Entity
* Previous value
* New value

---

# 19. UI/UX Requirements

The UI should look **premium, modern, clean, and professional**.

Do NOT make it look like a basic college CRUD project.

### Design language

Use:

* Clean healthcare aesthetic
* White/light backgrounds for primary dashboards
* Deep navy/blue/teal accents
* Subtle gradients
* Rounded cards
* Soft shadows
* Modern typography
* Lucide icons
* Responsive layouts
* Professional charts

Use red/orange only for warnings and critical states.

---

# 20. Main Navigation

Create a sidebar:

```text
Overview
Inventory
Drugs & Batches
Procurement
Suppliers
Purchase Orders
Shipments
Hospitals
Stock Redistribution
Emergency Requests
AI Forecasting
Cold Chain
QR Traceability
Expiry & FEFO
Drug Recalls
Analytics
Notifications
Audit Logs
Settings
```

The sidebar should change according to the logged-in user's role.

---

# 21. Dashboard Layout

The main dashboard should contain:

```text
┌──────────────────────────────────────────┐
│ Header / Search / Notifications / User │
├──────────┬───────────────────────────────┤
│          │ KPI CARDS                     │
│ Sidebar  ├───────────────────────────────┤
│          │ Consumption / Demand Chart    │
│          ├───────────────────────────────┤
│          │ Stock Alerts / Shipments      │
│          ├───────────────────────────────┤
│          │ Shortage Map / AI Insights    │
└──────────┴───────────────────────────────┘
```

---

# 22. AI Insights Section

Every major dashboard should have an intelligent insight section.

Examples:

> 🧠 **AI Insight**

> "Insulin demand at City Hospital is predicted to increase by 23% over the next 30 days."

> "3 hospitals in this region may experience antibiotic shortages within 10 days."

> "1,250 units of Paracetamol are recommended for redistribution instead of new procurement."

This makes the system feel intelligent rather than simply data-driven.

---

# 23. Database Architecture

Create proper Mongoose models for:

```text
User
Drug
DrugBatch
Inventory
Hospital
Supplier
PurchaseOrder
Shipment
StockTransfer
EmergencyRequest
Consumption
QualityCheck
ColdChainReading
Notification
Recall
AuditLog
```

Use references between related entities.

---

# 24. API Structure

Use clean REST API architecture.

Example:

```text
/api/auth
/api/users
/api/drugs
/api/batches
/api/inventory
/api/hospitals
/api/suppliers
/api/purchase-orders
/api/shipments
/api/transfers
/api/emergency-requests
/api/forecast
/api/cold-chain
/api/recalls
/api/notifications
/api/analytics
/api/audit-logs
```

Use proper:

* GET
* POST
* PUT/PATCH
* DELETE

operations.

---

# 25. Security

Implement:

* JWT authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected routes
* Input validation
* API error handling
* Rate limiting
* Secure environment variables

Never hardcode:

* MongoDB URI
* JWT secret
* API keys
* Email credentials

Use `.env`.

---

# 26. Seed Data

Create realistic demo data so the application looks populated immediately.

Include:

* 20+ drugs
* Multiple batches
* 10+ hospitals
* 8+ suppliers
* Multiple shipments
* Consumption records
* Emergency requests
* Expiring batches
* Critical stock
* Cold-chain readings

Use realistic Indian healthcare-related names and locations.

---

# 27. Important Demo Scenario

The application must support this complete flow:

```text
Hospital detects low stock
        ↓
AI predicts future shortage
        ↓
System recommends reorder
        ↓
System checks nearby hospitals
        ↓
Excess stock found
        ↓
Redistribution recommendation generated
        ↓
Admin approves transfer
        ↓
Shipment created
        ↓
QR batch tracking
        ↓
Live shipment tracking
        ↓
Hospital receives medicine
        ↓
Inventory automatically updated
```

Also demonstrate:

```text
Cold-chain temperature rises
        ↓
IoT alert
        ↓
Admin notified
        ↓
Affected batches identified
        ↓
Quality-control action initiated
```

---

# 28. Development Approach

Build the application in a modular way.

First create:

1. Project structure
2. Authentication
3. Role-based dashboards
4. Database models
5. Inventory
6. Procurement
7. Shipments
8. AI forecasting
9. Redistribution
10. QR tracking
11. Cold-chain monitoring
12. Analytics
13. Notifications
14. Audit logs

Do not put everything into one giant component.

Use reusable components.

---

# 29. Code Quality

Follow these rules:

* Clean folder structure
* Reusable React components
* Reusable API services
* Proper error handling
* Loading states
* Empty states
* Responsive design
* Form validation
* Meaningful variable names
* Comments only where necessary
* No unnecessary duplicate code
* No hardcoded repeated UI
* Use environment variables

---

# 30. Final Requirement

The final application should look like a **real pharmaceutical supply-chain management platform**, not a simple student inventory project.

The most important differentiating features should be visually prominent:

### 🧠 AI Demand Forecasting

### 🔄 Intelligent Stock Redistribution

### 🌡️ Cold Chain Monitoring

### 📱 QR Drug Traceability

### 🚨 Emergency Drug Requests

### ⏰ Expiry + FEFO

### 🚚 Live Shipment Tracking

### 📊 Supply Chain Analytics

Make the application **demo-ready for a hackathon**, with realistic data, polished UI, working navigation, functional interactions, responsive design, and a clear end-to-end supply-chain workflow.

Start by creating the complete project structure and frontend UI. Then implement the backend APIs, database models, AI service, and integrations in a modular manner.
prompt figma ai per daal