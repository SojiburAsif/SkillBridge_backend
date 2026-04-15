# 🚀 MentorFlow Backend - Full Project & Setup Guide

এই ডকুমেন্টেশনে আপনার প্রজেক্টের সমস্ত আপডেট, নতুন ফিচার এবং কীভাবে এপিআই-গুলো টেস্ট করবেন তার বিস্তারিত গাইড দেওয়া হলো। 

---

## 🛠️ ১. প্রজেক্ট কীভাবে রান করবেন (How to Run)
যেহেতু আপনি লোকাল এনভায়রনমেন্টে টেস্ট করবেন, প্রথমে টার্মিনালে নিচের কমান্ডটি দিন:

```bash
# ডেভেলপমেন্ট সার্ভার চালু করতে
npm run dev
```
> **নোট:** আপনার `.env` ফাইলে অবশ্যই `DATABASE_URL`, `APP_URL`, `GOOGLE_CLIENT_ID` এবং `GOOGLE_CLIENT_SECRET` থাকতে হবে।

---

## 📜 ২. Swagger API Documentation (Visual Interface)
আপনার প্রজেক্টে **Swagger** সেটআপ করা হয়েছে। আপনি ব্রাউজার থেকে খুব সহজেই সমস্ত API দেখতে এবং টেস্ট করতে পারবেন।
সার্ভার চালু করার পর ব্রাউজারে যান:
👉 **URL:** [http://localhost:8000/api-docs](http://localhost:8000/api-docs) 

*(পোর্ট আপনার .env ফাইলের PORT অনুযায়ী হবে, ডিফল্ট 8000)*

---

## 🔑 ৩. Authentication & Users (better-auth)
Better-Auth এখন আপনার ডাটাবেস এবং সেশনের সাথে পুরোপুরি সিংঙ্কড (Synced)। 

### কাস্টম রেজিস্ট্রেশন (Custom Register + Auto Login + Profile Creation):
**Endpoint:** `POST /api/auth-custom/custom-register`
- **কাজ:** এই এপিআই-তে রিকোয়েস্ট পাঠালে ইউজার তো ক্রিয়েট হবেই, সাথে সাথে তার `role` অনুযায়ী `TutorProfile` অথবা `StudentProfile` অটোমেটিক তৈরি হয়ে যাবে (Prisma Transaction দিয়ে)। 
- **Auto Login:** একাউন্ট তৈরি হওয়ার সাথে সাথেই সিস্টেমে লগইন হয়ে যাবে এবং Respnose-এ একটি Session Token (HttpOnly Cookie) সেট হয়ে যাবে।

**📝 Example Payload:**
```json
{
  "name": "Rahim Tutor",
  "email": "rahim@tutor.com",
  "password": "password123",
  "phone": "01700000000",
  "role": "TUTOR" 
}
```

### গুগল লগইন (Google Login):
**Endpoint:** `POST /api/auth/sign-in/social` (Standard better-auth system API)
- ফ্রন্টএন্ড থেকে better-auth এর ক্লায়েন্ট প্যাকজে কল করতে হবে `signIn.social({ provider: 'google' })`। 
- **অটো প্রোফাইল:** গুগল দিয়ে একাউন্ট তৈরি হলেও ব্যাকএন্ড ডাটাবেস হুকের মাধ্যমে অটোমেটিক `StudentProfile` তৈরি করে নেবে। পরে ইউজার তার ফোন নাম্বার এবং ছবি আপডেট করে নিতে পারবে।

### পাসওয়ার্ড পরিবর্তন (Change Password):
**Endpoint:** `POST /api/auth-custom/change-password`
**📝 Example Payload:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword123"
}
```

---

## 👤 ৪. Profile Update & Management 
যেহেতু রেজিস্ট্রেশন এবং গুগলের মাধ্যমে অ্যাকাউন্টের সাথে কিছু ফিল্ড অপশনাল থাকে, তাই লগইন করার পর ইউজার তার প্রোফাইল আপডেট করতে পারবে।

### টিউটর প্রোফাইল আপডেট:
**Endpoint:** `PUT /api/tutor/profile` (অ্যাক্সেস: TUTOR)
**কাজ:** টিউটরের বায়ো, প্রাইস, এক্সপেরিয়েন্স এর পাশাপাশি ইউজারের মূল টেবিলের ডাটাও (name, phone, image) এই একই এপিআই দিয়ে আপডেট হয়ে যাবে।
**📝 Payload:**
```json
{
  "name": "Updated Name",
  "phone": "01888888888",
  "bio": "I am an expert math tutor.",
  "price": 1500,
  "experience": "5 Years",
  "categoryName": "Mathematics"
}
```

### স্টুডেন্ট প্রোফাইল আপডেট:
**Endpoint:** `PUT /api/student/profile` (অথবা আপনার রাউটারে যেটা আছে `studentProfileUpsert`)
**কাজ:** স্টুডেন্টের গ্রেড, ইন্টারেস্ট এবং ইউজারের কোর ইনফরমেশন আপডেট।

---

## 📊 ৫. Statistics & Dashboard (Admin Only)
MongoDB Aggregation এর মতো করে PostgreSQL-এ গ্রুপিং এবং স্ট্যাটিস্টিকস বের করা হয়েছে।

**Endpoint:** `GET /api/dashboard/stats`
**কাজ:** 
- মোট ইউজার, টিউটর, এবং বুকিং এর সংখ্যা।
- **Monthly Earnings/Bookings:** প্রতি মাসে কতগুলো কোর্স বা স্লট বিক্রি হলো তার মান্থলি গ্রাফ ডেটা। এটা সরাসরি ড্যাশবোর্ডের চার্টে বসাতে পারবেন।

---

## 📅 ৬. Slot Booking & Scheduling (Transaction & Overlapping Logic)
টিউটরদের স্লট বুক করার ক্ষেত্রে অ্যাডভান্সড লজিক ইমপ্লিমেন্ট করা হয়েছে।

**Endpoint:** `POST /api/bookings`
**লজিক:**
1. কনকারেন্সি ইস্যু রোধ করতে **Prisma Transaction** ব্যবহার করা হয়েছে।
2. যদি কোনো স্লট অলরেডি বুকড থাকে, তাহলে এরর থ্রো করবে। 
3. **ওভারল্যাপিং চেকার:** একই সময়ে (Overlapping Time) যেন একই টিউটরকে অন্য কেউ বুকিং না করতে পারে, তার জন্য ডাটাবেস লেভেলে চেকিং বসানো হয়েছে।

---

## 🌐 ৭. Session Management
আপনি এখন দেখতে পারবেন কে বা কারা সিস্টেমে লগইন করে আছে।

1. `GET /api/sessions/my-sessions` - ইউজারের নিজের সব লগইন সেশন (ল্যাপটপ, মোবাইল ইত্যাদি)।
2. `GET /api/sessions/all-sessions` - অ্যাডমিন সবার সেশন দেখতে পারবে।
3. `DELETE /api/sessions/:sessionId` - কোনো সেশন ডিলিট করা (লগআউট করে দেওয়া)।

---

## 📂 ৮. Category Management
ক্যাটাগরির সিড (Seed) সিস্টেম বাদ দিয়ে সম্পূর্ণ অ্যাডমিন কন্ট্রোলড করা হয়েছে।

- `POST /api/categories` - নতুন ক্যাটাগরি তৈরি করুন।
- `DELETE /api/categories/:categoryId` - ক্যাটাগরি ডিলেট করুন। (যদি ওই ক্যাটাগরিতে কোনো টিউটর থাকে তবে ডিলিট হবে না, প্রটেকশন দেওয়া আছে)।

---

## 🚨 ৯. Global Error Handler & Validation (Zod)
পুরো প্রজেক্টের সবকিছুর জন্য সেন্ট্রাল এরর হ্যান্ডেলার বানানো হয়েছে (`src/app/middleware/error.ts`)। 

- **Zod Validation:** ইনপুট ডাটা ভুল হলে পরিষ্কার করে বলে দেবে কোন ফিল্ডের সমস্যা। 
- **Prisma Error:** ডাটাবেসে ডুপ্লিকেট এন্ট্রি (P2002) তৈরি করার চেষ্টা করলে, বা কোনো ডাটা না পেলে পরিষ্কার মেসেজ দিবে ("Duplicate Entry Error" বা "Record Not Found")। 
- কোনো সার্ভার ক্র্যাশ ইনফরমেশন প্রোডাকশনে ফ্রন্টএন্ডে যাবে না, শুধু প্রফেশনাল মেসেজ যাবে ("Something went wrong! Please try again later.")।

---

### ✅ কিভাবে টেস্টিং শুরু করবেন?
1. প্রথমে Postman বা Swagger (`/api-docs`) খুলুন।
2. `/api/auth-custom/custom-register` এ গিয়ে একটি স্টুডেন্ট বা টিউটর একাউন্ট খুলুন। একাউন্ট খোলার সাথে সাথেই আপনি কুকিজ-এ টোকেন পেয়ে যাবেন (Local Storage-এর আর দরকার নেই)।
3. এরপর ঐ ইউজার দিয়ে `/api/tutor/profile` বা অন্যান্য প্রোটেক্টেড `/api/...` রাউটগুলো কল করে দেখুন ডাটা রিটার্ন করে কিনা।
4. একটি স্লট বানিয়ে বুকিং করে দেখার চেষ্টা করুন, এবং একই স্লট আবার বুকিং দিয়ে চেক করুন "Overlapping" বা "Already Booked" এরর দেয় কিনা। 

🎉 **হ্যাপি কোডিং!** প্রজেক্টটি এখন সম্পূর্ণ প্রস্তুত।