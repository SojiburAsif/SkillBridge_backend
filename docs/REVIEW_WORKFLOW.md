# MentorFlow Review & Rating System Configuration

A detailed overview of the Advanced Review & Rating engine, covering schema modifications, strict validation rules, role-based access, and automatic aggregation logic in the MentorFlow platform.

---

## 1. Database Schema Updates (Prisma)

To support a professional rating system, the following adjustments were made to the database:

* **`Review` Model:**
  * `isVerified: Boolean` (Defaults to `true` since we only allow reviews on completed sessions).
  * Automatically links to the unique `bookingId`, the `studentId` (giver), and the `tutorId` (receiver).
* **`TutorProfile` Model:**
  * Added `totalReviews: Int @default(0)` to track the volume of reviews.
  * Uses the existing `rating: Float` to store the auto-calculated average rating.

---

## 2. Core Logic & Restrictions

The Review system strictly enforces the following rules at the service level to prevent spam and ensure authenticity:

1. **Completion Check:** 
   A student can **only** post a review if the connected `Booking` has a status of `COMPLETED`. If the session is pending, canceled, or rescheduled, the API actively throws an error.
2. **True Ownership:** 
   The system verifies the logged-in user is actually the `studentId` attached to the specific booking.
3. **One-Time Review Limit:** 
   A unique constraint ensures a student can only submit exactly **one review per booking ID**. Subsequent attempts trigger an error.
4. **Atomic Auto-Aggregation:** 
   When a review is successfully created (*or deleted by an Admin*), a background Prisma `$transaction` executes. It instantly mathematically aggregates the `_avg` and `_count` of all reviews for that specific Tutor and updates their `TutorProfile.rating` and `TutorProfile.totalReviews` fields natively.
5. **Zod Validation:** 
   Hard validation ensuring the `rating` is fundamentally between `1` and `5`, and the `comment` is at least 5 characters.

---

## 3. Automated Notification Triggers

**Post-Session Reminder:**
Inside `booking.service.ts`, the exact moment a session's `bookingStatus` is formally updated to `COMPLETED` (usually by a Tutor), a real-time Notification is sent to the Student:  
> *"Session Completed - Please Review! How was your session? Please leave a review for [Tutor Name]!"*

---

## 4. Role Access Controls & Capabilities

### 🧑‍🎓 Student Capabilities
* **Create a Review:** Target a `bookingId` post-session.
* **Dashboard View:** Can pull a list of all reviews they have *ever given* across the platform using the `/student/me` endpoint.

### 🧑‍🏫 Tutor Capabilities
* **Dashboard View:** Can seamlessly pull and view all reviews received from students.
* **Restriction:** Tutors cannot edit or delete reviews left by students to maintain platform integrity.

### 👮 Admin Capabilities
* **Global View:** Can pull all reviews active in the system.
* **Review Deletion:** Admins have the power to forcibly `DELETE` inappropriate reviews. When an Admin runs this process, the backend automatically recalculates the Tutor's average rating and total counts dynamically without the problematic review.

---

## 5. API Endpoints Map

| Endpoint Route                                        | Method | Auth Role | Purpose |
|-------------------------------------------------------|--------|-------------|-------|
| `/api/reviews`                                        | POST   | Student | Submits new review & auto-calculates ratings |
| `/api/reviews/student/me`                             | GET    | Student | Fetches all reviews authored by the logged-in student |
| `/api/reviews/tutor/:tutorId`                         | GET    | Tutor/Student/Admin | Fetches all reviews for a specific tutor (Use `:tutorId = 'me'` for current Tutor) |
| `/api/reviews`                                        | GET    | Any      | Fetches aggregate system-wide reviews |
| `/api/reviews/booking/:bookingId`                     | GET    | Auth User | Grabs the specific review attached to a Booking |
| `/api/reviews/:reviewId`                              | DELETE | Admin   | Deletes an inappropriate review & resets Tutor average |
