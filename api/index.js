var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express5 from "express";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel TutorProfile {\n  id         String      @id @default(uuid())\n  bio        String      @db.Text\n  price      Decimal     @db.Decimal(10, 2)\n  rating     Float       @default(0)\n  experience String      @db.Text\n  status     TutorStatus @default(ACTIVE)\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n\n  // Relations\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id])\n\n  categoryId String?\n  category   Category?   @relation(fields: [categoryId], references: [id])\n  tutorSlots TutorSlot[]\n}\n\nmodel TutorSlot {\n  id        String       @id @default(uuid())\n  tutorId   String\n  tutor     TutorProfile @relation(fields: [tutorId], references: [id])\n  date      DateTime\n  startTime DateTime\n  endTime   DateTime\n  isBooked  Boolean      @default(false)\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n  bookings  Booking[]\n}\n\nenum TutorStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n  PENDING\n}\n\nmodel Category {\n  id        String         @id @default(uuid())\n  name      String         @unique\n  createdAt DateTime       @default(now())\n  updatedAt DateTime       @default(now())\n  tutors    TutorProfile[]\n}\n\nmodel Booking {\n  id        String        @id @default(uuid())\n  dateTime  DateTime\n  status    BookingStatus @default(CONFIRMED)\n  createdAt DateTime      @default(now())\n\n  studentId String\n  student   User   @relation("StudentBookings", fields: [studentId], references: [id])\n\n  tutorId String\n  tutor   User   @relation("TutorBookings", fields: [tutorId], references: [id])\n\n  slotId    String?\n  tutorSlot TutorSlot? @relation(fields: [slotId], references: [id])\n\n  review Review?\n}\n\nenum BookingStatus {\n  CONFIRMED\n  CANCELLED\n  COMPLETED\n  ATTENDED\n  RESCHEDULED\n}\n\nmodel Review {\n  id        String   @id @default(uuid())\n  rating    Int\n  comment   String   @db.Text\n  createdAt DateTime @default(now())\n\n  // Relations\n  bookingId String  @unique\n  booking   Booking @relation(fields: [bookingId], references: [id])\n\n  studentId String\n  student   User   @relation("StudentReviews", fields: [studentId], references: [id])\n\n  tutorId String\n  tutor   User   @relation("TutorReviews", fields: [tutorId], references: [id])\n}\n\nmodel StudentProfile {\n  id        String   @id @default(uuid())\n  StudentID Int      @default(autoincrement())\n  grade     String?\n  interests String?  @db.Text\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id])\n}\n\nmodel User {\n  id            String     @id @default(uuid())\n  name          String\n  email         String     @unique\n  emailVerified Boolean    @default(false)\n  image         String?\n  phone         String?\n  role          UserRole   @default(STUDENT)\n  status        UserStatus @default(ACTIVE)\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n\n  // Relations\n  tutorProfile    TutorProfile?\n  sessions        Session[]\n  accounts        Account[]\n  bookings        Booking[]       @relation("StudentBookings")\n  tutorBookings   Booking[]       @relation("TutorBookings")\n  reviewsGiven    Review[]        @relation("StudentReviews")\n  reviewsReceived Review[]        @relation("TutorReviews")\n  studentProfile  StudentProfile?\n\n  @@map("users")\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BAND\n}\n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"TutorStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorProfile"},{"name":"tutorSlots","kind":"object","type":"TutorSlot","relationName":"TutorProfileToTutorSlot"}],"dbName":null},"TutorSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSlot"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorSlot"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutors","kind":"object","type":"TutorProfile","relationName":"CategoryToTutorProfile"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dateTime","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"User","relationName":"TutorBookings"},{"name":"slotId","kind":"scalar","type":"String"},{"name":"tutorSlot","kind":"object","type":"TutorSlot","relationName":"BookingToTutorSlot"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentReviews"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"User","relationName":"TutorReviews"}],"dbName":null},"StudentProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"StudentID","kind":"scalar","type":"Int"},{"name":"grade","kind":"scalar","type":"String"},{"name":"interests","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"StudentProfileToUser"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"tutorBookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviewsGiven","kind":"object","type":"Review","relationName":"StudentReviews"},{"name":"reviewsReceived","kind":"object","type":"Review","relationName":"TutorReviews"},{"name":"studentProfile","kind":"object","type":"StudentProfile","relationName":"StudentProfileToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  }
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var enums_exports = {};
__export(enums_exports, {
  BookingStatus: () => BookingStatus,
  TutorStatus: () => TutorStatus,
  UserRole: () => UserRole,
  UserStatus: () => UserStatus
});
var TutorStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED",
  PENDING: "PENDING"
};
var BookingStatus = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  ATTENDED: "ATTENDED",
  RESCHEDULED: "RESCHEDULED"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BAND: "BAND"
};
var UserRole = {
  STUDENT: "STUDENT",
  TUTOR: "TUTOR",
  ADMIN: "ADMIN"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false
  },
  // emailVerification: {
  //     sendOnSignUp: true,
  //     autoSignInAfterVerification: true,
  //     sendVerificationEmail: async ({ user, url, token }, request) => {
  //         try {
  //             const verification_url = `${process.env.APP_URL}/verify-email?token=${token}`;
  //             const info = await transporter.sendMail({
  //                 from: '"Sojibur Asif" <maddison53@ethereal.email>',
  //                 to: user.email,
  //                 subject: "Verify Your Email ✔",
  //                 text: `Hi ${user.name || "User"}, please verify your email by clicking the link: ${verification_url}`,
  //                 html: `
  //     <div style="font-family: Arial, sans-serif; color: #333;">
  //         <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
  //             <h2 style="color: #4CAF50;">Welcome to Our Platform, ${user.name || "User"}!</h2>
  //             <p>Thank you for signing up. To get started, please verify your email address by clicking the button below:</p>
  //             <a href="${verification_url}" 
  //                style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
  //                Verify Email
  //             </a>
  //             <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
  //             <p style="word-break: break-all;"><a href="${verification_url}">${verification_url}</a></p>
  //             <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  //             <p style="font-size: 12px; color: #888;">If you did not create an account, no further action is required.</p>
  //         </div>
  //     </div>
  //     `
  //             });
  //             console.log(info);
  //         } catch (err: any) {
  //             console.log(err);
  //         }
  //     }
  // },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/app.ts
import cors from "cors";

// src/Module/Tutors/tutor.route.ts
import express from "express";

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, Res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return Res.status(401).json({
          message: "You are not authorized to access this resource"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user?.role)) {
        return Res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          message: "You do not have permission to access this resource"
        });
      }
      next();
    } catch (err) {
      Res.status(401).json({ message: "Unauthorized" });
    }
  };
};

// src/Module/Tutors/tutor.service.ts
var createtutor = async (tutorData, userId, slots) => {
  const existingTutor = await prisma.tutorProfile.findUnique({ where: { userId } });
  if (existingTutor) {
    return "Tutor profile already exists for this user.";
  }
  const slotsCreatePayload = Array.isArray(slots) ? slots.map((s) => ({
    date: new Date(s.date),
    // store date at midnight (UTC)
    startTime: /* @__PURE__ */ new Date(`${s.date}T${s.startTime}:00Z`),
    endTime: /* @__PURE__ */ new Date(`${s.date}T${s.endTime}:00Z`)
  })) : [];
  const result = await prisma.tutorProfile.create({
    data: {
      ...tutorData,
      userId,
      // if no slots, create: [] works fine
      tutorSlots: {
        create: slotsCreatePayload
      }
    },
    // include relations so frontend gets full object (slots, user, category)
    include: {
      tutorSlots: true,
      user: true,
      category: true
    }
  });
  return result;
};
var updateTutorProfile = async (data, userId) => {
  let categoryId;
  if (data.categoryName) {
    const category = await prisma.category.findUnique({ where: { name: data.categoryName } });
    if (!category) throw new Error("Category does not exist");
    categoryId = category.id;
  }
  const fields = { ...data };
  if (fields.experience !== void 0) fields.experience = String(fields.experience);
  if (fields.price !== void 0) fields.price = Number(fields.price);
  if (categoryId) fields.categoryId = categoryId;
  const result = await prisma.tutorProfile.update({
    where: { userId },
    data: fields,
    include: { tutorSlots: true, user: true, category: true }
    // return slots so frontend has updated view
  });
  return result;
};
var getAlltetutor = async (payload) => {
  const filters = {};
  if (payload.search) {
    const maybeNumber = Number(payload.search);
    filters.OR = [
      { bio: { contains: payload.search, mode: "insensitive" } },
      { experience: { contains: payload.search, mode: "insensitive" } },
      { rating: !isNaN(maybeNumber) ? { gte: maybeNumber } : void 0 },
      { price: !isNaN(maybeNumber) ? { lte: maybeNumber } : void 0 }
    ].filter(Boolean);
  }
  if (payload.categoryId) filters.categoryId = payload.categoryId;
  if (payload.rating !== void 0) filters.rating = { gte: payload.rating };
  if (payload.price !== void 0) filters.price = { lte: payload.price };
  const result = await prisma.tutorProfile.findMany({
    where: filters,
    include: {
      category: true,
      user: true,
      tutorSlots: true
      // include slots so frontend can show availability
    }
  });
  return result;
};
var getTutorProfileById = async (tutorId) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: { category: true, user: true, tutorSlots: true }
  });
  return result;
};
var getCategoriesAll = async () => await prisma.category.findMany();
var creaCategory = async (category) => {
  if (!category?.name?.trim()) throw new Error("Category name is required");
  const created = await prisma.category.upsert({
    where: { name: category.name.trim() },
    update: {},
    create: { name: category.name.trim() }
  });
  return created;
};
var getMyProfiletetutor = async (payload) => {
  return prisma.tutorProfile.findUnique({
    where: { userId: payload.userId }
  });
};
var tutorServices = {
  createtutor,
  updateTutorProfile,
  getAlltetutor,
  getTutorProfileById,
  getCategoriesAll,
  creaCategory,
  getMyProfiletetutor
};

// src/Module/Tutors/tutor.controller.ts
var getAlltetutor2 = async (req, res) => {
  try {
    const { search, categoryId, rating, price } = req.query;
    const searchString = typeof search === "string" ? search : void 0;
    const categoryIdString = typeof categoryId === "string" ? categoryId : void 0;
    const ratingNumber = typeof rating === "string" ? Number(rating) : void 0;
    const priceNumber = typeof price === "string" ? Number(price) : void 0;
    const payload = {};
    if (searchString !== void 0) payload.search = searchString;
    if (categoryIdString !== void 0) payload.categoryId = categoryIdString;
    if (!isNaN(Number(ratingNumber)) && ratingNumber !== void 0) payload.rating = ratingNumber;
    if (!isNaN(Number(priceNumber)) && priceNumber !== void 0) payload.price = priceNumber;
    const result = await tutorServices.getAlltetutor(payload);
    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var getMytetutorProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: user id missing"
      });
    }
    const userId = user.id;
    const profile = await tutorServices.getMyProfiletetutor({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error("getMyTutorProfile error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Server error"
    });
  }
};
var createtutor2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { slots, ...tutorData } = req.body;
    const result = await tutorServices.createtutor(tutorData, user.id, Array.isArray(slots) ? slots : void 0);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var updateTutorController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const result = await tutorServices.updateTutorProfile(req.body, user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var getTutorProfile = async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!tutorId) throw new Error("TutorId is required!");
    const result = await tutorServices.getTutorProfileById(tutorId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var getCategories = async (req, res) => {
  try {
    const result = await tutorServices.getCategoriesAll();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var PostCategory = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const category = req.body;
    if (!category || !category.name?.trim()) return res.status(400).json({ error: "Category name is required" });
    const result = await tutorServices.creaCategory(category);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || "Failed to create category" });
  }
};
var TutorController = {
  createtutor: createtutor2,
  updateTutorController,
  getAlltetutor: getAlltetutor2,
  getTutorProfile,
  getCategories,
  PostCategory,
  getMytetutorProfile
};

// src/Module/Tutors/tutor.route.ts
var router = express.Router();
router.get("/tutor/profile", TutorController.getAlltetutor);
router.get("/my/profile", auth2("TUTOR" /* TUTOR */), TutorController.getMytetutorProfile);
router.get("/categories", TutorController.getCategories);
router.get("/tutor/profile/:tutorId", TutorController.getTutorProfile);
router.post("/categories", auth2("ADMIN" /* ADMIN */), TutorController.PostCategory);
router.post("/tutor/profile", auth2("TUTOR" /* TUTOR */), TutorController.createtutor);
router.put("/tutor/profile", auth2("TUTOR" /* TUTOR */), TutorController.updateTutorController);
var tutorRouter = router;

// src/Module/Booking/booking.route.ts
import express2 from "express";

// src/Module/Booking/booking.service.ts
var createBooking = async (payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorProfileId },
    select: { userId: true }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  const slot = await prisma.tutorSlot.findFirst({
    where: {
      id: payload.slotId,
      tutorId: payload.tutorProfileId,
      // TutorProfile.id
      isBooked: false
    }
  });
  if (!slot) {
    throw new Error("Invalid slot or slot already booked");
  }
  const booking = await prisma.booking.create({
    data: {
      studentId: payload.studentId,
      tutorId: tutorProfile.userId,
      // ✅ REAL User.id
      slotId: slot.id,
      dateTime: slot.startTime,
      // ✅ valid Date
      status: payload.status ?? BookingStatus.CONFIRMED
    }
  });
  await prisma.tutorSlot.update({
    where: { id: slot.id },
    data: { isBooked: true }
  });
  return booking;
};
var getAllbooking = async () => {
  const result = await prisma.booking.findMany();
  return result;
};
var getSingleBooking = async (bookingId, role, userId) => {
  if (role === "ADMIN" /* ADMIN */) {
    return await prisma.booking.findUnique({
      where: { id: bookingId }
    });
  }
  if (role === "STUDENT" /* STUDENT */) {
    return await prisma.booking.findFirst({
      where: {
        id: bookingId,
        studentId: userId
      }
    });
  }
  throw new Error("Unauthorized access");
};
var getMyBooking = async (userId) => {
  return await prisma.booking.findMany({
    where: {
      studentId: userId
    },
    orderBy: {
      dateTime: "desc"
    },
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  });
};
var getMyTutorBookings = async (userId) => {
  return await prisma.booking.findMany({
    where: {
      tutorId: userId
    },
    include: {
      student: true
    },
    orderBy: {
      dateTime: "desc"
    }
  });
};
var updateBookingStatus = async (bookingId, newStatus, userId, role) => {
  if (role === "ADMIN" /* ADMIN */) {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });
  }
  if (role === "TUTOR" /* TUTOR */ && (newStatus === "COMPLETED" || newStatus === "RESCHEDULED")) {
    return await prisma.booking.update({
      where: {
        id: bookingId,
        tutorId: userId
      },
      data: { status: newStatus }
    });
  }
  if (role === "STUDENT" /* STUDENT */ && (newStatus === "CANCELLED" || newStatus === "ATTENDED")) {
    return await prisma.booking.update({
      where: {
        id: bookingId,
        studentId: userId
      },
      data: { status: newStatus }
    });
  }
  throw new Error("Unauthorized status change");
};
var bookingServices = {
  createBooking,
  getAllbooking,
  getSingleBooking,
  getMyBooking,
  getMyTutorBookings,
  updateBookingStatus
};

// src/Module/Booking/booking.controller.ts
var createBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { tutorProfileId, slotId, dateTime, status } = req.body;
    const booking = await bookingServices.createBooking({
      studentId: user.id,
      tutorProfileId,
      slotId,
      status
    });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getAllBooking = async (req, res) => {
  try {
    const result = await bookingServices.getAllbooking();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};
var getIdByBooking = async (req, res) => {
  try {
    const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized: user not found");
    }
    const { id: userId, role } = user;
    if (!bookingId) {
      throw new Error("BookingId is required!");
    }
    const result = await bookingServices.getSingleBooking(
      bookingId,
      role,
      userId
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or unauthorized"
      });
    }
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var getMyBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await bookingServices.getMyBooking(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
var getMyTutorBookings2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized: user not found");
    }
    const result = await bookingServices.getMyTutorBookings(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var changeBookingStatus = async (req, res) => {
  try {
    const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
    const user = req.user;
    if (!user) {
      throw new Error("Unauthorized: user not found");
    }
    const { id: userId, role } = user;
    const bookingStatus = req.body.status;
    if (!bookingId) {
      throw new Error("BookingId is required!");
    }
    const result = await bookingServices.updateBookingStatus(
      bookingId,
      bookingStatus,
      userId,
      role
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var bookingController = {
  createBooking: createBooking2,
  getAllBooking,
  getIdByBooking,
  getMyBooking: getMyBooking2,
  getMyTutorBookings: getMyTutorBookings2,
  changeBookingStatus
};

// src/Module/Booking/booking.route.ts
var router2 = express2.Router();
router2.get("/all/bookings", auth2("ADMIN" /* ADMIN */), bookingController.getAllBooking);
router2.get("/my/bookings", auth2("STUDENT" /* STUDENT */), bookingController.getMyBooking);
router2.get("/my/bookings/tutor", auth2("TUTOR" /* TUTOR */), bookingController.getMyTutorBookings);
router2.get("/bookings/:bookingId", auth2("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */), bookingController.getIdByBooking);
router2.post("/bookings", auth2("STUDENT" /* STUDENT */), bookingController.createBooking);
router2.patch("/bookings/:bookingId", auth2("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), bookingController.changeBookingStatus);
var StudentBookingRouter = router2;

// src/Module/User/user.route.ts
import express3 from "express";

// src/Module/User/user.service.ts
var AllUser = async () => {
  return await prisma.user.findMany();
};
var getSingleUser = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    }
  });
};
var updateUserStatus = async (userId, newStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
};
var createStudentProfile = async (data, userId) => {
  const existingStudent = await prisma.studentProfile.findUnique({
    where: { userId }
  });
  if (existingStudent) {
    throw new Error("Student profile already exists for this user.");
  }
  return await prisma.studentProfile.create({
    data: {
      ...data,
      userId
    },
    include: {
      user: true
    }
  });
};
var getStudentProfile = async (userId) => {
  return await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true
    }
  });
};
var getAllStudentProfiles = async () => {
  return await prisma.studentProfile.findMany({
    include: {
      user: true
    }
  });
};
var studentProfileUpsert = async (payload, userId) => {
  const data = {};
  if (payload.grade !== void 0) {
    data.grade = payload.grade;
  }
  if (payload.interests !== void 0) {
    data.interests = payload.interests;
  }
  const result = await prisma.studentProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data
    }
  });
  return result;
};
var UserServices = {
  AllUser,
  getSingleUser,
  updateUserStatus,
  createStudentProfile,
  getStudentProfile,
  getAllStudentProfiles,
  studentProfileUpsert
};

// src/Module/User/user.controller.ts
var getUser = async (req, res) => {
  try {
    const result = await UserServices.AllUser();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getStudentProfile2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized"
      });
    }
    const result = await UserServices.getStudentProfile(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getSingleUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserServices.getSingleUser(id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var updateUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!Object.values(enums_exports.UserStatus).includes(status)) {
      throw new Error("Invalid status value");
    }
    const result = await UserServices.updateUserStatus(id, status);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var StudentProfileCreate = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Unauthorized"
      });
    }
    const result = await UserServices.createStudentProfile(req.body, user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var getAllStudentProfiles2 = async (req, res) => {
  try {
    const result = await UserServices.getAllStudentProfiles();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var studentProfileUpsert2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await UserServices.studentProfileUpsert(
      req.body,
      user.id
    );
    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var UserController = {
  getUser,
  getSingleUserController,
  updateUserStatusController,
  StudentProfileCreate,
  getStudentProfile: getStudentProfile2,
  getAllStudentProfiles: getAllStudentProfiles2,
  studentProfileUpsert: studentProfileUpsert2
};

// src/Module/User/user.route.ts
var router3 = express3.Router();
router3.get("/admin/users", auth2("ADMIN" /* ADMIN */), UserController.getUser);
router3.get("/student/profile", auth2("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), UserController.getStudentProfile);
router3.get("/admin/student/Allprofile", auth2("ADMIN" /* ADMIN */), UserController.getAllStudentProfiles);
router3.get("/admin/users/:id", auth2("ADMIN" /* ADMIN */), UserController.getSingleUserController);
router3.patch("/admin/users/:id", auth2("ADMIN" /* ADMIN */), UserController.updateUserStatusController);
router3.post("/student/profile", auth2("STUDENT" /* STUDENT */), UserController.StudentProfileCreate);
router3.put(
  "/student/profile",
  auth2("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */),
  UserController.studentProfileUpsert
);
var userRouter = router3;

// src/Module/Review/Review.route.ts
import express4 from "express";

// src/Module/Review/Review.service.ts
var PostReview = async (data) => {
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this booking!");
  }
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({ data });
    const agg = await tx.review.aggregate({
      where: { tutorId: data.tutorId },
      _avg: { rating: true }
    });
    await tx.tutorProfile.update({
      where: { userId: data.tutorId },
      data: { rating: agg._avg.rating ?? 0 }
    });
    return review;
  });
};
var GetReviewByBookingId = async (bookingId) => {
  return await prisma.review.findUnique({
    where: { bookingId },
    include: {
      student: true,
      tutor: true
    }
  });
};
var AllUserReview = async () => {
  return await prisma.review.findMany({
    include: {
      student: true,
      tutor: true,
      booking: true
    }
  });
};
var GetReviewByTutorId = async (tutorId) => {
  return await prisma.review.findMany({
    where: { tutorId },
    include: {
      student: { select: { name: true, email: true } },
      booking: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var ReviewServices = {
  AllUserReview,
  PostReview,
  GetReviewByBookingId,
  GetReviewByTutorId
};

// src/Module/Review/Review.controller.ts
var ReviewPost = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ success: false, error: "Unauthorized" });
    }
    const { rating, comment, bookingId, tutorId } = req.body;
    if (!rating || !comment || !bookingId || !tutorId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const result = await ReviewServices.PostReview({
      rating,
      comment,
      bookingId,
      studentId: user.id,
      tutorId
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var GetAllReviews = async (req, res) => {
  try {
    const result = await ReviewServices.AllUserReview();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var GetReviewByBookingId2 = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await ReviewServices.GetReviewByBookingId(bookingId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
var GetTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;
    if (!tutorId) {
      return res.status(400).json({ success: false, error: "Tutor ID is required" });
    }
    const result = await ReviewServices.GetReviewByTutorId(tutorId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var ReviewController = {
  ReviewPost,
  GetAllReviews,
  GetReviewByBookingId: GetReviewByBookingId2,
  GetTutorReviews
};

// src/Module/Review/Review.route.ts
var router4 = express4.Router();
router4.get("/reviews", ReviewController.GetAllReviews);
router4.get("/reviews/tutor/:tutorId", ReviewController.GetTutorReviews);
router4.get("/reviews/booking/:bookingId", ReviewController.GetReviewByBookingId);
router4.post("/reviews", auth2("STUDENT" /* STUDENT */), ReviewController.ReviewPost);
var reviewRouter = router4;

// src/Module/TutorSlot/tutorSlot.route.ts
import { Router } from "express";

// src/Module/TutorSlot/tutorSlot.service.ts
var createSlots = async (tutorId, slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const slotsCreate = slots.map((s) => ({
    tutorId,
    date: new Date(s.date),
    startTime: /* @__PURE__ */ new Date(`${s.date}T${s.startTime}:00Z`),
    endTime: /* @__PURE__ */ new Date(`${s.date}T${s.endTime}:00Z`)
  }));
  const result = await prisma.tutorSlot.createMany({
    data: slotsCreate,
    skipDuplicates: true
  });
  return result;
};
var updateSlot = async (slotId, data) => {
  const updated = await prisma.tutorSlot.update({
    where: { id: slotId },
    data
  });
  return updated;
};
var deleteSlot = async (slotId) => {
  const deleted = await prisma.tutorSlot.delete({ where: { id: slotId } });
  return deleted;
};
var getSlotsByTutor = async (tutorId) => {
  return prisma.tutorSlot.findMany({ where: { tutorId } });
};
var tutorSlotServices = {
  createSlots,
  updateSlot,
  deleteSlot,
  getSlotsByTutor
};

// src/Module/TutorSlot/tutorSlot.controller.ts
var addSlots = async (req, res) => {
  try {
    const tutorIdRaw = req.params.tutorId;
    if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid tutorId" });
    }
    const tutorId = tutorIdRaw;
    const slots = req.body.slots;
    if (!Array.isArray(slots)) return res.status(400).json({ success: false, error: "slots must be array" });
    const result = await tutorSlotServices.createSlots(tutorId, slots);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var updateSlotController = async (req, res) => {
  try {
    const slotIdRaw = req.params.slotId;
    if (!slotIdRaw || Array.isArray(slotIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid slotId" });
    }
    const slotId = slotIdRaw;
    const data = req.body;
    const updated = await tutorSlotServices.updateSlot(slotId, data);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var deleteSlotController = async (req, res) => {
  try {
    const slotIdRaw = req.params.slotId;
    if (!slotIdRaw || Array.isArray(slotIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid slotId" });
    }
    const slotId = slotIdRaw;
    const deleted = await tutorSlotServices.deleteSlot(slotId);
    res.status(200).json({ success: true, data: deleted });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var getSlotsByTutor2 = async (req, res) => {
  try {
    const tutorIdRaw = req.params.tutorId;
    if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
      return res.status(400).json({ success: false, error: "Invalid tutorId" });
    }
    const tutorId = tutorIdRaw;
    const slots = await tutorSlotServices.getSlotsByTutor(tutorId);
    res.status(200).json({ success: true, data: slots });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
var tutorSlotController = {
  addSlots,
  updateSlotController,
  deleteSlotController,
  getSlotsByTutor: getSlotsByTutor2
};

// src/Module/TutorSlot/tutorSlot.route.ts
var router5 = Router();
router5.post("/tutor/profileSlot/:tutorId", tutorSlotController.addSlots);
router5.put("/tutor/profileSlot/:slotId", tutorSlotController.updateSlotController);
router5.delete("/tutor/profileSlot/:slotId", tutorSlotController.deleteSlotController);
router5.get("/tutor/profileSlot/:tutorId", tutorSlotController.getSlotsByTutor);
var TutorSlot = router5;

// src/app.ts
var app = express5();
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true
}));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express5.json());
app.use("/api", tutorRouter);
app.use("/api", StudentBookingRouter);
app.use("/api", userRouter);
app.use("/api", reviewRouter);
app.use("/api", TutorSlot);
app.get("/", (req, res) => {
  res.send("SkillBridge server is up and running");
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
