# MentorFlow Backend - Authentication API Documentation

This document outlines the Custom Authentication APIs implemented through the MentorFlow Backend. Use these specifications to update your frontend connection and logic.

**Base URL**: `http://localhost:5000/api`
**Authorization**: Protected endpoints require a Bearer token in the Headers `Authorization: Bearer <AccessToken>` or HTTP-only cookies injected naturally via responses.

---

## 1. User Registration (Student & Tutor)

### ✨ Custom Register (`/api/auth/register`)
Handles fully transactional registration mapping native `better-auth` users alongside Postgres `StudentProfile` and `TutorProfile` relations automatically.  

- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Headers**: None
- **Body (JSON)**:

**Common Fields (Required for both roles):**
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "securepassword",
  "role": "STUDENT", // "STUDENT" or "TUTOR"
  "phone": "01700000000", // Optional (Auto converted to +8801...)
  "imgUrl": "https://url.to/image.png" // Optional
}
```

**Additional Payload if `role === "STUDENT"` (Optional fields):**
```json
{
  "grade": "12th",
  "institution": "Dhaka College",
  "gender": "MALE",
  "interests": "Math, Physics"
}
```

**Additional Payload if `role === "TUTOR"` (Optional fields):**
```json
{
  "bio": "Expert in Mathematics",
  "price": 1000,
  "experience": "5 Years",
  "categoryId": "c47c7c00-60b6-4530-9b49-9f79b0bfed05", // UUID of the Category
  "gender": "MALE",
  "institution": "Dhaka University"
}
```

- **Response (201 Created)**:
  Returns newly generated custom `accessToken` & `refreshToken` alongside `better-auth` session configurations.

---

## 2. User Login

### ✨ Sign In With Email (`/api/auth/sign-in/email`)
- **Method**: `POST`
- **Endpoint**: `/api/auth/sign-in/email`
- **Headers**: None
- **Body (JSON)**:
```json
{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```
- **Response (200 OK)**:
  Responds with standard user payload, `accessToken`, `refreshToken`. Express automatically injects `Set-Cookie` into the client browser.

---

## 3. User Logout

### ✨ Log Out User (`/api/auth/logout`)
- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Headers**: Authorization (Bearer Token / Cookie)
- **Body**: None
- **Response (200 OK)**:
  Clears HTTP-only cookies (`accessToken`, `refreshToken`, `better-auth.session_token`) securely and kills the Better-Auth session backend.

---

## 4. Password Management

### ✨ Change Password (`/api/auth/change-password`)
- **Method**: `POST`
- **Endpoint**: `/api/auth/change-password`
- **Headers**: Authorization (Bearer Token Required)
- **Body (JSON)**:
```json
{
  "oldPassword": "securepassword",
  "newPassword": "newsecurepassword123",
  "revokeOtherSessions": true // (Optional: Default true. Revokes all current sessions requiring user to log in again).
}
```

---

## 5. Current Profile Fetch & Update

### ✨ Get My Profile
- **Method**: `GET`
- **Endpoint**: `/api/my-profile`
- **Headers**: Authorization (Bearer Token Required - Any User)
- **Description**: Retrieves the currently authenticated user's data (combining both generic fields and embedded custom fields like `tutorProfile` or `studentProfile`).

### ✨ Update My Profile
- **Method**: `PATCH`
- **Endpoint**: `/api/my-profile`
- **Headers**: Authorization (Bearer Token Required - Any User)
- **Body (JSON)**:
```json
{
  "name": "Updated John Doe",
  "phone": "+8801700000000",
  "bio": "New Bio Text", // (Tutor specific update mapped automatically)
  "price": 1500 // (Tutor specific update mapped automatically)
}
```