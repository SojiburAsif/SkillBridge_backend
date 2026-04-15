var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express6 from "express";
import cors from "cors";

// src/app/routes/index.ts
import { Router as Router10 } from "express";

// src/app/Module/Tutors/tutor.route.ts
import express from "express";

// src/app/middleware/auth.ts
import jwt from "jsonwebtoken";

// src/app/config/env.ts
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join((process.cwd(), ".env")) });
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("8000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  APP_URL: z.string().min(1, "APP_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  STORE_ID: z.string().min(1, "STORE_ID is required"),
  STORE_PASS: z.string().min(1, "STORE_PASS is required"),
  IS_LIVE: z.string().default("false").transform((val) => val === "true"),
  SSL_PAYMENT_URL: z.string().min(1, "SSL_PAYMENT_URL is required"),
  SSL_VALIDATION_URL: z.string().min(1, "SSL_VALIDATION_URL is required"),
  // JWT secrets and expiry
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d")
});
var envVars = envSchema.safeParse(process.env);
if (!envVars.success) {
  console.error("Invalid environment variables:", envVars.error.format());
  process.exit(1);
}
var envConfig = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  db_url: envVars.data.DATABASE_URL,
  app_url: envVars.data.APP_URL,
  google_client_id: envVars.data.GOOGLE_CLIENT_ID,
  google_client_secret: envVars.data.GOOGLE_CLIENT_SECRET,
  store_id: envVars.data.STORE_ID,
  store_pass: envVars.data.STORE_PASS,
  is_live: envVars.data.IS_LIVE,
  ssl_payment_url: envVars.data.SSL_PAYMENT_URL,
  ssl_validation_url: envVars.data.SSL_VALIDATION_URL,
  // JWT secrets and expiry
  jwt_access_secret: envVars.data.JWT_ACCESS_SECRET,
  jwt_refresh_secret: envVars.data.JWT_REFRESH_SECRET,
  jwt_access_expires_in: envVars.data.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: envVars.data.JWT_REFRESH_EXPIRES_IN
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel TutorProfile {\n  id           String      @id @default(uuid())\n  bio          String      @db.Text\n  price        Decimal     @db.Decimal(10, 2)\n  rating       Float       @default(0)\n  totalReviews Int         @default(0)\n  gender       String?\n  institution  String?\n  experience   String      @db.Text\n  status       TutorStatus @default(ACTIVE)\n  createdAt    DateTime    @default(now())\n  updatedAt    DateTime    @updatedAt\n\n  // Relations\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  categoryId   String?\n  category     Category?              @relation(fields: [categoryId], references: [id])\n  categories   TutorProfileCategory[]\n  tutorSlots   TutorSlot[]\n  wishlistedBy Wishlist[]\n}\n\nmodel TutorProfileCategory {\n  id             String   @id @default(uuid())\n  tutorProfileId String\n  categoryId     String\n  order          Int      @default(0)\n  createdAt      DateTime @default(now())\n\n  tutorProfile TutorProfile @relation(fields: [tutorProfileId], references: [id], onDelete: Cascade)\n  category     Category     @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n\n  @@unique([tutorProfileId, categoryId])\n  @@index([categoryId])\n}\n\nmodel TutorSlot {\n  id        String       @id @default(uuid())\n  tutorId   String\n  tutor     TutorProfile @relation(fields: [tutorId], references: [id])\n  date      DateTime\n  startTime DateTime\n  endTime   DateTime\n  isBooked  Boolean      @default(false)\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n  bookings  Booking[]\n}\n\nenum TutorStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n  PENDING\n}\n\nmodel Category {\n  id            String                 @id @default(uuid())\n  name          String\n  icon          String?\n  createdAt     DateTime               @default(now())\n  updatedAt     DateTime               @default(now())\n  tutors        TutorProfile[]\n  tutorProfiles TutorProfileCategory[]\n}\n\nmodel Booking {\n  id                 String        @id @default(uuid())\n  dateTime           DateTime\n  status             BookingStatus @default(AWAITING_PAYMENT)\n  paymentStatus      PaymentStatus @default(PENDING)\n  originalAmount     Float?\n  discountAmount     Float?\n  paidAmount         Float?\n  transactionId      String?       @unique\n  videoCallId        String?       @unique\n  isAutoCompleted    Boolean       @default(false)\n  mutualConfirmation Json?         @default("{\\"tutorConfirmed\\": false, \\"studentConfirmed\\": false}")\n  videoSession       Json?         @default("{\\"sessionUrl\\": null, \\"isActive\\": false, \\"expiresAt\\": null}")\n  createdAt          DateTime      @default(now())\n\n  couponId String?\n  coupon   Coupon? @relation(fields: [couponId], references: [id])\n\n  studentId String\n  student   User   @relation("StudentBookings", fields: [studentId], references: [id])\n\n  tutorId String\n  tutor   User   @relation("TutorBookings", fields: [tutorId], references: [id])\n\n  slotId    String?\n  tutorSlot TutorSlot? @relation(fields: [slotId], references: [id])\n\n  review Review?\n}\n\nenum BookingStatus {\n  AWAITING_PAYMENT\n  PENDING_CONFIRMATION\n  CONFIRMED\n  CANCELLED\n  COMPLETED\n  ATTENDED\n  RESCHEDULED\n}\n\nenum PaymentStatus {\n  PENDING\n  PAID\n  REFUND_REQUESTED\n  REFUND_PROCESSED\n  FAILED\n}\n\nmodel Review {\n  id         String   @id @default(uuid())\n  rating     Int\n  comment    String   @db.Text\n  isVerified Boolean  @default(true)\n  createdAt  DateTime @default(now())\n\n  // Relations\n  bookingId String  @unique\n  booking   Booking @relation(fields: [bookingId], references: [id])\n\n  studentId String\n  student   User   @relation("StudentReviews", fields: [studentId], references: [id])\n\n  tutorId String\n  tutor   User   @relation("TutorReviews", fields: [tutorId], references: [id])\n}\n\nmodel StudentProfile {\n  id          String   @id @default(uuid())\n  StudentID   Int      @default(autoincrement())\n  grade       String?\n  institution String?\n  gender      String?\n  interests   String?  @db.Text\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel User {\n  id            String     @id @default(uuid())\n  name          String\n  email         String     @unique\n  emailVerified Boolean    @default(false)\n  image         String?\n  phone         String?\n  role          UserRole   @default(STUDENT)\n  status        UserStatus @default(ACTIVE)\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n\n  // Relations\n  tutorProfile    TutorProfile?\n  sessions        Session[]\n  accounts        Account[]\n  notifications   Notification[]\n  bookings        Booking[]       @relation("StudentBookings")\n  tutorBookings   Booking[]       @relation("TutorBookings")\n  reviewsGiven    Review[]        @relation("StudentReviews")\n  reviewsReceived Review[]        @relation("TutorReviews")\n  wishlistItems   Wishlist[]      @relation("StudentWishlist")\n  messagesSent    Message[]       @relation("SentMessages")\n  messagesRecv    Message[]       @relation("ReceivedMessages")\n  studentProfile  StudentProfile?\n\n  @@map("users")\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BAND\n}\n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Notification {\n  id            String   @id @default(uuid())\n  userId        String\n  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  title         String\n  message       String\n  isRead        Boolean  @default(false)\n  type          String   @default("INFO")\n  transactionId String?\n  metadata      Json?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  @@map("notifications")\n}\n\nmodel Wishlist {\n  id             String       @id @default(uuid())\n  studentId      String\n  student        User         @relation("StudentWishlist", fields: [studentId], references: [id])\n  tutorProfileId String\n  tutorProfile   TutorProfile @relation(fields: [tutorProfileId], references: [id])\n  createdAt      DateTime     @default(now())\n\n  @@unique([studentId, tutorProfileId])\n}\n\nmodel Message {\n  id         String    @id @default(uuid())\n  senderId   String\n  sender     User      @relation("SentMessages", fields: [senderId], references: [id])\n  receiverId String\n  receiver   User      @relation("ReceivedMessages", fields: [receiverId], references: [id])\n  text       String    @db.Text\n  createdAt  DateTime  @default(now())\n  readAt     DateTime?\n}\n\nmodel Coupon {\n  id                 String   @id @default(uuid())\n  code               String   @unique\n  discountPercentage Float\n  expireDate         DateTime\n  maxUsage           Int\n  usageCount         Int      @default(0)\n  createdAt          DateTime @default(now())\n\n  bookings Booking[]\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"rating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"gender","kind":"scalar","type":"String"},{"name":"institution","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"TutorStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorProfile"},{"name":"categories","kind":"object","type":"TutorProfileCategory","relationName":"TutorProfileToTutorProfileCategory"},{"name":"tutorSlots","kind":"object","type":"TutorSlot","relationName":"TutorProfileToTutorSlot"},{"name":"wishlistedBy","kind":"object","type":"Wishlist","relationName":"TutorProfileToWishlist"}],"dbName":null},"TutorProfileCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"order","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorProfileCategory"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorProfileCategory"}],"dbName":null},"TutorSlot":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorProfileToTutorSlot"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"DateTime"},{"name":"endTime","kind":"scalar","type":"DateTime"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorSlot"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutors","kind":"object","type":"TutorProfile","relationName":"CategoryToTutorProfile"},{"name":"tutorProfiles","kind":"object","type":"TutorProfileCategory","relationName":"CategoryToTutorProfileCategory"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"dateTime","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"originalAmount","kind":"scalar","type":"Float"},{"name":"discountAmount","kind":"scalar","type":"Float"},{"name":"paidAmount","kind":"scalar","type":"Float"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"videoCallId","kind":"scalar","type":"String"},{"name":"isAutoCompleted","kind":"scalar","type":"Boolean"},{"name":"mutualConfirmation","kind":"scalar","type":"Json"},{"name":"videoSession","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"couponId","kind":"scalar","type":"String"},{"name":"coupon","kind":"object","type":"Coupon","relationName":"BookingToCoupon"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"User","relationName":"TutorBookings"},{"name":"slotId","kind":"scalar","type":"String"},{"name":"tutorSlot","kind":"object","type":"TutorSlot","relationName":"BookingToTutorSlot"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentReviews"},{"name":"tutorId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"User","relationName":"TutorReviews"}],"dbName":null},"StudentProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"StudentID","kind":"scalar","type":"Int"},{"name":"grade","kind":"scalar","type":"String"},{"name":"institution","kind":"scalar","type":"String"},{"name":"gender","kind":"scalar","type":"String"},{"name":"interests","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"StudentProfileToUser"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"tutorBookings","kind":"object","type":"Booking","relationName":"TutorBookings"},{"name":"reviewsGiven","kind":"object","type":"Review","relationName":"StudentReviews"},{"name":"reviewsReceived","kind":"object","type":"Review","relationName":"TutorReviews"},{"name":"wishlistItems","kind":"object","type":"Wishlist","relationName":"StudentWishlist"},{"name":"messagesSent","kind":"object","type":"Message","relationName":"SentMessages"},{"name":"messagesRecv","kind":"object","type":"Message","relationName":"ReceivedMessages"},{"name":"studentProfile","kind":"object","type":"StudentProfile","relationName":"StudentProfileToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"type","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"metadata","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"notifications"},"Wishlist":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentWishlist"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToWishlist"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"sender","kind":"object","type":"User","relationName":"SentMessages"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"receiver","kind":"object","type":"User","relationName":"ReceivedMessages"},{"name":"text","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"readAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Coupon":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"discountPercentage","kind":"scalar","type":"Float"},{"name":"expireDate","kind":"scalar","type":"DateTime"},{"name":"maxUsage","kind":"scalar","type":"Int"},{"name":"usageCount","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCoupon"}],"dbName":null}},"enums":{},"types":{}}');
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
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  CouponScalarFieldEnum: () => CouponScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MessageScalarFieldEnum: () => MessageScalarFieldEnum,
  ModelName: () => ModelName,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  StudentProfileScalarFieldEnum: () => StudentProfileScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfileCategoryScalarFieldEnum: () => TutorProfileCategoryScalarFieldEnum,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  TutorSlotScalarFieldEnum: () => TutorSlotScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  WishlistScalarFieldEnum: () => WishlistScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.2.0",
  engine: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  TutorProfile: "TutorProfile",
  TutorProfileCategory: "TutorProfileCategory",
  TutorSlot: "TutorSlot",
  Category: "Category",
  Booking: "Booking",
  Review: "Review",
  StudentProfile: "StudentProfile",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Notification: "Notification",
  Wishlist: "Wishlist",
  Message: "Message",
  Coupon: "Coupon"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var TutorProfileScalarFieldEnum = {
  id: "id",
  bio: "bio",
  price: "price",
  rating: "rating",
  totalReviews: "totalReviews",
  gender: "gender",
  institution: "institution",
  experience: "experience",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId",
  categoryId: "categoryId"
};
var TutorProfileCategoryScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  categoryId: "categoryId",
  order: "order",
  createdAt: "createdAt"
};
var TutorSlotScalarFieldEnum = {
  id: "id",
  tutorId: "tutorId",
  date: "date",
  startTime: "startTime",
  endTime: "endTime",
  isBooked: "isBooked",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  icon: "icon",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  dateTime: "dateTime",
  status: "status",
  paymentStatus: "paymentStatus",
  originalAmount: "originalAmount",
  discountAmount: "discountAmount",
  paidAmount: "paidAmount",
  transactionId: "transactionId",
  videoCallId: "videoCallId",
  isAutoCompleted: "isAutoCompleted",
  mutualConfirmation: "mutualConfirmation",
  videoSession: "videoSession",
  createdAt: "createdAt",
  couponId: "couponId",
  studentId: "studentId",
  tutorId: "tutorId",
  slotId: "slotId"
};
var ReviewScalarFieldEnum = {
  id: "id",
  rating: "rating",
  comment: "comment",
  isVerified: "isVerified",
  createdAt: "createdAt",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorId: "tutorId"
};
var StudentProfileScalarFieldEnum = {
  id: "id",
  StudentID: "StudentID",
  grade: "grade",
  institution: "institution",
  gender: "gender",
  interests: "interests",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  userId: "userId"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  phone: "phone",
  role: "role",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  title: "title",
  message: "message",
  isRead: "isRead",
  type: "type",
  transactionId: "transactionId",
  metadata: "metadata",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var WishlistScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  createdAt: "createdAt"
};
var MessageScalarFieldEnum = {
  id: "id",
  senderId: "senderId",
  receiverId: "receiverId",
  text: "text",
  createdAt: "createdAt",
  readAt: "readAt"
};
var CouponScalarFieldEnum = {
  id: "id",
  code: "code",
  discountPercentage: "discountPercentage",
  expireDate: "expireDate",
  maxUsage: "maxUsage",
  usageCount: "usageCount",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var enums_exports = {};
__export(enums_exports, {
  BookingStatus: () => BookingStatus,
  PaymentStatus: () => PaymentStatus,
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
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  ATTENDED: "ATTENDED",
  RESCHEDULED: "RESCHEDULED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUND_REQUESTED: "REFUND_REQUESTED",
  REFUND_PROCESSED: "REFUND_PROCESSED",
  FAILED: "FAILED"
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
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/middleware/auth.ts
var UserRole2 = /* @__PURE__ */ ((UserRole4) => {
  UserRole4["STUDENT"] = "STUDENT";
  UserRole4["TUTOR"] = "TUTOR";
  UserRole4["ADMIN"] = "ADMIN";
  return UserRole4;
})(UserRole2 || {});
var auth = (...roles) => {
  return async (req, Res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return Res.status(401).json({
          message: "You are not authorized to access this resource"
        });
      }
      const decoded = jwt.verify(token, envConfig.jwt_access_secret);
      if (!decoded || !decoded.userId) {
        return Res.status(401).json({
          message: "Invalid or expired token"
        });
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, role: true, emailVerified: true }
      });
      if (!dbUser) {
        return Res.status(401).json({
          message: "User not found"
        });
      }
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role ?? "STUDENT" /* STUDENT */,
        emailVerified: dbUser.emailVerified
      };
      const normalizedAllowedRoles = roles.map((role) => role.toUpperCase());
      if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes((req.user?.role ?? "").toUpperCase())) {
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

// src/app/Module/Tutors/tutor.service.ts
var updateTutorProfile = async (data, userId, slots) => {
  let categoryIdToUse = data.categoryId;
  if (data.categoryName && !categoryIdToUse) {
    const catName = String(data.categoryName ?? "").trim();
    const low = catName.toLowerCase();
    if (catName && low !== "unknown" && low !== "undefined" && low !== "null") {
      const category = await prisma.category.findFirst({ where: { name: catName } });
      if (!category) throw new Error("Category does not exist");
      categoryIdToUse = category.id;
    }
  }
  const { name, phone, image, categoryName, categoryId, ...tutorFields } = data;
  if (name !== void 0 || phone !== void 0 || image !== void 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...name !== void 0 && { name },
        ...phone !== void 0 && { phone },
        ...image !== void 0 && { image }
      }
    });
  }
  let result;
  const existingProfile = await prisma.tutorProfile.findUnique({ where: { userId } });
  const fields = { ...tutorFields };
  if (fields.experience !== void 0) fields.experience = String(fields.experience);
  if (fields.price !== void 0) fields.price = Number(fields.price);
  if (categoryIdToUse) fields.categoryId = categoryIdToUse;
  const slotsPayload = Array.isArray(slots) ? slots.map((s) => ({
    date: new Date(s.date),
    startTime: /* @__PURE__ */ new Date(`${s.date}T${s.startTime}:00Z`),
    endTime: /* @__PURE__ */ new Date(`${s.date}T${s.endTime}:00Z`)
  })) : void 0;
  if (existingProfile) {
    result = await prisma.tutorProfile.update({
      where: { userId },
      data: {
        ...fields,
        ...slotsPayload && {
          // optionally, you might want to clear old slots or just add. 
          // Let's add them to the existing slots for simplicity
          tutorSlots: { create: slotsPayload }
        }
      },
      include: { tutorSlots: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, category: true }
    });
  } else {
    if (!fields.bio) fields.bio = "";
    if (fields.price === void 0) fields.price = 0;
    if (!fields.experience) fields.experience = "";
    result = await prisma.tutorProfile.create({
      data: {
        ...fields,
        userId,
        ...slotsPayload && {
          tutorSlots: { create: slotsPayload }
        }
      },
      include: { tutorSlots: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, category: true }
    });
  }
  return result;
};
var getAlltetutor = async (payload) => {
  const filters = { status: "ACTIVE" };
  if (payload.search) {
    const maybeNumber = Number(payload.search);
    filters.OR = [
      { bio: { contains: payload.search, mode: "insensitive" } },
      { experience: { contains: payload.search, mode: "insensitive" } },
      ...!isNaN(maybeNumber) ? [{ rating: { gte: maybeNumber } }, { price: { lte: maybeNumber } }] : []
    ];
  }
  if (payload.categoryId) {
    filters.OR = [
      ...Array.isArray(filters.OR) ? filters.OR : [],
      { categoryId: payload.categoryId },
      { categories: { some: { categoryId: payload.categoryId } } }
    ];
  }
  if (payload.rating !== void 0) filters.rating = { gte: payload.rating };
  if (payload.price !== void 0) filters.price = { lte: payload.price };
  const page = payload.page && payload.page > 0 ? payload.page : 1;
  const limit = payload.limit && payload.limit > 0 ? payload.limit : 10;
  const skip = (page - 1) * limit;
  const total = await prisma.tutorProfile.count({ where: filters });
  const result = await prisma.tutorProfile.findMany({
    where: filters,
    skip,
    take: limit,
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } },
      tutorSlots: {
        where: { isBooked: false }
        // Only show unbooked slots
      }
    },
    orderBy: { createdAt: "desc" }
  });
  try {
    const m = prisma.tutorProfileCategory;
    if (m?.findMany) {
      const ids = result.map((x) => x.id);
      const links = await m.findMany({
        where: { tutorProfileId: { in: ids } },
        include: { category: true },
        orderBy: { order: "asc" }
      });
      const byTutor = {};
      links.forEach((l) => {
        const tid = String(l.tutorProfileId);
        (byTutor[tid] ||= []).push(l);
      });
      result.forEach((t) => {
        t.categories = (byTutor[String(t.id)] || []).slice(0, 4);
      });
    }
  } catch {
  }
  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    result
  };
};
var getTutorProfileById = async (tutorId) => {
  const result = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: {
      category: true,
      user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } },
      tutorSlots: { where: { isBooked: false } }
    }
  });
  try {
    const m = prisma.tutorProfileCategory;
    if (m?.findMany && result?.id) {
      const links = await m.findMany({
        where: { tutorProfileId: result.id },
        include: { category: true },
        orderBy: { order: "asc" }
      });
      result.categories = links.slice(0, 4);
    }
  } catch {
  }
  return result;
};
var getCategoriesAll = async () => await prisma.category.findMany();
var creaCategory = async (category) => {
  if (!category?.name?.trim()) throw new Error("Category name is required");
  const nameTrimmed = category.name.trim();
  const low = nameTrimmed.toLowerCase();
  if (low === "unknown" || low === "undefined" || low === "null") {
    throw new Error("Category name is invalid");
  }
  let created = await prisma.category.findFirst({ where: { name: nameTrimmed } });
  if (!created) {
    created = await prisma.category.create({ data: { name: nameTrimmed } });
  }
  return created;
};
var deleteCategory = async (categoryId) => {
  const tutorsInCat = await prisma.tutorProfile.findFirst({ where: { categoryId } });
  if (tutorsInCat) throw new Error("Cannot delete category as it is currently assigned to one or more tutors.");
  return await prisma.category.delete({
    where: { id: categoryId }
  });
};
var getMyProfiletetutor = async (payload) => {
  return prisma.tutorProfile.findUnique({
    where: { userId: payload.userId },
    include: { category: true, user: { select: { id: true, name: true, email: true, image: true, phone: true, role: true } }, tutorSlots: true }
  });
};
var tutorServices = {
  updateTutorProfile,
  getAlltetutor,
  getTutorProfileById,
  getCategoriesAll,
  creaCategory,
  deleteCategory,
  getMyProfiletetutor
};

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch",
        error: error.message
      });
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    meta,
    data
  });
};

// src/app/Module/Tutors/tutor.controller.ts
import { StatusCodes } from "http-status-codes";
var getAlltetutor2 = catchAsync(async (req, res) => {
  const { search, categoryId, rating, price, page, limit } = req.query;
  const payload = {};
  if (typeof search === "string") payload.search = search;
  if (typeof categoryId === "string") payload.categoryId = categoryId;
  if (typeof rating === "string" && !isNaN(Number(rating))) payload.rating = Number(rating);
  if (typeof price === "string" && !isNaN(Number(price))) payload.price = Number(price);
  if (typeof page === "string" && !isNaN(Number(page))) payload.page = Number(page);
  if (typeof limit === "string" && !isNaN(Number(limit))) payload.limit = Number(limit);
  const { meta, result } = await tutorServices.getAlltetutor(payload);
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Tutors retrieved successfully",
    meta,
    data: result
  });
});
var getMytetutorProfile = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: user id missing"
    });
  }
  const profile = await tutorServices.getMyProfiletetutor({ userId: user.id });
  if (!profile) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Profile not found"
    });
  }
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "My tutor profile retrieved successfully",
    data: profile
  });
});
var updateTutorController = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized", success: false });
  const { slots, ...tutorData } = req.body;
  const result = await tutorServices.updateTutorProfile(
    tutorData,
    user.id,
    Array.isArray(slots) ? slots : void 0
  );
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Tutor profile saved successfully",
    data: result
  });
});
var getTutorProfile = catchAsync(async (req, res) => {
  const { tutorId } = req.params;
  if (!tutorId) throw new Error("TutorId is required!");
  const result = await tutorServices.getTutorProfileById(tutorId);
  if (!result) {
    return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Tutor not found" });
  }
  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Tutor retrieved successfully",
    data: result
  });
});
var TutorController = {
  updateTutorController,
  getAlltetutor: getAlltetutor2,
  getTutorProfile,
  getMytetutorProfile
};

// src/app/middleware/validateRequest.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      next(error);
    }
  };
};
var validateRequest_default = validateRequest;

// src/app/Module/Tutors/tutor.validation.ts
import { z as z2 } from "zod";
var updateTutorProfileSchema = z2.object({
  body: z2.object({
    bio: z2.string().optional(),
    price: z2.number().positive("Price must be a positive number").optional(),
    experience: z2.string().optional(),
    gender: z2.string().optional(),
    institution: z2.string().optional(),
    categoryName: z2.string().optional(),
    categoryId: z2.string().optional(),
    // Added for flexibility
    name: z2.string().optional(),
    phone: z2.string().regex(/^\+8801[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number").optional(),
    image: z2.string().url("Image must be a valid URL").optional(),
    slots: z2.array(z2.object({
      date: z2.string(),
      startTime: z2.string(),
      endTime: z2.string()
    })).optional()
  })
});
var TutorValidation = {
  updateTutorProfileSchema
};

// src/app/Module/Tutors/tutor.route.ts
var router = express.Router();
router.put(
  "/tutor/my-profile",
  auth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(TutorValidation.updateTutorProfileSchema),
  TutorController.updateTutorController
);
router.get("/tutor/my-profile", auth("TUTOR" /* TUTOR */), TutorController.getMytetutorProfile);
router.get("/tutor/profile", TutorController.getAlltetutor);
router.get("/tutor/profile/:tutorId", TutorController.getTutorProfile);
var tutorRouter = router;

// src/app/Module/Booking/booking.route.ts
import express2 from "express";

// src/app/Module/Booking/booking.service.ts
import { v4 as uuidv4 } from "uuid";

// src/app/Module/Booking/payment.utils.ts
import SSLCommerzPayment from "sslcommerz-lts";
var initSSLCommerz = () => {
  const store_id = envConfig.store_id;
  const store_passwd = envConfig.store_pass;
  const is_live = envConfig.is_live;
  return new SSLCommerzPayment(store_id, store_passwd, is_live);
};

// src/app/errors/AppError.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";
var AppError = class extends Error {
  statusCode;
  isOperational;
  constructor(statusCode = StatusCodes2.INTERNAL_SERVER_ERROR, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

// src/app/Module/Coupon/coupon.service.ts
var createCoupon = async (payload) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: payload.code.toUpperCase() }
  });
  if (existingCoupon) {
    throw new AppError(400, "Coupon code already exists");
  }
  const coupon = await prisma.coupon.create({
    data: {
      ...payload,
      code: payload.code.toUpperCase()
    }
  });
  return coupon;
};
var getAllCoupons = async () => {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
};
var deleteCoupon = async (id) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) {
    throw new AppError(404, "Coupon not found");
  }
  return await prisma.coupon.delete({ where: { id } });
};
var applyCoupon = async (code, originalPrice) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });
  if (!coupon) {
    throw new AppError(404, "Invalid coupon code");
  }
  if (coupon.expireDate < /* @__PURE__ */ new Date()) {
    throw new AppError(400, "Coupon has expired");
  }
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    throw new AppError(400, "Coupon usage limit reached");
  }
  const discountAmount = Math.round(originalPrice * (coupon.discountPercentage / 100));
  const finalPrice = Math.max(originalPrice - discountAmount, 0);
  return {
    couponId: coupon.id,
    originalPrice,
    discountAmount,
    finalPrice
  };
};
var CouponService = {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon
};

// src/app/Module/Booking/booking.service.ts
var initPaymentForExistingBooking = async (bookingId, studentId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { student: true }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.studentId !== studentId) throw new Error("Unauthorized");
  if (booking.paymentStatus === PaymentStatus.PAID) throw new Error("Booking already paid");
  if (booking.status === BookingStatus.CANCELLED) throw new Error("This booking is cancelled");
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  if (booking.createdAt < oneHourAgo && booking.paymentStatus === PaymentStatus.PENDING) {
    throw new Error("Payment window expired");
  }
  const tutorProfile = await prisma.tutorProfile.findFirst({
    where: { userId: booking.tutorId },
    select: { price: true }
  });
  const payAmount = Number(booking.paidAmount ?? tutorProfile?.price ?? 0);
  if (!Number.isFinite(payAmount) || payAmount <= 0) throw new Error("Tutor profile not found");
  const transactionId = booking.transactionId ?? `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
  if (!booking.transactionId) {
    await prisma.booking.update({ where: { id: booking.id }, data: { transactionId } });
  }
  const sslcz = initSSLCommerz();
  const data = {
    total_amount: Number(payAmount),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `http://localhost:5000/api/bookings/payment/success/${transactionId}`,
    fail_url: `http://localhost:5000/api/bookings/payment/fail/${transactionId}`,
    cancel_url: `http://localhost:5000/api/bookings/payment/cancel/${transactionId}`,
    ipn_url: `http://localhost:5000/api/bookings/payment/ipn`,
    shipping_method: "No",
    product_name: "Tutor Session",
    product_category: "Education",
    product_profile: "general",
    cus_name: booking.student?.name ?? "Student",
    cus_email: booking.student?.email ?? "student@mentorflow.com",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: booking.student?.phone ?? "01711111111"
  };
  const apiResponse = await sslcz.init(data);
  if (apiResponse?.GatewayPageURL) {
    return {
      bookingId: booking.id,
      transactionId,
      paymentUrl: apiResponse.GatewayPageURL
    };
  }
  throw new Error("Failed to initialize payment gateway");
};
var createBooking = async (payload) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: payload.tutorProfileId },
    select: { userId: true, price: true }
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  const slot = await prisma.tutorSlot.findFirst({
    where: { id: payload.slotId, tutorId: payload.tutorProfileId }
  });
  if (!slot) throw new Error("Invalid slot");
  if (slot.isBooked) throw new Error("This slot is already booked by someone else!");
  const originalPrice = Number(tutorProfile.price ?? 0);
  if (!Number.isFinite(originalPrice) || originalPrice < 0) throw new Error("Invalid tutor price");
  let couponId = null;
  let discountAmount = 0;
  let finalAmount = originalPrice;
  if (payload.couponCode && String(payload.couponCode).trim().length > 0) {
    const applied = await CouponService.applyCoupon(String(payload.couponCode).trim(), originalPrice);
    couponId = applied.couponId;
    discountAmount = Number(applied.discountAmount ?? 0);
    finalAmount = Number(applied.finalPrice);
  }
  const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        studentId: payload.studentId,
        tutorId: tutorProfile.userId,
        slotId: slot.id,
        dateTime: slot.startTime,
        status: BookingStatus.AWAITING_PAYMENT,
        paymentStatus: PaymentStatus.PENDING,
        originalAmount: Number(originalPrice),
        discountAmount: Number(discountAmount),
        paidAmount: Number(finalAmount),
        transactionId,
        ...couponId ? { couponId } : {}
      }
    });
    await tx.tutorSlot.update({
      where: { id: slot.id },
      data: { isBooked: true }
    });
    if (couponId) {
      await tx.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } }
      });
    }
    return newBooking;
  });
  const sslcz = initSSLCommerz();
  const data = {
    total_amount: Number(finalAmount),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `http://localhost:5000/api/bookings/payment/success/${transactionId}`,
    fail_url: `http://localhost:5000/api/bookings/payment/fail/${transactionId}`,
    cancel_url: `http://localhost:5000/api/bookings/payment/cancel/${transactionId}`,
    ipn_url: `http://localhost:5000/api/bookings/payment/ipn`,
    shipping_method: "No",
    product_name: "Tutor Session",
    product_category: "Education",
    product_profile: "general",
    cus_name: "Student",
    cus_email: "student@mentorflow.com",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: "01711111111"
  };
  const apiResponse = await sslcz.init(data);
  if (apiResponse?.GatewayPageURL) {
    return {
      booking,
      paymentUrl: apiResponse.GatewayPageURL
    };
  } else {
    throw new Error("Failed to initialize payment gateway");
  }
};
var processPaymentSuccess = async (transactionId) => {
  const booking = await prisma.booking.findUnique({
    where: { transactionId }
  });
  if (!booking) throw new Error("Booking not found");
  const videoCallId = `MFC-${uuidv4().substring(0, 10).toUpperCase()}`;
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: PaymentStatus.PAID,
      status: BookingStatus.PENDING_CONFIRMATION,
      videoCallId,
      videoSession: {
        sessionUrl: `https://meet.jit.si/${videoCallId}`,
        isActive: true,
        expiresAt: null
      }
    },
    include: { tutor: true, student: true }
  });
  await prisma.notification.create({
    data: {
      userId: booking.tutorId,
      title: "Booking paid",
      message: `Payment received: \u09F3${Number(booking.paidAmount ?? 0).toLocaleString()} \xB7 Session: ${booking.dateTime}. Video Room ID: ${videoCallId}`,
      transactionId,
      type: "PAYMENT",
      metadata: {
        kind: "PAYMENT",
        bookingId: booking.id,
        amount: Number(booking.paidAmount ?? 0),
        currency: "BDT"
      }
    }
  });
  return updatedBooking;
};
var handlePaymentFailOrCancel = async (transactionId) => {
  const booking = await prisma.booking.findUnique({ where: { transactionId } });
  if (!booking) return;
  await prisma.$transaction(async (tx) => {
    if (booking.slotId) {
      await tx.tutorSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
    }
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED
      }
    });
  });
};
var updateBookingStatus = async (bookingId, newStatus, userId, role) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  let updatedBooking;
  if (newStatus === "CONFIRMED" && booking.paymentStatus !== PaymentStatus.PAID) {
    throw new Error("Cannot confirm booking because payment has failed or is pending.");
  }
  if (role === "ADMIN" /* ADMIN */) {
    updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: { tutor: true, student: true }
    });
  } else if (role === "TUTOR" /* TUTOR */ && (newStatus === "COMPLETED" || newStatus === "RESCHEDULED" || newStatus === "CONFIRMED")) {
    if (booking.tutorId !== userId) throw new Error("Unauthorized");
    updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: { tutor: true, student: true }
    });
    await prisma.notification.create({
      data: {
        userId: booking.studentId,
        title: `Booking Status: ${newStatus}`,
        message: `Your booking was marked as ${newStatus} by your tutor.`,
        transactionId: booking.transactionId
      }
    });
  } else if (role === "STUDENT" /* STUDENT */ && (newStatus === "CANCELLED" || newStatus === "ATTENDED")) {
    if (booking.studentId !== userId) throw new Error("Unauthorized");
    if (newStatus === "CANCELLED") {
      const timeDifferenceInHours = (new Date(booking.dateTime).getTime() - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60);
      if (timeDifferenceInHours < 1) {
        throw new Error("You cannot cancel a booking less than 1 hour before the start time.");
      }
      if (booking.paymentStatus === "PAID") {
        updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: newStatus,
            paymentStatus: PaymentStatus.REFUND_REQUESTED
          },
          include: { tutor: true, student: true }
        });
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" /* ADMIN */ } });
        if (admin) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              title: "Refund Requested",
              message: `Student requested a refund for transaction ${booking.transactionId}`,
              transactionId: booking.transactionId
            }
          });
        }
      } else {
        updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: newStatus },
          include: { tutor: true, student: true }
        });
      }
    } else {
      updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: newStatus },
        include: { tutor: true, student: true }
      });
    }
  } else {
    throw new Error("Unauthorized status change");
  }
  if (newStatus === "COMPLETED" && updatedBooking) {
    await prisma.notification.create({
      data: {
        userId: updatedBooking.studentId,
        title: "Session Completed - Please Review!",
        message: `How was your session? Please leave a review for ${updatedBooking.tutor.name}!`,
        transactionId: updatedBooking.transactionId
      }
    });
  }
  return updatedBooking;
};
var handleMutualConfirmation = async (bookingId, userId, role) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus !== PaymentStatus.PAID) {
    throw new Error("Cannot confirm mutually because payment has failed or is pending.");
  }
  let confirmationData = typeof booking.mutualConfirmation === "object" && booking.mutualConfirmation !== null ? booking.mutualConfirmation : { tutorConfirmed: false, studentConfirmed: false };
  if (role === "TUTOR" /* TUTOR */ && booking.tutorId === userId) {
    confirmationData.tutorConfirmed = true;
  } else if (role === "STUDENT" /* STUDENT */ && booking.studentId === userId) {
    confirmationData.studentConfirmed = true;
  } else {
    throw new Error("Unauthorized confirmation");
  }
  let videoSessionData = booking.videoSession ?? { sessionUrl: null, isActive: false, expiresAt: null };
  if (confirmationData.tutorConfirmed && confirmationData.studentConfirmed) {
    const sessionUrl = `https://meet.jit.si/MentorFlow_${booking.id}_${Date.now()}`;
    const expiresAt = new Date(booking.dateTime);
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);
    videoSessionData = {
      sessionUrl,
      isActive: true,
      expiresAt
    };
  }
  const nextStatus = confirmationData.tutorConfirmed && confirmationData.studentConfirmed ? BookingStatus.CONFIRMED : booking.status === BookingStatus.RESCHEDULED ? BookingStatus.PENDING_CONFIRMATION : booking.status;
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      mutualConfirmation: confirmationData,
      videoSession: videoSessionData,
      status: nextStatus
    }
  });
};
var attendVideoCall = async (bookingId, userId, role) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus !== PaymentStatus.PAID) {
    throw new Error("Payment not completed yet");
  }
  const now = Date.now();
  const start = new Date(booking.dateTime).getTime();
  const joinWindowStart = start - 10 * 60 * 1e3;
  const joinWindowEnd = start + 60 * 60 * 1e3;
  if (now < joinWindowStart) {
    throw new Error("Join Call will be available 10 minutes before the booking time");
  }
  if (now > joinWindowEnd) {
    throw new Error("This call window has ended");
  }
  let confirmationData = typeof booking.mutualConfirmation === "object" && booking.mutualConfirmation !== null ? booking.mutualConfirmation : { tutorConfirmed: false, studentConfirmed: false };
  if (role === "TUTOR" /* TUTOR */ && booking.tutorId === userId) {
    confirmationData.tutorConfirmed = true;
  } else if (role === "STUDENT" /* STUDENT */ && booking.studentId === userId) {
    confirmationData.studentConfirmed = true;
  } else {
    throw new Error("Unauthorized attendance");
  }
  let videoSessionData = booking.videoSession ?? { sessionUrl: null, isActive: false, expiresAt: null };
  const existingUrl = videoSessionData?.sessionUrl;
  if (!existingUrl) {
    videoSessionData.sessionUrl = `https://meet.jit.si/MentorFlow_${booking.id}_${Date.now()}`;
  }
  if (confirmationData.tutorConfirmed && confirmationData.studentConfirmed) {
    const expiresAt = new Date(booking.dateTime);
    expiresAt.setMinutes(expiresAt.getMinutes() + 60);
    videoSessionData = {
      ...videoSessionData,
      isActive: true,
      expiresAt
    };
  }
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      mutualConfirmation: confirmationData,
      videoSession: videoSessionData,
      status: confirmationData.tutorConfirmed && confirmationData.studentConfirmed ? BookingStatus.CONFIRMED : booking.status
    },
    include: { tutor: true, student: true }
  });
  const otherUserId = role === "TUTOR" /* TUTOR */ ? updated.studentId : updated.tutorId;
  await prisma.notification.create({
    data: {
      userId: otherUserId,
      title: "Video Call Attended",
      message: `${role} joined the call for booking ${updated.transactionId ?? updated.id}.`,
      transactionId: updated.transactionId ?? null
    }
  });
  return updated;
};
var rescheduleBooking = async (bookingId, dateTimeISO, userId, role) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (role === "TUTOR" /* TUTOR */ && booking.tutorId !== userId) throw new Error("Unauthorized");
  const newDate = new Date(dateTimeISO);
  if (Number.isNaN(newDate.getTime())) throw new Error("Invalid dateTime");
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      dateTime: newDate,
      status: BookingStatus.RESCHEDULED,
      mutualConfirmation: { tutorConfirmed: false, studentConfirmed: false },
      videoSession: { sessionUrl: null, isActive: false, expiresAt: null }
    },
    include: { tutor: true, student: true }
  });
  await prisma.notification.create({
    data: {
      userId: updated.studentId,
      title: "Booking Rescheduled",
      message: `Your booking has been rescheduled to ${newDate.toISOString()}.`,
      transactionId: updated.transactionId ?? null
    }
  });
  return updated;
};
var processRefund = async (bookingId) => {
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: PaymentStatus.REFUND_PROCESSED }
  });
  await prisma.notification.create({
    data: {
      userId: updated.studentId,
      title: "Refund Processed",
      message: `Your refund for transaction ${updated.transactionId} has been fully processed.`,
      transactionId: updated.transactionId
    }
  });
  return updated;
};
var getAllbooking = async () => prisma.booking.findMany({ include: { tutor: true, student: true } });
var getSingleBooking = async (bookingId, role, userId) => {
  const b = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!b) return null;
  if (role === "ADMIN" /* ADMIN */) return b;
  if (role === "STUDENT" /* STUDENT */ && b.studentId === userId) return b;
  if (role === "TUTOR" /* TUTOR */ && b.tutorId === userId) return b;
  throw new Error("Unauthorized access");
};
var getMyBooking = async (userId) => prisma.booking.findMany({ where: { studentId: userId }, orderBy: { dateTime: "desc" }, include: { tutor: true } });
var getMyTutorBookings = async (userId) => prisma.booking.findMany({ where: { tutorId: userId }, orderBy: { dateTime: "desc" }, include: { student: true } });
var adminDeleteBooking = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, slotId: true, couponId: true }
  });
  if (!booking) throw new Error("Booking not found");
  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { bookingId: booking.id } });
    if (booking.slotId) {
      await tx.tutorSlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      }).catch(() => null);
    }
    if (booking.couponId) {
      const c = await tx.coupon.findUnique({ where: { id: booking.couponId }, select: { usageCount: true } });
      if (c && Number(c.usageCount ?? 0) > 0) {
        await tx.coupon.update({
          where: { id: booking.couponId },
          data: { usageCount: { decrement: 1 } }
        });
      }
    }
    await tx.booking.delete({ where: { id: booking.id } });
  });
  return { id: booking.id };
};
var getCategorizedBookings = async (userId, role) => {
  let whereCondition = {};
  if (role === "STUDENT" /* STUDENT */) {
    whereCondition = { studentId: userId };
  } else if (role === "TUTOR" /* TUTOR */) {
    whereCondition = { tutorId: userId };
  } else {
    throw new Error("Invalid user role for categorization");
  }
  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    include: {
      tutor: { select: { id: true, name: true, email: true, image: true } },
      student: { select: { id: true, name: true, email: true, image: true } }
    },
    orderBy: { dateTime: "desc" }
  });
  const now = (/* @__PURE__ */ new Date()).getTime();
  const SESSION_DURATION_MS = 60 * 60 * 1e3;
  const upcoming = [];
  const live = [];
  const past = [];
  bookings.forEach((booking) => {
    const bookingStart = new Date(booking.dateTime).getTime();
    const bookingEnd = bookingStart + SESSION_DURATION_MS;
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      past.push(booking);
    } else if (now < bookingStart) {
      upcoming.push(booking);
    } else if (now >= bookingStart && now <= bookingEnd) {
      live.push(booking);
    } else {
      past.push(booking);
    }
  });
  return {
    upcoming,
    live,
    past
  };
};
var bookingServices = {
  getCategorizedBookings,
  createBooking,
  initPaymentForExistingBooking,
  processPaymentSuccess,
  handlePaymentFailOrCancel,
  updateBookingStatus,
  adminDeleteBooking,
  handleMutualConfirmation,
  attendVideoCall,
  rescheduleBooking,
  processRefund,
  getAllbooking,
  getSingleBooking,
  getMyBooking,
  getMyTutorBookings
};

// src/app/Module/Booking/booking.controller.ts
var createBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { tutorProfileId, slotId, couponCode } = req.body;
    const bookingResult = await bookingServices.createBooking({
      studentId: user.id,
      tutorProfileId,
      slotId,
      couponCode
    });
    res.status(200).json({ success: true, data: bookingResult });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var payBooking = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, error: "Unauthorized" });
    const bookingId = req.params.bookingId;
    const result = await bookingServices.initPaymentForExistingBooking(bookingId, user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var paymentSuccess = async (req, res) => {
  try {
    const tranId = req.params.tranId;
    await bookingServices.processPaymentSuccess(tranId);
    res.redirect(`http://localhost:3000/payment/success?transactionId=${tranId}`);
  } catch (err) {
    res.redirect(`http://localhost:3000/payment/fail?reason=${err.message}`);
  }
};
var paymentFail = async (req, res) => {
  try {
    const tranId = req.params.tranId;
    await bookingServices.handlePaymentFailOrCancel(tranId);
    res.redirect(`http://localhost:3000/payment/fail?transactionId=${tranId}`);
  } catch (err) {
    res.redirect(`http://localhost:3000/payment/fail`);
  }
};
var paymentCancel = async (req, res) => {
  try {
    const tranId = req.params.tranId;
    await bookingServices.handlePaymentFailOrCancel(tranId);
    res.redirect(`http://localhost:3000/payment/cancel?transactionId=${tranId}`);
  } catch (err) {
    res.redirect(`http://localhost:3000/payment/cancel`);
  }
};
var paymentIpn = async (req, res) => {
  try {
    const ipnData = req.body;
    if (ipnData && ipnData.status === "VALID" && ipnData.tran_id) {
      await bookingServices.processPaymentSuccess(ipnData.tran_id);
    } else if (ipnData && (ipnData.status === "FAILED" || ipnData.status === "CANCELLED") && ipnData.tran_id) {
      await bookingServices.handlePaymentFailOrCancel(ipnData.tran_id);
    }
    res.status(200).json({ message: "IPN Received" });
  } catch (err) {
    res.status(400).json({ message: "IPN Error", error: err.message });
  }
};
var mutualConfirm = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");
    const bookingId = req.params.bookingId;
    const result = await bookingServices.handleMutualConfirmation(
      bookingId,
      user.id,
      user.role
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var attendVideoCall2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");
    const bookingId = req.params.bookingId;
    const result = await bookingServices.attendVideoCall(bookingId, user.id, user.role);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var rescheduleBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");
    const bookingId = req.params.bookingId;
    const { dateTime } = req.body;
    const result = await bookingServices.rescheduleBooking(bookingId, String(dateTime), user.id, user.role);
    res.status(200).json({ success: true, data: result, message: "Booking rescheduled" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var processRefund2 = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const result = await bookingServices.processRefund(bookingId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getAllBooking = async (req, res) => {
  try {
    const result = await bookingServices.getAllbooking();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getIdByBooking = async (req, res) => {
  try {
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw;
    const user = req.user;
    if (!user) throw new Error("Unauthorized: user not found");
    const result = await bookingServices.getSingleBooking(bookingId, user.role, user.id);
    if (!result) return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getMyBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await bookingServices.getMyBooking(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
var getMyTutorBookings2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized: user not found");
    const result = await bookingServices.getMyTutorBookings(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var changeBookingStatus = async (req, res) => {
  try {
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw;
    const user = req.user;
    if (!user) throw new Error("Unauthorized: user not found");
    const bookingStatus = req.body.status;
    if (!bookingId) throw new Error("BookingId is required!");
    const result = await bookingServices.updateBookingStatus(bookingId, bookingStatus, user.id, user.role);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var adminDeleteBooking2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized: user not found");
    if (user.role !== "ADMIN" /* ADMIN */) throw new Error("Unauthorized");
    const bookingIdRaw = req.params.bookingId;
    const bookingId = Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw;
    if (!bookingId) throw new Error("BookingId is required!");
    const result = await bookingServices.adminDeleteBooking(bookingId);
    res.status(200).json({ success: true, data: result, message: "Booking deleted" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var getCategorizedBookings2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("Unauthorized: user not found");
    const result = await bookingServices.getCategorizedBookings(user.id, user.role);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var bookingController = {
  getCategorizedBookings: getCategorizedBookings2,
  createBooking: createBooking2,
  payBooking,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
  mutualConfirm,
  attendVideoCall: attendVideoCall2,
  rescheduleBooking: rescheduleBooking2,
  processRefund: processRefund2,
  getAllBooking,
  getIdByBooking,
  getMyBooking: getMyBooking2,
  getMyTutorBookings: getMyTutorBookings2,
  changeBookingStatus,
  adminDeleteBooking: adminDeleteBooking2
};

// src/app/Module/Booking/booking.validation.ts
import { z as z3 } from "zod";
var createBookingZodSchema = z3.object({
  body: z3.object({
    tutorProfileId: z3.string({ message: "Tutor Profile ID is required" }),
    slotId: z3.string({ message: "Slot ID is required" }),
    couponCode: z3.string().optional()
  })
});
var changeBookingStatusZodSchema = z3.object({
  body: z3.object({
    status: z3.nativeEnum(BookingStatus, {
      message: "Booking Status is required"
    })
  })
});
var rescheduleBookingZodSchema = z3.object({
  body: z3.object({
    dateTime: z3.string().min(1, "dateTime is required (ISO string)")
  })
});
var BookingValidation = {
  createBookingZodSchema,
  changeBookingStatusZodSchema,
  rescheduleBookingZodSchema
};

// src/app/Module/Booking/booking.route.ts
var router2 = express2.Router();
router2.post("/bookings/payment/success/:tranId", bookingController.paymentSuccess);
router2.post("/bookings/payment/fail/:tranId", bookingController.paymentFail);
router2.post("/bookings/payment/cancel/:tranId", bookingController.paymentCancel);
router2.post("/bookings/payment/ipn", bookingController.paymentIpn);
router2.post(
  "/bookings",
  auth("STUDENT" /* STUDENT */),
  validateRequest_default(BookingValidation.createBookingZodSchema),
  bookingController.createBooking
);
router2.post(
  "/bookings/:bookingId/pay",
  auth("STUDENT" /* STUDENT */),
  bookingController.payBooking
);
router2.get("/all/bookings", auth("ADMIN" /* ADMIN */), bookingController.getAllBooking);
router2.get("/my/bookings/categorized", auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */), bookingController.getCategorizedBookings);
router2.get("/my/bookings", auth("STUDENT" /* STUDENT */), bookingController.getMyBooking);
router2.get("/my/bookings/tutor", auth("TUTOR" /* TUTOR */), bookingController.getMyTutorBookings);
router2.get("/bookings/:bookingId", auth("ADMIN" /* ADMIN */, "STUDENT" /* STUDENT */), bookingController.getIdByBooking);
router2.delete("/bookings/:bookingId", auth("ADMIN" /* ADMIN */), bookingController.adminDeleteBooking);
router2.patch(
  "/bookings/:bookingId",
  auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(BookingValidation.changeBookingStatusZodSchema),
  bookingController.changeBookingStatus
);
router2.patch("/bookings/:bookingId/confirm", auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */), bookingController.mutualConfirm);
router2.patch(
  "/bookings/:bookingId/attend",
  auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  bookingController.attendVideoCall
);
router2.patch(
  "/bookings/:bookingId/reschedule",
  auth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(BookingValidation.rescheduleBookingZodSchema),
  bookingController.rescheduleBooking
);
router2.patch("/bookings/:bookingId/refund", auth("ADMIN" /* ADMIN */), bookingController.processRefund);
var StudentBookingRouter = router2;

// src/app/Module/User/user.route.ts
import express3 from "express";

// src/app/Module/User/user.service.ts
import { StatusCodes as StatusCodes3 } from "http-status-codes";
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
var getBasicUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      tutorProfile: {
        select: {
          id: true,
          price: true,
          rating: true,
          totalReviews: true,
          category: { select: { id: true, name: true, icon: true } }
        }
      },
      studentProfile: {
        select: {
          id: true,
          grade: true,
          interests: true,
          gender: true,
          institution: true
        }
      }
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
var updateTutorProfileStatus = async (userId, status) => {
  const profile = await prisma.tutorProfile.findUnique({ where: { userId }, select: { userId: true } });
  if (!profile) throw new Error("Tutor profile not found");
  return await prisma.tutorProfile.update({
    where: { userId },
    data: { status },
    select: { userId: true, status: true, updatedAt: true }
  });
};
var deleteUserByAdmin = async (userId) => {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) throw new Error("User not found");
  await prisma.user.delete({ where: { id: userId } });
  return { id: userId };
};
var createStudentProfile = async (data, userId) => {
  const existingStudent = await prisma.studentProfile.findUnique({
    where: { userId }
  });
  if (existingStudent) {
    throw new AppError(StatusCodes3.CONFLICT, "Student profile already exists for this user.");
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
var getDashboardAnalytics = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTutors,
    totalAdmins,
    activeUsers,
    inactiveUsers,
    bandUsers,
    totalStudentProfiles,
    totalTutorProfiles,
    totalBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    attendedBookings,
    rescheduledBookings,
    totalReviews,
    totalCategories,
    totalTutorSlots,
    bookedTutorSlots
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "INACTIVE" } }),
    prisma.user.count({ where: { status: "BAND" } }),
    prisma.studentProfile.count(),
    prisma.tutorProfile.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.count({ where: { status: "ATTENDED" } }),
    prisma.booking.count({ where: { status: "RESCHEDULED" } }),
    prisma.review.count(),
    prisma.category.count(),
    prisma.tutorSlot.count(),
    prisma.tutorSlot.count({ where: { isBooked: true } })
  ]);
  const userRoleSplit = [
    { role: "STUDENT", value: totalStudents },
    { role: "TUTOR", value: totalTutors },
    { role: "ADMIN", value: totalAdmins }
  ];
  const bookingStatusSplit = [
    { status: "CONFIRMED", value: confirmedBookings },
    { status: "COMPLETED", value: completedBookings },
    { status: "CANCELLED", value: cancelledBookings },
    { status: "ATTENDED", value: attendedBookings },
    { status: "RESCHEDULED", value: rescheduledBookings }
  ];
  return {
    users: {
      total: totalUsers,
      byRole: {
        students: totalStudents,
        tutors: totalTutors,
        admins: totalAdmins
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
        band: bandUsers
      }
    },
    profiles: {
      students: totalStudentProfiles,
      tutors: totalTutorProfiles
    },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      attended: attendedBookings,
      rescheduled: rescheduledBookings,
      byStatus: bookingStatusSplit
    },
    reviews: {
      total: totalReviews
    },
    categories: {
      total: totalCategories
    },
    tutorSlots: {
      total: totalTutorSlots,
      booked: bookedTutorSlots,
      available: totalTutorSlots - bookedTutorSlots
    },
    charts: {
      userRoleSplit,
      bookingStatusSplit
    }
  };
};
var updateMyProfile = async (payload, userId, role) => {
  const { name, phone, image, grade, interests, bio, price, experience, categoryId, categoryIds, tutorStatus, gender, institution } = payload;
  const pendingCategoryIds = role === "TUTOR" && Array.isArray(categoryIds) ? categoryIds.filter(Boolean).slice(0, 4) : null;
  const updated = await prisma.$transaction(async (tx) => {
    if (name || phone || image !== void 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...name && { name },
          ...phone && { phone },
          ...image !== void 0 && { image }
        }
      });
    }
    if (role === "STUDENT") {
      const studentProfileData = {};
      if (grade !== void 0) studentProfileData.grade = grade;
      if (interests !== void 0) studentProfileData.interests = interests;
      if (gender !== void 0) studentProfileData.gender = gender;
      if (institution !== void 0) studentProfileData.institution = institution;
      if (Object.keys(studentProfileData).length > 0) {
        await tx.studentProfile.update({
          where: { userId },
          data: studentProfileData
        });
      }
    } else if (role === "TUTOR") {
      await tx.tutorProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          bio: "",
          experience: "",
          price: 0
        }
      });
      const tutorProfileData = {};
      if (bio !== void 0) tutorProfileData.bio = bio;
      if (price !== void 0) tutorProfileData.price = price;
      if (experience !== void 0) tutorProfileData.experience = experience;
      const ids = pendingCategoryIds;
      const primary = ids && ids.length > 0 ? ids[0] : categoryId !== void 0 && categoryId !== "" ? categoryId : void 0;
      if (primary !== void 0) tutorProfileData.categoryId = primary;
      if (gender !== void 0) tutorProfileData.gender = gender;
      if (institution !== void 0) tutorProfileData.institution = institution;
      if (tutorStatus !== void 0) tutorProfileData.status = tutorStatus;
      if (Object.keys(tutorProfileData).length > 0) {
        await tx.tutorProfile.upsert({
          where: { userId },
          update: tutorProfileData,
          create: {
            userId,
            bio: typeof tutorProfileData.bio === "string" ? tutorProfileData.bio : "",
            experience: typeof tutorProfileData.experience === "string" ? tutorProfileData.experience : "",
            price: Number.isFinite(Number(tutorProfileData.price)) ? Number(tutorProfileData.price) : 0,
            ...tutorProfileData.gender !== void 0 ? { gender: tutorProfileData.gender } : {},
            ...tutorProfileData.institution !== void 0 ? { institution: tutorProfileData.institution } : {},
            ...tutorProfileData.categoryId !== void 0 ? { categoryId: tutorProfileData.categoryId } : {}
          }
        });
      }
    }
    const updated2 = await tx.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: role === "STUDENT",
        tutorProfile: role === "TUTOR" ? { include: { category: true } } : false
      }
    });
    if (role === "TUTOR" && updated2?.tutorProfile?.id) {
      const tutorProfileId = String(updated2.tutorProfile.id);
      try {
        const m = tx.tutorProfileCategory;
        if (m?.findMany) {
          const rows = await m.findMany({
            where: { tutorProfileId },
            include: { category: true },
            orderBy: { order: "asc" }
          });
          updated2.tutorProfile.categories = rows;
        }
      } catch {
      }
    }
    return updated2;
  });
  if (role === "TUTOR" && pendingCategoryIds) {
    const tutorProfileId = updated?.tutorProfile?.id ? String(updated.tutorProfile.id) : null;
    if (tutorProfileId) {
      try {
        const m = prisma.tutorProfileCategory;
        if (m?.deleteMany && m?.createMany) {
          await m.deleteMany({ where: { tutorProfileId } });
          if (pendingCategoryIds.length > 0) {
            await m.createMany({
              data: pendingCategoryIds.map((cid, idx) => ({
                tutorProfileId,
                categoryId: cid,
                order: idx
              }))
            });
          }
        }
      } catch {
      }
    }
  }
  return updated;
};
var getMyProfile = async (userId, role) => {
  const base = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: role === "STUDENT",
      tutorProfile: role === "TUTOR" ? { include: { category: true } } : false
    }
  });
  if (role === "TUTOR" && base?.tutorProfile?.id) {
    const tutorProfileId = String(base.tutorProfile.id);
    try {
      const m = prisma.tutorProfileCategory;
      if (m?.findMany) {
        const rows = await m.findMany({
          where: { tutorProfileId },
          include: { category: true },
          orderBy: { order: "asc" }
        });
        base.tutorProfile.categories = rows;
      }
    } catch {
    }
  }
  return base;
};
var UserServices = {
  AllUser,
  getSingleUser,
  getBasicUserById,
  updateUserStatus,
  updateTutorProfileStatus,
  deleteUserByAdmin,
  getDashboardAnalytics,
  getMyProfile,
  updateMyProfile,
  createStudentProfile,
  getStudentProfile,
  getAllStudentProfiles
};

// src/app/Module/User/user.controller.ts
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
var getBasicUserController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "User id is required" });
    const result = await UserServices.getBasicUserById(id);
    if (!result) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
var updateTutorProfileStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorStatus } = req.body;
    const allowed = ["ACTIVE", "INACTIVE", "PENDING", "BANNED"];
    if (!allowed.includes(String(tutorStatus))) throw new Error("Invalid tutorStatus value");
    const result = await UserServices.updateTutorProfileStatus(id, tutorStatus);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var deleteUserByAdminController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserServices.deleteUserByAdmin(id);
    res.status(200).json({ success: true, message: "User deleted successfully", data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
var getDashboardAnalytics2 = async (req, res) => {
  try {
    const result = await UserServices.getDashboardAnalytics();
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
var getMyProfileController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await UserServices.getMyProfile(user.id, user.role);
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully!",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var updateMyProfileController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const result = await UserServices.updateMyProfile(
      req.body,
      user.id,
      user.role
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
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
  getBasicUserController,
  updateUserStatusController,
  updateTutorProfileStatusController,
  deleteUserByAdminController,
  StudentProfileCreate,
  getStudentProfile: getStudentProfile2,
  getAllStudentProfiles: getAllStudentProfiles2,
  getDashboardAnalytics: getDashboardAnalytics2,
  updateMyProfile: updateMyProfileController,
  getMyProfileController
};

// src/app/Module/User/user.validation.ts
import { z as z4 } from "zod";
var ProfileUpdateValidationSchema = z4.object({
  body: z4.object({
    // User fields
    name: z4.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z4.string().regex(/^(?:\+88)?01\d{9}$/, "Phone number must be a valid Bangladeshi number starting with 01").transform((val) => val.startsWith("+88") ? val : `+88${val}`).optional(),
    image: z4.string().url("Invalid image URL").optional().or(z4.literal("")),
    // Student fields
    grade: z4.string().optional(),
    interests: z4.string().optional(),
    // Tutor fields
    bio: z4.string().optional(),
    price: z4.number().min(0, "Price must be a positive number").optional(),
    experience: z4.string().optional(),
    categoryId: z4.string().uuid("Invalid category ID").optional().or(z4.literal("")),
    categoryIds: z4.array(z4.string().uuid("Invalid category ID")).max(4, "You can select up to 4 categories").optional(),
    tutorStatus: z4.enum(["ACTIVE", "INACTIVE", "PENDING", "BANNED"]).optional(),
    // Shared generic fields (both Tutor & Student)
    gender: z4.string().optional(),
    institution: z4.string().optional()
  }).strict()
});

// src/app/Module/User/user.route.ts
var router3 = express3.Router();
router3.get("/admin/users", auth("ADMIN" /* ADMIN */), UserController.getUser);
router3.get("/admin/users/:id", auth("ADMIN" /* ADMIN */), UserController.getSingleUserController);
router3.patch("/admin/users/:id", auth("ADMIN" /* ADMIN */), UserController.updateUserStatusController);
router3.patch("/admin/users/:id/tutor-status", auth("ADMIN" /* ADMIN */), UserController.updateTutorProfileStatusController);
router3.delete("/admin/users/:id", auth("ADMIN" /* ADMIN */), UserController.deleteUserByAdminController);
router3.get("/admin/dashboard/analytics", auth("ADMIN" /* ADMIN */), UserController.getDashboardAnalytics);
router3.patch(
  "/my-profile",
  auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(ProfileUpdateValidationSchema),
  UserController.updateMyProfile
);
router3.get(
  "/my-profile",
  auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  UserController.getMyProfileController
);
router3.get(
  "/users/basic/:id",
  auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  UserController.getBasicUserController
);
var userRouter = router3;

// src/app/Module/Review/Review.route.ts
import express4 from "express";

// src/app/Module/Review/Review.service.ts
var PostReview = async (data) => {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can only submit a review for completed sessions.");
  }
  if (booking.studentId !== data.studentId) {
    throw new Error("Only the student of this booking can review the session.");
  }
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this booking!");
  }
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...data,
        isVerified: true
      }
    });
    const agg = await tx.review.aggregate({
      where: { tutorId: data.tutorId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await tx.tutorProfile.update({
      where: { userId: data.tutorId },
      data: {
        rating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating ?? 0
      }
    });
    return review;
  });
};
var GetReviewByBookingId = async (bookingId) => {
  return await prisma.review.findUnique({
    where: { bookingId },
    include: { student: true, tutor: true }
  });
};
var GetReviewsByBookingIds = async (bookingIds) => {
  const ids = Array.isArray(bookingIds) ? bookingIds.filter((x) => typeof x === "string" && x.length > 5) : [];
  if (ids.length === 0) return [];
  return prisma.review.findMany({
    where: { bookingId: { in: ids } },
    select: { bookingId: true }
  });
};
var AllUserReview = async () => {
  return await prisma.review.findMany({
    include: { student: true, tutor: true, booking: true },
    orderBy: { createdAt: "desc" }
  });
};
var GetReviewByTutorId = async (tutorId) => {
  return await prisma.review.findMany({
    where: { tutorId },
    include: {
      student: { select: { name: true, email: true, image: true } },
      booking: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var GetMyReviews = async (studentId) => {
  return await prisma.review.findMany({
    where: { studentId },
    include: {
      tutor: { select: { name: true, email: true, image: true } },
      booking: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var DeleteReview = async (reviewId) => {
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Review not found");
    const deletedReview = await tx.review.delete({ where: { id: reviewId } });
    const agg = await tx.review.aggregate({
      where: { tutorId: review.tutorId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await tx.tutorProfile.update({
      where: { userId: review.tutorId },
      data: {
        rating: agg._avg.rating ?? 0,
        totalReviews: agg._count.rating ?? 0
      }
    });
    return deletedReview;
  });
};
var ReviewServices = {
  AllUserReview,
  PostReview,
  GetReviewByBookingId,
  GetReviewsByBookingIds,
  GetReviewByTutorId,
  GetMyReviews,
  DeleteReview
};

// src/app/Module/Review/Review.controller.ts
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
var GetReviewsByBookingIds2 = async (req, res) => {
  try {
    const body = req.body ?? {};
    const bookingIds = Array.isArray(body.bookingIds) ? body.bookingIds : [];
    const result = await ReviewServices.GetReviewsByBookingIds(bookingIds);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var GetTutorReviews = async (req, res) => {
  try {
    let { tutorId } = req.params;
    const user = req.user;
    if (tutorId === "me" && user) {
      tutorId = user.id;
    }
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
var GetMyGivenReviews = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ success: false, error: "Unauthorized" });
    }
    const result = await ReviewServices.GetMyReviews(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var DeleteReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId) throw new Error("Review ID is required");
    const result = await ReviewServices.DeleteReview(reviewId);
    res.status(200).json({ success: true, data: result, message: "Review deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
var ReviewController = {
  ReviewPost,
  GetAllReviews,
  GetReviewByBookingId: GetReviewByBookingId2,
  GetReviewsByBookingIds: GetReviewsByBookingIds2,
  GetTutorReviews,
  GetMyGivenReviews,
  DeleteReviewAdmin
};

// src/app/Module/Review/Review.validation.ts
import { z as z5 } from "zod";
var createReviewZodSchema = z5.object({
  body: z5.object({
    rating: z5.number({ message: "Rating is required" }).min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating cannot proceed 5" }),
    comment: z5.string({ message: "Comment is required" }).min(5, { message: "Comment must be at least 5 characters" }),
    bookingId: z5.string({ message: "Booking ID is required" }),
    tutorId: z5.string({ message: "Tutor ID is required" })
  })
});
var ReviewValidation = {
  createReviewZodSchema
};

// src/app/Module/Review/Review.route.ts
var router4 = express4.Router();
router4.get("/reviews", ReviewController.GetAllReviews);
router4.get("/reviews/tutor/:tutorId", auth("TUTOR" /* TUTOR */, "STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */), ReviewController.GetTutorReviews);
router4.get("/reviews/student/me", auth("STUDENT" /* STUDENT */), ReviewController.GetMyGivenReviews);
router4.get("/reviews/booking/:bookingId", auth(), ReviewController.GetReviewByBookingId);
router4.post("/reviews/by-bookings", auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), ReviewController.GetReviewsByBookingIds);
router4.post(
  "/reviews",
  auth("STUDENT" /* STUDENT */),
  validateRequest_default(ReviewValidation.createReviewZodSchema),
  ReviewController.ReviewPost
);
router4.delete("/reviews/:reviewId", auth("ADMIN" /* ADMIN */), ReviewController.DeleteReviewAdmin);
var reviewRouter = router4;

// src/app/Module/TutorSlot/tutorSlot.route.ts
import { Router } from "express";

// src/app/Module/TutorSlot/tutorSlot.service.ts
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
  const updateData = {};
  if (data.isBooked !== void 0) updateData.isBooked = data.isBooked;
  if (data.date) updateData.date = new Date(data.date);
  if (data.startTime || data.endTime) {
    const existing = await prisma.tutorSlot.findUnique({ where: { id: slotId } });
    if (!existing) throw new Error("Slot not found");
    const targetDateStr = data.date ? data.date : existing.date.toISOString().split("T")[0];
    if (data.startTime) updateData.startTime = /* @__PURE__ */ new Date(`${targetDateStr}T${data.startTime}:00Z`);
    if (data.endTime) updateData.endTime = /* @__PURE__ */ new Date(`${targetDateStr}T${data.endTime}:00Z`);
  }
  const updated = await prisma.tutorSlot.update({
    where: { id: slotId },
    data: updateData
  });
  return updated;
};
var deleteSlot = async (slotId) => {
  const deleted = await prisma.tutorSlot.delete({ where: { id: slotId } });
  return deleted;
};
var getSlotsByTutor = async (tutorId) => {
  return prisma.tutorSlot.findMany({
    where: { tutorId },
    orderBy: [
      { date: "asc" },
      { startTime: "asc" }
    ]
  });
};
var getAllSlotsAdmin = async () => {
  return prisma.tutorSlot.findMany({
    include: {
      tutor: {
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          category: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }]
  });
};
var tutorSlotServices = {
  createSlots,
  updateSlot,
  deleteSlot,
  getSlotsByTutor,
  getAllSlotsAdmin
};

// src/app/Module/TutorSlot/tutorSlot.controller.ts
import { StatusCodes as StatusCodes4 } from "http-status-codes";
var addSlots = catchAsync(async (req, res) => {
  const tutorIdRaw = req.params.tutorId;
  if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
    return res.status(StatusCodes4.BAD_REQUEST).json({ success: false, message: "Invalid tutorId" });
  }
  const tutorId = tutorIdRaw;
  const slots = req.body.slots;
  const result = await tutorSlotServices.createSlots(tutorId, slots);
  sendResponse(res, {
    httpStatusCode: StatusCodes4.CREATED,
    success: true,
    message: "Slots created successfully",
    data: result
  });
});
var updateSlotController = catchAsync(async (req, res) => {
  const slotIdRaw = req.params.slotId;
  if (!slotIdRaw || Array.isArray(slotIdRaw)) {
    return res.status(StatusCodes4.BAD_REQUEST).json({ success: false, message: "Invalid slotId" });
  }
  const slotId = slotIdRaw;
  const data = req.body;
  const updated = await tutorSlotServices.updateSlot(slotId, data);
  sendResponse(res, {
    httpStatusCode: StatusCodes4.OK,
    success: true,
    message: "Slot updated successfully",
    data: updated
  });
});
var deleteSlotController = catchAsync(async (req, res) => {
  const slotIdRaw = req.params.slotId;
  if (!slotIdRaw || Array.isArray(slotIdRaw)) {
    return res.status(StatusCodes4.BAD_REQUEST).json({ success: false, message: "Invalid slotId" });
  }
  const slotId = slotIdRaw;
  const deleted = await tutorSlotServices.deleteSlot(slotId);
  sendResponse(res, {
    httpStatusCode: StatusCodes4.OK,
    success: true,
    message: "Slot deleted successfully",
    data: deleted
  });
});
var getSlotsByTutor2 = catchAsync(async (req, res) => {
  const tutorIdRaw = req.params.tutorId;
  if (!tutorIdRaw || Array.isArray(tutorIdRaw)) {
    return res.status(StatusCodes4.BAD_REQUEST).json({ success: false, message: "Invalid tutorId" });
  }
  const tutorId = tutorIdRaw;
  const slots = await tutorSlotServices.getSlotsByTutor(tutorId);
  sendResponse(res, {
    httpStatusCode: StatusCodes4.OK,
    success: true,
    message: "Slots retrieved successfully",
    data: slots
  });
});
var getAllSlotsAdmin2 = catchAsync(async (_req, res) => {
  const slots = await tutorSlotServices.getAllSlotsAdmin();
  sendResponse(res, {
    httpStatusCode: StatusCodes4.OK,
    success: true,
    message: "All slots retrieved successfully",
    data: slots
  });
});
var tutorSlotController = {
  addSlots,
  updateSlotController,
  deleteSlotController,
  getSlotsByTutor: getSlotsByTutor2,
  getAllSlotsAdmin: getAllSlotsAdmin2
};

// src/app/Module/TutorSlot/tutorSlot.validation.ts
import { z as z6 } from "zod";
var slotSchema = z6.object({
  date: z6.string().min(1, "Date is required (YYYY-MM-DD)"),
  startTime: z6.string().min(1, "Start time is required (HH:mm)"),
  endTime: z6.string().min(1, "End time is required (HH:mm)")
});
var createSlotsSchema = z6.object({
  body: z6.object({
    slots: z6.array(slotSchema).min(1, "At least one slot is required")
  })
});
var updateSlotSchema = z6.object({
  body: z6.object({
    date: z6.string().optional(),
    startTime: z6.string().optional(),
    endTime: z6.string().optional(),
    isBooked: z6.boolean().optional()
  })
});
var TutorSlotValidation = {
  createSlotsSchema,
  updateSlotSchema
};

// src/app/Module/TutorSlot/tutorSlot.route.ts
var router5 = Router();
router5.post(
  "/tutor/profileSlot/:tutorId",
  auth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(TutorSlotValidation.createSlotsSchema),
  tutorSlotController.addSlots
);
router5.put(
  "/tutor/profileSlot/:slotId",
  auth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  validateRequest_default(TutorSlotValidation.updateSlotSchema),
  tutorSlotController.updateSlotController
);
router5.delete(
  "/tutor/profileSlot/:slotId",
  auth("TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  tutorSlotController.deleteSlotController
);
router5.get(
  "/tutor/profileSlot/:tutorId",
  tutorSlotController.getSlotsByTutor
);
router5.get(
  "/tutor/profileSlot",
  auth("ADMIN" /* ADMIN */),
  tutorSlotController.getAllSlotsAdmin
);
var TutorSlot = router5;

// src/app/Module/Dashboard/dashboard.route.ts
import { Router as Router2 } from "express";

// src/app/Module/Dashboard/dashboard.service.ts
var getUserStatsFromDB = async (userId, role) => {
  if (role === "ADMIN" /* ADMIN */) {
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" /* STUDENT */ } });
    const totalTutors = await prisma.tutorProfile.count();
    const totalBookings = await prisma.booking.count();
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" /* ADMIN */ } });
    const monthlyBookingsRaw = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;
    const monthlyBookings = monthlyBookingsRaw.map((item) => ({
      month: item.month,
      total: Number(item.totalBookings)
    }));
    const bookingStatusRaw = await prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true }
    });
    const bookingStatusDistribution = bookingStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id
    }));
    const roleDistributionRaw = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true }
    });
    const roleDistribution = roleDistributionRaw.map((item) => ({
      role: item.role,
      count: item._count.id
    }));
    return {
      overview: {
        totalStudents,
        totalTutors,
        totalAdmins,
        totalBookings
      },
      charts: {
        monthlyBookings,
        bookingStatusDistribution,
        roleDistribution
      }
    };
  } else if (role === "TUTOR" /* TUTOR */) {
    const totalBookings = await prisma.booking.count({ where: { tutorId: userId } });
    const completedBookings = await prisma.booking.count({ where: { tutorId: userId, status: "COMPLETED" } });
    const upcomingBookings = await prisma.booking.count({ where: { tutorId: userId, status: "CONFIRMED" } });
    const reviewsReceived = await prisma.review.count({ where: { tutorId: userId } });
    const monthlyBookingsRaw = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            WHERE "tutorId" = ${userId}
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;
    const monthlyBookings = monthlyBookingsRaw.map((item) => ({
      month: item.month,
      total: Number(item.totalBookings)
    }));
    const bookingStatusRaw = await prisma.booking.groupBy({
      by: ["status"],
      where: { tutorId: userId },
      _count: { id: true }
    });
    const bookingStatusDistribution = bookingStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id
    }));
    return {
      overview: {
        totalBookings,
        completedBookings,
        upcomingBookings,
        reviewsReceived
      },
      charts: {
        monthlyBookings,
        bookingStatusDistribution
      }
    };
  } else {
    const totalBookings = await prisma.booking.count({ where: { studentId: userId } });
    const completedBookings = await prisma.booking.count({ where: { studentId: userId, status: "COMPLETED" } });
    const upcomingBookings = await prisma.booking.count({ where: { studentId: userId, status: "CONFIRMED" } });
    const reviewsGiven = await prisma.review.count({ where: { studentId: userId } });
    const monthlyBookingsRaw = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            WHERE "studentId" = ${userId}
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;
    const monthlyBookings = monthlyBookingsRaw.map((item) => ({
      month: item.month,
      total: Number(item.totalBookings)
    }));
    const bookingStatusRaw = await prisma.booking.groupBy({
      by: ["status"],
      where: { studentId: userId },
      _count: { id: true }
    });
    const bookingStatusDistribution = bookingStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id
    }));
    return {
      overview: {
        totalBookings,
        completedBookings,
        upcomingBookings,
        reviewsGiven
      },
      charts: {
        monthlyBookings,
        bookingStatusDistribution
      }
    };
  }
};

// src/app/Module/Dashboard/dashboard.controller.ts
import { StatusCodes as StatusCodes5 } from "http-status-codes";
var getUserStats = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user || !user.id && !user.role) {
    return res.status(StatusCodes5.UNAUTHORIZED).json({ message: "Unauthorized", success: false });
  }
  const stats = await getUserStatsFromDB(user.id, user.role);
  sendResponse(res, {
    httpStatusCode: StatusCodes5.OK,
    success: true,
    message: "Stats retrieved successfully for user",
    data: stats
  });
});

// src/app/Module/Dashboard/dashboard.route.ts
var router6 = Router2();
router6.get("/stats", auth("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */, "STUDENT" /* STUDENT */), getUserStats);
var DashboardRoutes = router6;

// src/app/Module/Session/session.route.ts
import { Router as Router3 } from "express";

// src/app/Module/Session/session.service.ts
var getMySessions = async (userId) => {
  return prisma.session.findMany({
    where: { userId },
    include: { user: { select: { email: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var getAllSessions = async () => {
  return prisma.session.findMany({
    include: { user: { select: { email: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" }
  });
};
var deleteSession = async (sessionId, userId, role) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Session not found");
  if (session.userId !== userId && role !== "ADMIN") {
    throw new Error("You do not have permission to terminate this session");
  }
  await prisma.session.delete({ where: { id: sessionId } });
  return null;
};
var SessionService = {
  getMySessions,
  getAllSessions,
  deleteSession
};

// src/app/Module/Session/session.controller.ts
import { StatusCodes as StatusCodes6 } from "http-status-codes";
var getMySessions2 = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Unauthorized");
  const sessions = await SessionService.getMySessions(userId);
  sendResponse(res, {
    httpStatusCode: StatusCodes6.OK,
    success: true,
    message: "Your active sessions retrieved successfully",
    data: sessions
  });
});
var getAllSessions2 = catchAsync(async (req, res) => {
  const sessions = await SessionService.getAllSessions();
  sendResponse(res, {
    httpStatusCode: StatusCodes6.OK,
    success: true,
    message: "All system sessions retrieved successfully",
    data: sessions
  });
});
var deleteSession2 = catchAsync(async (req, res) => {
  const sessionId = req.params.sessionId;
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) throw new Error("Unauthorized");
  await SessionService.deleteSession(sessionId, userId, role);
  sendResponse(res, {
    httpStatusCode: StatusCodes6.OK,
    success: true,
    message: "Session terminated successfully",
    data: null
  });
});

// src/app/Module/Session/session.route.ts
var router7 = Router3();
router7.get("/my-sessions", auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), getMySessions2);
router7.get("/all-sessions", auth("ADMIN" /* ADMIN */), getAllSessions2);
router7.delete("/:sessionId", auth("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */), deleteSession2);
var SessionRoutes = router7;

// src/app/Module/auth/auth.route.ts
import { Router as Router4 } from "express";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
var auth2 = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [envConfig.app_url, "https://skill-bridge-fontend-five.vercel.app"],
  // databaseHooks: {
  //     user: {
  //         create: {
  //             after: async (user) => {
  //                 // Profile creation moved to auth.controller.ts directly 
  //                 // to handle custom fields via request body dynamically and rollbacks.
  //             }
  //         }
  //     }
  // },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT"
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
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: envConfig.google_client_id,
      clientSecret: envConfig.google_client_secret
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false
    },
    cookiePrefix: "better-auth",
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      //extra
      path: "/"
    },
    trustProxy: true,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          // extra
          path: "/"
        }
      }
    },
    disableCSRFCheck: true
  }
});

// src/app/utils/tokenUtils.ts
import jwt2 from "jsonwebtoken";
var getAccessToken = (payload) => {
  return jwt2.sign(
    payload,
    envConfig.jwt_access_secret,
    {
      expiresIn: envConfig.jwt_access_expires_in
    }
  );
};
var getRefreshToken = (payload) => {
  return jwt2.sign(
    payload,
    envConfig.jwt_refresh_secret,
    {
      expiresIn: envConfig.jwt_refresh_expires_in
    }
  );
};
var setAccessTokenCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1e3
    // 15 minutes
  });
};

// src/app/Module/auth/auth.controller.ts
import { StatusCodes as StatusCodes7 } from "http-status-codes";
var Register = catchAsync(async (req, res) => {
  const { name, email, password, role = "STUDENT" /* STUDENT */, phone, imgUrl } = req.body;
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === "string") headers.set(key, value);
  });
  const response = await auth2.api.signUpEmail({
    body: {
      name,
      email,
      password,
      role,
      phone,
      image: imgUrl
    },
    headers,
    asResponse: true
  });
  const responseData = await response.json();
  if (response.status >= 400 || !responseData.user) {
    return sendResponse(res, {
      httpStatusCode: response.status,
      success: false,
      message: responseData.message || "Error occurred during registration.",
      data: null
    });
  }
  const createdUserId = responseData.user.id;
  try {
    if (role === "STUDENT" /* STUDENT */) {
      const { grade, institution, gender, interests } = req.body;
      await prisma.studentProfile.create({
        data: {
          userId: createdUserId,
          grade: grade || null,
          institution: institution || null,
          gender: gender || null,
          interests: interests || null
        }
      });
    } else if (role === "TUTOR" /* TUTOR */) {
      const { bio, price, experience, categoryId, gender, institution } = req.body;
      await prisma.tutorProfile.create({
        data: {
          userId: createdUserId,
          bio: bio || "Default bio description",
          price: price || 0,
          experience: experience || "0",
          categoryId: categoryId || null,
          gender: gender || null,
          institution: institution || null
        }
      });
    }
  } catch (error) {
    await prisma.user.delete({ where: { id: createdUserId } });
    return sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: error.message || "Failed to populate extra profile data. User creation rolled back.",
      data: null
    });
  }
  const finalUser = await prisma.user.findUnique({
    where: { id: createdUserId },
    include: {
      studentProfile: true,
      tutorProfile: true
    }
  });
  const signInResponse = await auth2.api.signInEmail({
    body: { email, password },
    headers,
    asResponse: true
  });
  const signInData = await signInResponse.json();
  const payload = {
    userId: responseData.user.id,
    role,
    email,
    name: finalUser?.name || name
  };
  const accessToken = getAccessToken(payload);
  const refreshToken = getRefreshToken(payload);
  setAccessTokenCookie(res, accessToken);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User registered successfully!",
    data: {
      accessToken,
      refreshToken,
      user: finalUser,
      // Includes the newly created relational profile data
      sessionToken: signInData.token
    }
  });
});
var loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === "string") headers.set(key, value);
  });
  const signInResponse = await auth2.api.signInEmail({
    body: { email, password },
    headers,
    asResponse: true
  });
  const responseData = await signInResponse.json();
  if (signInResponse.status >= 400 || !responseData.user) {
    return sendResponse(res, {
      httpStatusCode: signInResponse.status,
      success: false,
      message: responseData.message || "Invalid email or password",
      data: null
    });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: responseData.user.id },
    select: { status: true }
  });
  if (!dbUser || dbUser.status !== "ACTIVE") {
    return sendResponse(res, {
      httpStatusCode: StatusCodes7.FORBIDDEN,
      success: false,
      message: "Your account is inactive or deleted. Please contact admin.",
      data: null
    });
  }
  const payload = {
    userId: responseData.user.id,
    role: responseData.user.role || "STUDENT" /* STUDENT */,
    email,
    name: responseData.user.name
  };
  const accessToken = getAccessToken(payload);
  const refreshToken = getRefreshToken(payload);
  setAccessTokenCookie(res, accessToken);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken,
      refreshToken,
      user: responseData.user,
      sessionToken: responseData.token
      // Mapping better-auth's exact token string here
    }
  });
});
var changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(StatusCodes7.UNAUTHORIZED, "Unauthorized");
  const { oldPassword, newPassword, revokeOtherSessions = false } = req.body;
  if (!oldPassword || !newPassword) throw new AppError(StatusCodes7.BAD_REQUEST, "Old and new passwords are required");
  const headers = new Headers();
  const sessionToken = req.headers["x-session-token"] ?? void 0;
  if (!sessionToken) {
    throw new AppError(StatusCodes7.UNAUTHORIZED, "Session token missing. Please login again.");
  }
  headers.set("cookie", `better-auth.session_token=${sessionToken}`);
  let result;
  try {
    result = await auth2.api.changePassword({
      body: {
        newPassword,
        currentPassword: oldPassword,
        revokeOtherSessions
      },
      headers
    });
  } catch (e) {
    const msg = String(e?.message ?? "Unauthorized");
    throw new AppError(StatusCodes7.UNAUTHORIZED, msg);
  }
  if (revokeOtherSessions) {
    const currentToken = req.headers["x-session-token"] ?? void 0;
    if (currentToken) {
      await prisma.session.deleteMany({
        where: { userId: user.id, NOT: [{ token: currentToken }] }
      });
    }
  }
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: revokeOtherSessions ? "Password changed successfully. Other sessions revoked." : "Password changed successfully.",
    data: {
      redirectUrl: "/"
    }
  });
});
var logoutUser = catchAsync(async (req, res) => {
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === "string") headers.set(key, value);
  });
  try {
    await auth2.api.signOut({
      headers
    });
  } catch (err) {
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("better-auth.session_token");
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Logged out successfully!",
    data: null
  });
});

// src/app/Module/auth/auth.validation.ts
import { z as z7 } from "zod";
var LoginValidationSchema = z7.object({
  body: z7.object({
    email: z7.string().email("Invalid email address"),
    password: z7.string().min(6, "Password must be at least 6 characters long")
  })
});
var RegisterValidationSchema = z7.object({
  body: z7.object({
    name: z7.string().min(2, "Name must be at least 2 characters long"),
    email: z7.string().email("Invalid email address"),
    password: z7.string().min(6, "Password must be at least 6 characters long"),
    role: z7.nativeEnum(UserRole2).optional(),
    phone: z7.string().regex(/^(?:\+88)?01\d{9}$/, "Phone number must be a valid Bangladeshi number starting with 01").transform((val) => val.startsWith("+88") ? val : `+88${val}`).optional(),
    imgUrl: z7.string().url("Invalid image URL").optional().or(z7.literal("")),
    // Student-specific
    grade: z7.string().optional(),
    institution: z7.string().optional(),
    gender: z7.string().optional(),
    interests: z7.string().optional(),
    // Tutor-specific
    bio: z7.string().optional(),
    price: z7.number().min(0, "Price must be a positive number").optional(),
    experience: z7.string().optional(),
    categoryId: z7.string().uuid("Invalid category ID").optional().or(z7.literal(""))
  })
});
var ChangePasswordValidationSchema = z7.object({
  body: z7.object({
    oldPassword: z7.string().min(6, "Old password must be at least 6 characters long"),
    newPassword: z7.string().min(6, "New password must be at least 6 characters long"),
    // Default false so user doesn't get logged out
    revokeOtherSessions: z7.boolean().optional().default(false)
  })
});

// src/app/Module/auth/auth.route.ts
var router8 = Router4();
router8.post("/register", validateRequest_default(RegisterValidationSchema), Register);
router8.post("/sign-in/email", validateRequest_default(LoginValidationSchema), loginUser);
router8.post("/change-password", auth(), validateRequest_default(ChangePasswordValidationSchema), changePassword);
router8.post("/logout", logoutUser);
var AuthRoutes = router8;

// src/app/Module/Category/category.route.ts
import express5 from "express";

// src/app/Module/Category/category.validation.ts
import { z as z8 } from "zod";
var createCategoryValidationSchema = z8.object({
  body: z8.object({
    name: z8.string().min(1, "Name is required"),
    title: z8.string().optional(),
    icon: z8.string().optional()
  })
});
var updateCategoryValidationSchema = z8.object({
  body: z8.object({
    name: z8.string().optional(),
    title: z8.string().optional(),
    icon: z8.string().optional()
  })
});

// src/app/Module/Category/category.service.ts
import { StatusCodes as StatusCodes8 } from "http-status-codes";
function normalizeCategoryName(name) {
  return String(name ?? "").trim();
}
function isInvalidCategoryName(name) {
  const n = normalizeCategoryName(name);
  const low = n.toLowerCase();
  return !n || low === "unknown" || low === "undefined" || low === "null";
}
var createCategory = async (payload) => {
  if (isInvalidCategoryName(payload?.name)) {
    throw new AppError(StatusCodes8.BAD_REQUEST, "Category name is invalid.");
  }
  const existingCategory = await prisma.category.findFirst({
    where: { name: normalizeCategoryName(payload.name) }
  });
  if (existingCategory) {
    throw new AppError(StatusCodes8.CONFLICT, "Category already exists with this name.");
  }
  const newCategory = await prisma.category.create({
    data: {
      name: normalizeCategoryName(payload.name),
      ...payload.icon && { icon: payload.icon.trim() }
    }
  });
  return newCategory;
};
var getAllCategories = async () => {
  return await prisma.category.findMany({
    where: {
      NOT: [{ name: { equals: "Unknown", mode: "insensitive" } }]
    },
    orderBy: { createdAt: "desc" }
  });
};
var updateCategory = async (categoryId, payload) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (!categoryExists) {
    throw new AppError(StatusCodes8.NOT_FOUND, "Category not found.");
  }
  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...payload.name && !isInvalidCategoryName(payload.name) && { name: normalizeCategoryName(payload.name) },
      ...payload.icon !== void 0 && { icon: payload.icon?.trim() }
    }
  });
  return updatedCategory;
};
var deleteCategory2 = async (categoryId) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { tutors: true }
  });
  if (!categoryExists) {
    throw new AppError(StatusCodes8.NOT_FOUND, "Category not found.");
  }
  if (categoryExists.tutors.length > 0) {
    throw new AppError(StatusCodes8.BAD_REQUEST, "Cannot delete category as it is currently assigned to one or more tutors.");
  }
  return await prisma.category.delete({
    where: { id: categoryId }
  });
};
var CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory: deleteCategory2
};

// src/app/Module/Category/category.controller.ts
var createCategory2 = catchAsync(async (req, res) => {
  const result = await CategoryServices.createCategory(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result
  });
});
var getAllCategories2 = catchAsync(async (req, res) => {
  const result = await CategoryServices.getAllCategories();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: result
  });
});
var updateCategory2 = catchAsync(async (req, res) => {
  const categoryId = req.params.categoryId;
  const result = await CategoryServices.updateCategory(categoryId, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result
  });
});
var deleteCategory3 = catchAsync(async (req, res) => {
  const categoryId = req.params.categoryId;
  const result = await CategoryServices.deleteCategory(categoryId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result
  });
});
var CategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory3
};

// src/app/Module/Category/category.route.ts
var router9 = express5.Router();
router9.get("/", CategoryController.getAllCategories);
router9.post(
  "/",
  auth("ADMIN" /* ADMIN */),
  validateRequest_default(createCategoryValidationSchema),
  CategoryController.createCategory
);
router9.patch(
  "/:categoryId",
  auth("ADMIN" /* ADMIN */),
  validateRequest_default(updateCategoryValidationSchema),
  CategoryController.updateCategory
);
router9.delete(
  "/:categoryId",
  auth("ADMIN" /* ADMIN */),
  CategoryController.deleteCategory
);
var categoryRouter = router9;

// src/app/Module/Notification/notification.route.ts
import { Router as Router5 } from "express";

// src/app/Module/Notification/notification.service.ts
var getMyNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};
var markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });
  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found or unauthorized");
  }
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  });
};
var markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  });
  return { updatedCount: result.count };
};
var deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });
  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found or unauthorized");
  }
  return await prisma.notification.delete({
    where: { id: notificationId }
  });
};
var notificationService = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

// src/app/Module/Notification/notification.controller.ts
import { StatusCodes as StatusCodes9 } from "http-status-codes";
var getMyNotifications2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");
  const result = await notificationService.getMyNotifications(user.id);
  sendResponse(res, {
    httpStatusCode: StatusCodes9.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result
  });
});
var markAsRead2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");
  const notificationId = req.params.id;
  const result = await notificationService.markAsRead(notificationId, user.id);
  sendResponse(res, {
    httpStatusCode: StatusCodes9.OK,
    success: true,
    message: "Notification marked as read successfully",
    data: result
  });
});
var markAllAsRead2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");
  const result = await notificationService.markAllAsRead(user.id);
  sendResponse(res, {
    httpStatusCode: StatusCodes9.OK,
    success: true,
    message: "All notifications marked as read successfully",
    data: result
  });
});
var deleteNotification2 = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");
  const notificationId = req.params.id;
  const result = await notificationService.deleteNotification(notificationId, user.id);
  sendResponse(res, {
    httpStatusCode: StatusCodes9.OK,
    success: true,
    message: "Notification deleted successfully",
    data: result
  });
});
var notificationController = {
  getMyNotifications: getMyNotifications2,
  markAsRead: markAsRead2,
  markAllAsRead: markAllAsRead2,
  deleteNotification: deleteNotification2
};

// src/app/Module/Notification/notification.route.ts
var router10 = Router5();
var restrictAuth = auth("ADMIN" /* ADMIN */, "TUTOR" /* TUTOR */, "STUDENT" /* STUDENT */);
router10.get("/my-notifications", restrictAuth, notificationController.getMyNotifications);
router10.patch("/my-notifications/read-all", restrictAuth, notificationController.markAllAsRead);
router10.patch("/my-notifications/:id/read", restrictAuth, notificationController.markAsRead);
router10.delete("/my-notifications/:id", restrictAuth, notificationController.deleteNotification);
var NotificationRoutes = router10;

// src/app/Module/Wishlist/wishlist.route.ts
import { Router as Router6 } from "express";

// src/app/Module/Wishlist/wishlist.service.ts
var toggleWishlist = async (studentId, tutorProfileId) => {
  const existingWishlist = await prisma.wishlist.findFirst({
    where: {
      studentId,
      tutorProfileId
    }
  });
  if (existingWishlist) {
    await prisma.wishlist.delete({
      where: {
        id: existingWishlist.id
      }
    });
    return { message: "Tutor removed from wishlist", data: null };
  } else {
    const newWishlist = await prisma.wishlist.create({
      data: {
        studentId,
        tutorProfileId
      }
    });
    return { message: "Tutor added to wishlist", data: newWishlist };
  }
};
var getMyWishlist = async (studentId) => {
  return await prisma.wishlist.findMany({
    where: {
      studentId
    },
    include: {
      tutorProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var WishlistService = {
  toggleWishlist,
  getMyWishlist
};

// src/app/Module/Wishlist/wishlist.controller.ts
var toggleWishlist2 = catchAsync(async (req, res) => {
  const result = await WishlistService.toggleWishlist(req.user.id, req.body.tutorProfileId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
    data: result.data
  });
});
var getMyWishlist2 = catchAsync(async (req, res) => {
  const result = await WishlistService.getMyWishlist(req.user.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Wishlist retrieved successfully",
    data: result
  });
});
var WishlistController = {
  toggleWishlist: toggleWishlist2,
  getMyWishlist: getMyWishlist2
};

// src/app/Module/Wishlist/wishlist.route.ts
var router11 = Router6();
router11.post("/toggle", auth("STUDENT" /* STUDENT */), WishlistController.toggleWishlist);
router11.get("/my", auth("STUDENT" /* STUDENT */), WishlistController.getMyWishlist);
var WishlistRoutes = router11;

// src/app/Module/Message/message.route.ts
import { Router as Router7 } from "express";

// src/app/Module/Message/message.service.ts
var sendMessage = async (senderId, receiverId, text) => {
  if (senderId === receiverId) {
    throw new AppError(400, "Cannot send message to yourself");
  }
  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      text
    }
  });
  try {
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true, email: true }
    });
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New message",
        message: `${sender?.name ?? "Someone"}: ${String(text).slice(0, 80)}`,
        type: "MESSAGE",
        metadata: {
          kind: "MESSAGE",
          otherUserId: senderId,
          messageId: message.id
        }
      }
    });
  } catch {
  }
  return message;
};
var getConversation = async (userId, otherUserId) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });
  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      readAt: null
    },
    data: {
      readAt: /* @__PURE__ */ new Date()
    }
  });
  return messages;
};
var getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      readAt: null
    }
  });
  return { count };
};
var MessageService = {
  sendMessage,
  getConversation,
  getUnreadCount
};

// src/app/Module/Message/message.controller.ts
var sendMessage2 = catchAsync(async (req, res) => {
  const result = await MessageService.sendMessage(req.user.id, req.body.receiverId, req.body.text);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Message sent successfully",
    data: result
  });
});
var getConversation2 = catchAsync(async (req, res) => {
  const result = await MessageService.getConversation(req.user.id, req.params.userId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Conversation retrieved successfully",
    data: result
  });
});
var getUnreadCount2 = catchAsync(async (req, res) => {
  const result = await MessageService.getUnreadCount(req.user.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Unread count retrieved successfully",
    data: result
  });
});
var MessageController = {
  sendMessage: sendMessage2,
  getConversation: getConversation2,
  getUnreadCount: getUnreadCount2
};

// src/app/Module/Message/message.route.ts
var router12 = Router7();
router12.post("/", auth(), MessageController.sendMessage);
router12.get("/unread-count", auth(), MessageController.getUnreadCount);
router12.get("/:userId", auth(), MessageController.getConversation);
var MessageRoutes = router12;

// src/app/Module/Coupon/coupon.route.ts
import { Router as Router8 } from "express";

// src/app/Module/Coupon/coupon.controller.ts
var createCoupon2 = catchAsync(async (req, res) => {
  const result = await CouponService.createCoupon(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Coupon created successfully",
    data: result
  });
});
var getAllCoupons2 = catchAsync(async (req, res) => {
  const result = await CouponService.getAllCoupons();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Coupons retrieved successfully",
    data: result
  });
});
var deleteCoupon2 = catchAsync(async (req, res) => {
  const result = await CouponService.deleteCoupon(req.params.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Coupon deleted successfully",
    data: result
  });
});
var applyCoupon2 = catchAsync(async (req, res) => {
  const result = await CouponService.applyCoupon(req.body.code, req.body.originalPrice);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Coupon applied successfully",
    data: result
  });
});
var CouponController = {
  createCoupon: createCoupon2,
  getAllCoupons: getAllCoupons2,
  deleteCoupon: deleteCoupon2,
  applyCoupon: applyCoupon2
};

// src/app/Module/Coupon/coupon.route.ts
var router13 = Router8();
router13.post("/", auth("ADMIN" /* ADMIN */), CouponController.createCoupon);
router13.get("/", auth("ADMIN" /* ADMIN */), CouponController.getAllCoupons);
router13.delete("/:id", auth("ADMIN" /* ADMIN */), CouponController.deleteCoupon);
router13.post("/apply", auth("STUDENT" /* STUDENT */), CouponController.applyCoupon);
var CouponRoutes = router13;

// src/app/Module/Analytics/analytics.route.ts
import { Router as Router9 } from "express";

// src/app/Module/Analytics/analytics.service.ts
var getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalTutors,
    totalStudents,
    activeUsers,
    totalBookings,
    totalCategories,
    totalReviews,
    avgRatingAgg,
    recentBookings,
    paidBookingsWithPrice
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.tutorProfile.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.booking.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } }
      }
    }),
    prisma.booking.findMany({
      where: { paymentStatus: "PAID" },
      select: {
        tutorSlot: { select: { tutor: { select: { price: true } } } }
      }
    })
  ]);
  const totalRevenue = paidBookingsWithPrice.reduce((sum, b) => {
    const p = b.tutorSlot?.tutor?.price;
    const n = p ? Number(p) : 0;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const avgRevenuePerBooking = paidBookingsWithPrice.length > 0 ? totalRevenue / paidBookingsWithPrice.length : 0;
  return {
    totalUsers,
    totalTutors,
    totalStudents,
    activeUsers,
    totalBookings,
    totalCategories,
    totalReviews,
    avgRating: avgRatingAgg._avg.rating ?? 0,
    totalRevenue,
    avgRevenuePerBooking,
    recentBookings
  };
};
var getTutorAnalytics = async (tutorUserId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: tutorUserId }
  });
  if (!tutor) {
    throw new AppError(404, "Tutor profile not found");
  }
  const [totalBookings, pendingBookings, completedBookings, cancelledBookings, paidBookingsWithPrice] = await prisma.$transaction([
    prisma.booking.count({ where: { tutorId: tutorUserId } }),
    prisma.booking.count({
      where: { tutorId: tutorUserId, status: { in: ["AWAITING_PAYMENT", "PENDING_CONFIRMATION", "RESCHEDULED"] } }
    }),
    prisma.booking.count({
      where: { tutorId: tutorUserId, status: { in: ["COMPLETED", "ATTENDED"] } }
    }),
    prisma.booking.count({ where: { tutorId: tutorUserId, status: "CANCELLED" } }),
    prisma.booking.findMany({
      where: { tutorId: tutorUserId, paymentStatus: "PAID" },
      select: {
        tutorSlot: { select: { tutor: { select: { price: true } } } }
      }
    })
  ]);
  const totalRevenue = paidBookingsWithPrice.reduce((sum, b) => {
    const p = b.tutorSlot?.tutor?.price;
    const n = p ? Number(p) : 0;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const avgRevenuePerBooking = paidBookingsWithPrice.length > 0 ? totalRevenue / paidBookingsWithPrice.length : 0;
  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    avgRevenuePerBooking,
    avgRating: tutor.rating ?? 0,
    totalReviews: tutor.totalReviews ?? 0
  };
};
var AnalyticsService = {
  getAdminAnalytics,
  getTutorAnalytics
};

// src/app/Module/Analytics/analytics.controller.ts
var getAdminAnalytics2 = catchAsync(async (req, res) => {
  const result = await AnalyticsService.getAdminAnalytics();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Admin analytics retrieved successfully",
    data: result
  });
});
var getTutorAnalytics2 = catchAsync(async (req, res) => {
  const result = await AnalyticsService.getTutorAnalytics(req.user.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor analytics retrieved successfully",
    data: result
  });
});
var AnalyticsController = {
  getAdminAnalytics: getAdminAnalytics2,
  getTutorAnalytics: getTutorAnalytics2
};

// src/app/Module/Analytics/analytics.route.ts
var router14 = Router9();
router14.get("/admin", auth("ADMIN" /* ADMIN */), AnalyticsController.getAdminAnalytics);
router14.get("/tutor", auth("TUTOR" /* TUTOR */), AnalyticsController.getTutorAnalytics);
var AnalyticsRoutes = router14;

// src/app/routes/index.ts
var router15 = Router10();
var moduleRoutes = [
  { path: "/", route: tutorRouter },
  { path: "/", route: StudentBookingRouter },
  { path: "/", route: userRouter },
  { path: "/", route: reviewRouter },
  { path: "/", route: TutorSlot },
  { path: "/categories", route: categoryRouter },
  { path: "/dashboard", route: DashboardRoutes },
  { path: "/sessions", route: SessionRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/", route: NotificationRoutes },
  { path: "/wishlists", route: WishlistRoutes },
  { path: "/messages", route: MessageRoutes },
  { path: "/coupons", route: CouponRoutes },
  { path: "/analytics", route: AnalyticsRoutes }
];
moduleRoutes.forEach((route) => router15.use(route.path, route.route));
var routes_default = router15;

// src/app/middleware/error.ts
import { ZodError } from "zod";
import { StatusCodes as StatusCodes10 } from "http-status-codes";
var errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || StatusCodes10.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong! Please try again later.";
  let errorSources = [
    {
      path: "",
      message: err.message
    }
  ];
  if (err instanceof ZodError) {
    statusCode = StatusCodes10.BAD_REQUEST;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = StatusCodes10.CONFLICT;
      message = "Duplicate Entry Error";
      errorSources = [{ path: "", message: `${err.meta?.target} must be unique` }];
    } else if (err.code === "P2025") {
      statusCode = StatusCodes10.NOT_FOUND;
      message = "Record not found.";
      errorSources = [{ path: "", message: "Record does not exist." }];
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = StatusCodes10.BAD_REQUEST;
    message = "Database Validation Error";
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof SyntaxError && typeof err.message === "string" && (err.message.includes("JSON") || err.message.includes("control character"))) {
    statusCode = StatusCodes10.BAD_REQUEST;
    message = "Invalid JSON body. Escape special characters in strings.";
    errorSources = [{ path: "", message: err.message }];
  }
  res.status(statusCode).json({
    success: false,
    message,
    // Backward-compatible single error field (some clients expect this)
    error: message,
    errorSources,
    stack: process.env.NODE_ENV === "development" ? err.stack : void 0
  });
};

// src/app/middleware/notFound.ts
var notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: "Router Not Found",
    path: req.originalUrl,
    method: req.method
  });
};

// src/app.ts
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
var app = express6();
var swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MentorFlow API",
      version: "1.0.0",
      description: "API Documentation for MentorFlow Back-end"
    },
    servers: [
      {
        url: "http://localhost:8000/api"
      }
    ]
  },
  apis: ["./src/app/Module/**/*.ts"]
};
var swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.set("trust proxy", true);
var allowedOrigins = ["https://skill-bridge-fontend-five.vercel.app", "http://localhost:3000", "https://next-blog-client.vercel.app", "https://next-blog-client-git-main-rahul-rajput.vercel.app"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === "null") return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express6.json());
app.use("/api", routes_default);
app.get("/", (req, res) => {
  res.send("SkillBridge server is up and running");
});
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
