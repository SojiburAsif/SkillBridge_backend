# MentorFlow Backend - New Features API Documentation
This document outlines the APIs for the 4 newly added features (Wishlist, Messages, Coupons, and Analytics). You can use this guide to easily test the endpoints in **Postman**.

**Base URL**: `http://localhost:8000/api`
**Authorization**: Most endpoints require a Bearer token in the Headers:
`Authorization: Bearer <your_access_token>`

---

## 1. Wishlist System (Student only)

### ✨ Toggle Wishlist (Add/Remove Tutor)
- **Method**: `POST`
- **Endpoint**: `/api/wishlists/toggle`
- **Headers**: Authorization (Student)
- **Body (JSON)**:
```json
{
  "tutorProfileId": "uuid-here"
}
```

### ✨ Get My Wishlist
- **Method**: `GET`
- **Endpoint**: `/api/wishlists/my`
- **Headers**: Authorization (Student)

---

## 2. Real-Time Chat / Messages (Any Authenticated User)

### ✨ Send Message
- **Method**: `POST`
- **Endpoint**: `/api/messages`
- **Headers**: Authorization (Any user)
- **Body (JSON)**:
```json
{
  "receiverId": "uuid-here",
  "text": "Hello, I want to learn React from you!"
}
```

### ✨ Get Conversation (History with specific user)
- **Method**: `GET`
- **Endpoint**: `/api/messages/:userId` (Replace `:userId` with the person you are chatting with)
- **Headers**: Authorization (Any user)
- **Note**: Fetching this endpoint will automatically mark all pending messages from that user as `read = true`.

---

## 3. Coupon & Discount System

### ✨ Create Coupon (Admin only)
- **Method**: `POST`
- **Endpoint**: `/api/coupons`
- **Headers**: Authorization (Admin)
- **Body (JSON)**:
```json
{
  "code": "WINTER20",
  "discountPercentage": 20,
  "maxUsage": 100,
  "expireDate": "2026-12-31T23:59:59Z"
}
```

### ✨ Get All Coupons (Admin only)
- **Method**: `GET`
- **Endpoint**: `/api/coupons`
- **Headers**: Authorization (Admin)

### ✨ Delete Coupon (Admin only)
- **Method**: `DELETE`
- **Endpoint**: `/api/coupons/:id`

### ✨ Apply Coupon (Student / User)
- **Method**: `POST`
- **Endpoint**: `/api/coupons/apply`
- **Headers**: Authorization (Student)
- **Body (JSON)**:
```json
{
  "code": "WINTER20",
  "originalPrice": 1500
}
```
- **Response**: Returns the requested `originalPrice`, `discountAmount`, and `finalPrice` calculated on the server. If max usage or time limit has passed, it throws a 400 Validation Error.

---

## 4. Dashboard Analytics

### ✨ Get Admin Dashboard Stats (Admin only)
- **Method**: `GET`
- **Endpoint**: `/api/analytics/admin`
- **Headers**: Authorization (Admin)
- **Description**: Returns consolidated data for `totalUsers`, `totalTutors`, `totalBookings`, `totalRevenue`, and `recentBookings`.

### ✨ Get Tutor Dashboard Stats (Tutor only)
- **Method**: `GET`
- **Endpoint**: `/api/analytics/tutor`
- **Headers**: Authorization (Tutor)
- **Description**: Returns specific metrics for the requested tutor (e.g., `totalReviews`, `averageRating`).

---

## 5. Booking Categorization (Upcoming, Live, Past)

### ✨ Get Categorized Bookings (Student or Tutor)
- **Method**: `GET`
- **Endpoint**: `/api/my/bookings/categorized`
- **Headers**: Authorization (Student OR Tutor)
- **Description**: Dynamically calculates the separation of all bookings associated with the current user into exactly three distinct arrays: `upcoming`, `live`, and `past` using real-time validation limits on server timestamp bounds (Assuming typical 1h durations, minus fully CANCELED scopes).
