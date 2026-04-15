# MentorFlow Booking & Payment Configuration

A comprehensive overview of the Booking & TutorSlot processing engine, payment webhooks, notification routing, and access controls in the MentorFlow platform.

---

## 1. Automated Background Processing (Cron)

To prevent locking tutor slots by students who begin a checkout process but never pay, a background process runs periodically checking the database state.

### Task 1: Unpaid Booking Timeout
* **Interval:** Every 10 Minutes.
* **Condition:** Any Booking stuck with status: AWAITING_PAYMENT & paymentStatus: PENDING where createdAt is **older than 60 minutes**.
* **Auto-Action:**
  1. The DB reverts the connected TutorSlot.isBooked configuration back to alse (slot opens up for other students).
  2. The Booking record is modified to:
     - status: CANCELLED
     - paymentStatus: FAILED

### Task 2: The 20-Minute Alert Notification
* **Interval:** Every 1 Minute.
* **Condition:** Finds PAID bookings where the assigned dateTime is exactly **20 minutes away**.
* **Auto-Action:** Sends a real-time notification to **both** the Student and Tutor reminding them of the session, including the Jitsi ideoCallId room access.

---

## 2. Booking State Transitions (Happy Path)

The complete lifecycle for booking a tutor:

1. **Student Books Slot (POST /api/bookings)**: 
   * BookingStatus = AWAITING_PAYMENT
   * PaymentStatus = PENDING
   * TutorSlot.isBooked = 	rue *(Locks slot temporarily)*.
   * System initiates the SSL Gateway API, generating a paymentUrl.
   
2. **Student Completes Payment (SSL Webhook POST /api/bookings/payment/success/:tranId)**: 
   * BookingStatus = PENDING_CONFIRMATION
   * PaymentStatus = PAID
   * **Jitsi Meet Generation:** A unique ideoCallId is created and instantiated in the DB.
   * **Notification Generated**: Sent to Tutor (New Booking Paid + ideoCallId included).
   
3. **Mutual Confirmation Phase (PATCH /api/bookings/:bookingId/mutual-confirm)**:
   * System enforces that paymentStatus *must be PAID* before mutual consent triggers.
   * Tutor & Student both hit the endpoint. The Booking.mutualConfirmation JSON field captures each payload.
   * When both fields are 	rue, the status changes to CONFIRMED.
   
4. **Session Completed (PATCH /api/bookings/status/:bookingId)**:
   * The Tutor updates the final session status to COMPLETED.

---

## 3. Role Access Controls & Notification Matrix

### Student Capabilities & Triggers
* **Abilities**:
  * Execute a new slot purchase reservation.
  * Trigger mutual confirmation consent.
  * Flag booking as ATTENDED or CANCELLED.
    * **The 1-Hour Lock:** Students *cannot* cancel a booking if the start dateTime is less than 60 minutes away.
    * *Financial Action:* If a student validly cancels a PAID session, paymentStatus sets to REFUND_REQUESTED and Admin is proactively notified.
* **Notifications Checked**:
  * **20-Minute Upcoming Session Alert**
  * **Status Update Alert**: e.g., "Your booking was marked as COMPLETED by your tutor."

### Tutor Capabilities & Triggers
* **Abilities**:
  * **Tutor Privilege:** Can CANCEL or RESCHEDULE at *any time* (bypassing the 1-hour student lock restriction).
  * Trigger mutual confirmation indicating they are online/prepped for session.
  * Process manual updates to general statuses: CONFIRMED, COMPLETED, or RESCHEDULED.
    * *Special Guard:* Cannot trigger CONFIRMED natively if paymentStatus is not equivalent to PAID.
* **Notifications Checked**:
  * **20-Minute Upcoming Session Alert**
  * **Monetary Success**: Alerts tutor that Student processed payment along with Room metadata.

### Admin Capabilities & Triggers
* **Abilities**:
  * Direct execution of status or payment database shifts bypassing standard application state pipelines.
  * Resolving financial refunds using processRefund which sets state to REFUNDED.
* **Notifications Checked**:
  * **Refund Arbitration**: Handled instantly if student cancels post-transaction.

---

## 4. API Endpoints Map

| Endpoint Route                                        | Method | Handled By | Purpose |
|-------------------------------------------------------|--------|-------------|-------|
| /api/bookings                                       | POST   | Student | Starts SSLCommerz Session |
| /api/bookings/payment/success/:tranId               | POST   | System | Mark Payment PAID & Gen VideoRoom |
| /api/bookings/payment/fail/:tranId                  | POST   | System | Flag Payment FAILED |
| /api/bookings/payment/cancel/:tranId                | POST   | System | Unbook / Free Slot |
| /api/bookings/payment/ipn                           | POST   | System | Gateway DB Syncer |
| /api/bookings/:bookingId/mutual-confirm             | PATCH  | Student/Tutor| Approves Jitsi Video Auth |
| /api/bookings/refund/:bookingId                     | POST   | Admin | Formal Refund Release |
| /api/bookings/change-status/:bookingId              | PATCH  | Context Mod | Toggles BookingStatus |
