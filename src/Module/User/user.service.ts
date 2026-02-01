import { prisma } from "../../lib/prisma";
import { $Enums, StudentProfile } from "../../../generated/prisma/client";

// Get all users
const AllUser = async () => {
  return await prisma.user.findMany();
};

// Get single user by ID
const getSingleUser = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
};

// Update user status
const updateUserStatus = async (userId: string, newStatus: $Enums.UserStatus) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
};

// Create student profile (একজন user একবারই profile বানাতে পারবে)
const createStudentProfile = async (
  data: Omit<StudentProfile, "id" | "createdAt" | "updatedAt" | "userId">,
  userId: string
) => {
  const existingStudent = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (existingStudent) {
    throw new Error("Student profile already exists for this user.");
  }

  return await prisma.studentProfile.create({
    data: {
      ...data,
      userId,
    },
    include: {
      user: true,
    },
  });
};

const getStudentProfile = async (userId: string) => {
  return await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
};
const getAllStudentProfiles = async () => {
  return await prisma.studentProfile.findMany({
    include: {
      user: true,
    },
  });
};



type StudentProfilePayload = {
  grade?: string;
  interests?: string;
};


const studentProfileUpsert = async (
  payload: StudentProfilePayload,
  userId: string
) => {
  const data: StudentProfilePayload = {};

  if (payload.grade !== undefined) {
    data.grade = payload.grade;
  }

  if (payload.interests !== undefined) {
    data.interests = payload.interests;
  }

  const result = await prisma.studentProfile.upsert({
    where: { userId },

    update: data,

    create: {
      userId,
      ...data,
    },
  });

  return result;
};


export const UserServices = {
  AllUser,
  getSingleUser,
  updateUserStatus,
  createStudentProfile,
  getStudentProfile,
  getAllStudentProfiles,
  studentProfileUpsert
};
