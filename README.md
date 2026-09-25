# Cooperative Service Marketplace – Worker App

A dedicated mobile web interface for cooperative workers and technicians, integrated directly into the **Cooperative Service Marketplace** ecosystem. Built specifically for member-artisans to manage verification, live dispatch availability, incoming customer requests, emergency SOS dispatches, active jobs, and transparent cooperative earnings.

---

## 🌟 Key Modules & Features

### PART 1: Worker Registration, Verification, Login & Dashboard
- **Worker Registration**: Full personal profile, 7 skill categories (*Plumbing, Electrical, Carpentry, Painting, Cleaning, Appliance Repair, Other Services*), trade experience brackets, service area sectors, and Government ID/Trade certificate upload dropzone.
- **Verification Lifecycle**: Interactive 3-state switcher demonstrating:
  1. **Application Under Review**: 4-step progress tracker and expected turnaround.
  2. **Approved**: "Your account has been approved" banner, Co-op Digital Member ID Card (`#402`), and "Create Login" trigger.
  3. **Rejected**: Reason feedback and "Update & Resubmit" trigger.
- **Worker Login**: Credentials with show/hide password, 1-tap demo auto-fill profiles (*Ramesh Kumar #402*, *Suresh Patil #315*, *Vikram Sen #108*), and forgot password OTP modal.
- **Master Availability Toggle ("AVAILABLE FOR JOBS")**:
  - **When ON**: `ONLINE • Receiving Customer Requests` with a pulsing green radar ring; receives live requests.
  - **When OFF**: `OFFLINE • Request Receiving Paused` with an alert banner; new customer dispatches are blocked.
- **Today's Earnings**: Summary card displaying daily earnings, jobs completed, patronage bonus share, and cooperative **0% platform commission** guarantee.

---

### PART 2: Worker Job Requests & Connected Marketplace Engine
The Customer App and Worker App are **bidirectionally connected** in real time via a shared `BroadcastChannel` and persistent `localStorage` synchronization using **identical Booking IDs**.

#### 1. Worker Jobs Screen (`Jobs` Tab)
- **Active Dispatch Filter Indicator**:
  - Worker Skill: `🔧 Plumbing`
  - Status: `● Online (Available)`
  - Sector: `📍 Indiranagar & Domlur`
- **Filter Pills**:
  - `All Available`
  - `⚡ Instant`
  - `📅 Pre-Booking`
  - `🚨 Emergency`
  - `✓ Assigned`
- **Job Cards**:
  - Service type
  - Customer location
  - Distance
  - Problem description
  - Request type badge (`INSTANT` | `PRE-BOOKING` | `EMERGENCY`)
  - Requested time / scheduled date & time
  - **Identical Booking ID** (e.g., `CP-9104`, `CP-9208`, `SOS-5501`)
  - Action buttons: `ACCEPT` / `ACCEPT JOB` / `ACCEPT EMERGENCY JOB` and `REJECT`

---

#### 2. Specific Job Request Flows

##### A. Instant Request Flow
1. **Customer Action**: Customer books an instant service ("Need a worker now").
2. **Worker Alert**: Worker receives the **"New Instant Job"** alert card / modal:
   - Service: *Plumbing Leakage & Pipe Repair*
   - Customer location: *Indiranagar 100ft Rd, Bengaluru*
   - Distance: *1.2 km away*
   - Problem: *Tap & Mixer Leak • High pressure joint failure*
   - Request time: *Just Now*
   - Booking ID: *#CP-9104*
   - Buttons: `ACCEPT JOB` and `REJECT`
3. **Synchronization on Accept**:
   - **Worker side changes to**: **`Job Assigned`** (status turns to *Job Assigned • En Route*, GPS navigation button active).
   - **Customer side changes to**: **`Worker Assigned`** (displays technician Ramesh Kumar Co-op #402 assigned, ETA 12 mins).

##### B. Pre-Booking Flow
1. **Customer Action**: Customer creates a future booking (e.g., Tomorrow, 11:30 AM – 01:30 PM).
2. **Worker Alert**: Worker receives the **"New Pre-Booking"** alert card / modal:
   - Service: *Pipe Leakage & Joint Sealing*
   - Customer location: *Indiranagar 100ft Rd, Bengaluru*
   - Scheduled date: *Tomorrow (24 Sep)*
   - Scheduled time: *11:30 AM – 01:30 PM*
   - Problem: *Concealed pipe joint seepage in bathroom wall*
   - Booking ID: *#CP-9208*
   - Buttons: `ACCEPT` and `REJECT`
3. **Synchronization on Accept**:
   - **Worker side changes to**: **`Booking Accepted`** (scheduled on cooperative calendar).
   - **Customer side changes to**: **`Booking Reserved`** (booking card in customer app displays *"✓ Booking Reserved • Ramesh Kumar Assigned"*).

##### C. Emergency SOS Request Flow
1. **Customer Action**: Customer requests SOS emergency service.
2. **Worker Alert**: Worker receives the high-priority **"EMERGENCY JOB REQUEST"** alert card / modal:
   - Emergency service: *Major Pipe Burst / Ceilings Flood*
   - Customer location: *Indiranagar 100ft Rd, Bengaluru*
   - Distance: *1.1 km away*
   - Estimated travel distance: *1.1 km (8–12 mins drive)*
   - Problem: *Main pipe connection fractured, flooding kitchen floor rapidly*
   - Booking ID: *#SOS-5501*
   - Buttons: `ACCEPT EMERGENCY JOB` and `REJECT`
3. **Synchronization on Accept**:
   - **Worker side changes to**: **`Emergency Worker Assigned / En Route`** (siren navigation route active).
   - **Customer side changes to**: **`Emergency Worker Assigned`** (rapid dispatch status active).

---

## 🧪 Testing & Verification Guide

### Option 1: Dual-Tab Live Cross-App Test (Recommended)
1. Open `customer/index.html` in Tab 1.
2. Open `worker/index.html` in Tab 2.
3. In Tab 1 (Customer App):
   - Choose **Plumbing** &rarr; select problem &rarr; click **Instant Service**.
   - Tab 2 (Worker App) immediately receives: **"New Instant Job"** popup with the exact same Booking ID.
   - In Tab 2, click **ACCEPT JOB**:
     - Worker app updates to: **`Job Assigned`**.
     - Customer app in Tab 1 updates to: **`Worker Assigned`**!
4. In Tab 1 (Customer App):
   - Select **Pre-Booking** &rarr; pick date & time &rarr; click **Confirm Pre-Booking**.
   - Tab 2 (Worker App) receives: **"New Pre-Booking"** popup.
   - Click **ACCEPT**:
     - Worker app updates to: **`Booking Accepted`**.
     - Customer app updates to: **`Booking Reserved`**!
5. In Tab 1 (Customer App):
   - Click the red **Emergency SOS** banner &rarr; click **Find Nearby Worker**.
   - Tab 2 (Worker App) receives: **"EMERGENCY JOB REQUEST"** with siren indicator.
   - Click **ACCEPT EMERGENCY JOB**:
     - Customer app updates to: **`Emergency Worker Assigned`**!

### Option 2: 1-Click Simulator Toolbar (Inside Worker App)
At the top of the Worker App, use the **Customer App Connected Simulator**:
- Click `⚡ Instant` &rarr; triggers Instant Request.
- Click `📅 Pre-Book` &rarr; triggers Pre-Booking Request.
- Click `🚨 Emergency` &rarr; triggers Emergency Request.
- Test `ACCEPT` and `REJECT` directly on each card or popup modal.

### Option 3: Matching Engine Filter Test
- Turn **"AVAILABLE FOR JOBS"** switch **OFF**.
- Send an Instant or Emergency request from Customer App.
- Verify the Worker App does not accept incoming dispatches while offline.

---

### PART 3: Worker Job Details & Customer Location (Real-Time Synchronized)

After accepting a job, the Worker App immediately transitions to the **Job Details** screen, directly wired to the Customer App.

#### 1. Job Details Screen (`#screen-job-details`)
- **Customer Name**: `P. Vishnu Vardhan`
- **Service**: `Plumbing Leakage & Pipe Repair`
- **Problem Description**: `Tap & Mixer Leak • High pressure joint failure under main washbasin.`
- **Customer Location**: `Indiranagar 100ft Rd, Bengaluru`
- **Distance**: `1.2 km away`
- **Booking ID**: `#CP-9104` (identical to customer booking)
- **Request Type**: `INSTANT`, `PRE-BOOKING`, or `EMERGENCY`
- **Booking Status**: Initially displays **"JOB ASSIGNED"**
- **Action Buttons**:
  - `VIEW LOCATION`: Opens the Customer Location & Distance modal.
  - `NAVIGATE`: Opens turn-by-turn GPS navigation instructions.
  - `CONTACT CUSTOMER`: Direct phone call trigger to customer (`+91 98480 22338`).

#### 2. Customer Location View (`#modal-customer-location`)
Accessible via the `VIEW LOCATION` button:
- **Worker Current Location**: `CMH Road Co-op Depot, Indiranagar`
- **Customer Location**: `Indiranagar 100ft Rd, Bengaluru`
- **Distance**: `1.2 km`
- **Estimated Travel Time**: `12 mins`
- **Interactive Route Map**: Visual road map layout showing worker pin at depot, animated route path, and customer destination pin.
- **Navigation Button**: `START GPS NAVIGATION` button transitioning to live turn-by-turn guidance.

#### 3. Job Status Progression ("On the Way")
- Worker clicks: **"On the Way"**
- Worker App status updates to: `"On the Way"`
- **Customer App immediately reflects**:
  - Status: **"Worker is on the way"**
  - Worker Name: `Ramesh Kumar`
  - Worker Location: `En route from CMH Road (0.8 km away)`
  - Estimated Arrival: `8 - 10 mins`

#### 4. Doorstep Arrival ("I HAVE ARRIVED")
- Worker clicks: **"I HAVE ARRIVED"**
- **Customer App displays**:
  - Status: **"Worker has arrived. Verify Worker."**
  - Prominent verification card: *"Technician is at your doorstep. Please share this secure arrival code: **Verification OTP: 4092**"*.

---

### PART 4: OTP Verification, Problem Inspection & Cooperative Estimate

A fully synchronized doorstep lifecycle directly connecting Customer and Worker applications with real-time updates over `BroadcastChannel` and `localStorage`.

#### 1. OTP Verification
- **Worker App**:
  - Displays: **"Customer Verification"**
  - Inputs: Enter OTP (`4092`)
  - Buttons: `Verify OTP` and `Auto 4092`
- **Customer App**:
  - Displays: **"Verify Worker Arrival"**
  - Customer provides 4-digit code: **`4092`**
- **After Successful Verification**:
  - **WORKER**: Displays **`"Customer Verified"`** (with green verified badge & doorstep arrival confirmation).
  - **CUSTOMER**: Displays **`"Worker Verified"`** (banner updates with *"Identity verified with OTP 4092 • Technician is inspecting the problem"*).

#### 2. Service Inspection
- **Worker App**:
  - Displays: **"Inspect Customer Problem"**
  - Form Fields:
    - **Problem identified**: e.g., *"Main ceramic disc cartridge cracked & pipe nipple corroded"*
    - **Materials required**: e.g., *"Ceramic cartridge replacement + Teflon seal pack"* with price input `₹280`
    - **Labour requirement**: e.g., *"Precision plumbing disassembly, valve reseat & pressure test"* with price input `₹199`
    - **Additional notes**: e.g., *"Includes 90-day cooperative workmanship warranty & high pressure testing."*
  - Button: **`CREATE ESTIMATE`**

#### 3. Estimate Creation & Dispatch
- **Worker App**:
  - Shows Itemized Breakdown:
    - **Materials**: `₹280.00`
    - **Labour**: `₹199.00`
    - **Total**: `₹479.00` (with 0% platform commission notice)
  - Button: **`SEND ESTIMATE`**
- **After Sending**:
  - **WORKER**: Displays **`"Waiting for Customer Approval"`** (with pulsing radar & sent estimate summary).
  - **CUSTOMER**: Receives **`"Estimate Received"`** popup drawer & card preview with the exact same items, breakdown (`Materials: ₹280.00`, `Labour: ₹199.00`, `Total: ₹479.00`), and problem details.

#### 4. Customer Accepts Branch
- **Customer Action**: Customer presses **`"ACCEPT & START WORK"`**
- **Worker View**: Displays **`"Estimate Accepted"`**
  - Shows total authorized: `₹479.00`
  - Button: **`START WORK`**
- **Worker presses `START WORK`**:
  - **Worker View**: Switches to **`"Work Started • Repair In Progress"`** with completion checklist & `Complete Job & Collect ₹479.00` button.
  - **Customer View**: Switches to **`"Work Started"`** with active progress indicator.

#### 5. Customer Rejects Branch
- **Customer Action**: Customer selects **`"REJECT / PAY VISIT FEE"`**
- **Worker View**: Displays **`"Estimate Rejected"`**
  - Shows **Visit / Inspection Fee Status**:
    - **Standard Diagnostic Fee**: `₹149.00 Fixed`
    - **Status**: `Settled via Customer Digital Payment`
  - Button: `Complete Visit & Credit ₹149.00`
- **Customer Action**: Completes digital payment of the `₹149.00` visit fee via UPI (GPay/PhonePe/Paytm) or Card in the payment modal.
- Both apps settle the callout cleanly according to cooperative bylaws.

---

### PART 5: Work Progress and Completion (Real-Time Synchronized)

A completely unified progress tracking and payment completion flow ensuring both Customer and Worker maintain synchronized real-time job state, with strict enforcement that the job is never marked fully closed until customer payment is confirmed.

#### 1. Work in Progress
- **Worker Screen ("WORK IN PROGRESS")**:
  - **Customer**: `P. Vishnu Vardhan`
  - **Service**: `Plumbing Leakage & Pipe Repair`
  - **Problem**: `Main ceramic disc cartridge cracked & pipe nipple corroded`
  - **Materials**: `Ceramic cartridge replacement + Teflon seal pack`
  - **Estimated Amount**: `₹479.00`
  - **Start Time**: Dynamic clock timestamp (e.g. `11:22 AM`)
  - **Button**: `MARK WORK COMPLETED`
- **Customer Screen ("Work in Progress")**:
  - **Worker**: `Ramesh Kumar (Co-op #402)`
  - **Service**: `Plumbing Leakage & Pipe Repair`
  - **Work Status**: `Work in Progress • Active Doorstep Repair`
  - **Estimated Amount**: `₹479.00`

#### 2. Complete Work & Pre-Completion Review
- Worker clicks: **"MARK WORK COMPLETED"**
- Worker App displays pre-completion confirmation screen:
  - **Work Completed Confirmation Notice**: *"Technician verification that all plumbing tasks, valve reseating, and pressure tests have concluded successfully."*
  - **Materials Used**: `Ceramic cartridge replacement + Teflon seal pack`
  - **Final Amount**: `₹479.00`
  - **Button**: **`COMPLETE JOB`** (with `Back / Edit` option)

#### 3. Customer Side (Work Completed & Payment Settlement)
- Once worker clicks **"COMPLETE JOB"**, Customer App immediately displays:
  - **Status**: **`"Work Completed"`**
  - **Service**: `Plumbing Leakage & Pipe Repair`
  - **Worker**: `Ramesh Kumar (Co-op #402)`
  - **Final Amount**: `₹479.00`
  - **Payment Required Notice**: *"Please settle the authorized amount to release payment to the cooperative artisan."*
  - **Button**: **`PROCEED TO PAYMENT`**
- Customer opens payment drawer and selects method (UPI - GPay / PhonePe / Paytm, Wallet, or Debit/Credit Card).
- Customer clicks **`PAY ₹479.00 NOW`**:
  - Broadcasts `PAYMENT_COMPLETED` event.
  - Customer status switches to: **`"Payment Completed • Job Closed"`** with 30-day warranty card.

#### 4. Worker Side (Payment Hold & Final Job Closure)
- **Strict Constraint**: Worker does NOT mark the job as fully closed until payment is successful.
- Worker view displays: **`"Waiting for Customer Payment"`**
  - Displays pending balance: `₹479.00`
  - Waiting spinner and real-time payment listener active.
  - Simulator button provided for standalone testing (`Simulate Customer Pay ₹479.00`).
- **Upon Successful Payment**:
  - Worker view transitions to: **`"Payment Received • Job Closed"`**
  - Earnings updated: `₹479.00 credited to today's earnings`
  - Completed jobs count incremented.
  - Button to safely return to worker dashboard.



