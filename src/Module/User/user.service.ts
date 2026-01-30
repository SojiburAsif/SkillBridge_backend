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


export const UserServices = {
  AllUser,
  getSingleUser,
  updateUserStatus,
  createStudentProfile,
  getStudentProfile
};
