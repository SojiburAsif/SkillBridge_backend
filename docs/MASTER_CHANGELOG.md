# MentorFlow Master System Updates & New Features Documentation

This document serves as the master tracking file for all the recent advanced feature additions, structural updates, and logic implementations inside the MentorFlow backend ecosystem.

---

## 1. System Refactoring & Restructuring

Based on our Git tracking and project reorganization:
- **Moved Core Directory**: The entire core application logic was nested into `src/app/` to cleanly separate it from the root entry point scripts (`server.ts`, `app.ts`).
- **Validation**: Introduced explicit Zod validation schemas across Endpoints (e.g. `BookingValidation.ts`, `auth.validation.ts`).
- **Error Handling**: Implemented standardized `AppError` and unified `error.ts` middleware.
- **Prisma DB Update**: Overhauled `schema.prisma`. Reset `migration` states using `--accept-data-loss` to strictly re-bind schemas in NeonDB.

---

## 2. newly Added Advanced Modules (Last 48 Hours)

The following four entirely new microservices were built from scratch and bound to the server:

### A. Wishlist System (`src/app/Module/Wishlist`)
Allows students to favourite an instructor's profile.
- **Model Added**: `Wishlist` (Joined `User` & `TutorProfile`)
- **APIs**:
  - `POST /api/wishlists/toggle`: Add or remove a preferred tutor.
  - `GET /api/wishlists/my`: Fetch the student's saved wishlist.

### B. Real-Time Chat Engine (`src/app/Module/Message`)
Native Database text-message routing between users (Supports WebSockets integration in the future).
- **Model Added**: `Message` (Joined `senderId` to `User` and `receiverId` to `User`)
- **APIs**:
  - `POST /api/messages`: Send a message securely.
  - `GET /api/messages/:userId`: Get chat history with another person and implicitly tag as `read=true`.

### C. Coupon & Promo Code Logic (`src/app/Module/Coupon`)
Complete discount application API bound dynamically to bookings/payments.
- **Model Added**: `Coupon` (Contains `maxUsage`, `usageCount`, `expireDate`)
- **APIs**:
  - `POST /api/coupons`: Admin generation of a promo code. 
  - `GET /api/coupons`: List all valid coupons.
  - `DELETE /api/coupons/:id`: Remove promo manually (Admin).
  - `POST /api/coupons/apply`: Mathematically subtracts the `discountPercentage` and checks expiration limits before returning a `finalPrice`.

### D. Automated Dashboard Analytics (`src/app/Module/Analytics`)
Aggregated calculation data for dashboards preventing Frontend calculation overload. 
- **APIs**:
  - `GET /api/analytics/admin`: Executes a Prisma `$transaction` batch fetching total user count, global revenue (via `paymentStatus: 'PAID'`), and `recentBookings`.
  - `GET /api/analytics/tutor`: Fetches a specific tutor's metrics like `totalReviews` and `averageRating`.

---

## 3. Booking Engine Enhancements (`src/app/Module/Booking`)

The booking architecture was heavily extended, focusing on security, payments, and background lifecycle locks:
- **Video Logic (Jitsi)**: Dynamically binds a generated `videoCallId` directly to the `Booking` mapping upon checkout.
- **SSLCommerz Payment Integration**: Native webhook controllers added (`/payment/success`, `/payment/fail`, `/payment/cancel`, and `/payment/ipn`) to verify transactions on the server and update `PaymentStatus: PAID` directly.
- **Time Categorization API (`/my/bookings/categorized`)**: Added a highly requested `categorized` Endpoint which uses the current server time (`new Date().getTime()`) to split arrays mathematically into `Upcoming`, `Live` (if within a 1-hour active range), and `Past`.
- **Node-Cron Sweeper (`booking.cron.ts`)**: Background job running every continuously sweeping for `AWAITING_PAYMENT` slots. If 10 minutes pass untouched, it purges the DB to release the `TutorSlot.isBooked` flag.

---

## 4. Advanced Review System (`src/app/Module/Review`)

Entirely rebuilt utilizing automated atomic calculations to establish integrity.
- **Logic Rule (Validation)**: A review can internally *only* be created against a `Booking` where `status === "COMPLETED"`.
- **Atomic Roll-Up**: Whenever a student leaves a Review, the backend triggers a `prisma.$transaction`. It runs `aggregate._avg` on the rating array and pushes it explicitly onto the `TutorProfile.rating` integer. This eliminates manual DB querying on the frontend side.

---

## 5. Security & Authentication Additions (`src/app/Module/auth`)

Upgraded the baseline `better-auth` configurations to natively support manual data insertions alongside external provider links.
- **CORS Upgrades (`app.ts`)**: Modified local routing permissions to accept `"null"` origin connections specifically to safely utilize Postman environments.
- **`logout` Implementation**: Explicit Express endpoint wiping active cookies (`accessToken`, `refreshToken`, `better-auth.session_token`) completely.
- **Unified Registration**: `/api/auth/register` natively executes two queries at once safely creating `User` -> Rollback Error Bound -> Creates `TutorProfile` or `StudentProfile` cleanly.

> For Endpoint configurations, payloads, and parameter tracking - please check the specific files: `AUTH_DOCS.md`, `NEW_FEATURES_DOCS.md`, `BOOKING_WORKFLOW.md`, `REVIEW_WORKFLOW.md` inside this `/docs` folder.