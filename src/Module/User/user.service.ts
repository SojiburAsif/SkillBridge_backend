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

const getDashboardAnalytics = async () => {
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
    bookedTutorSlots,
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
    prisma.tutorSlot.count({ where: { isBooked: true } }),
  ]);

  const userRoleSplit = [
    { role: "STUDENT", value: totalStudents },
    { role: "TUTOR", value: totalTutors },
    { role: "ADMIN", value: totalAdmins },
  ];

  const bookingStatusSplit = [
    { status: "CONFIRMED", value: confirmedBookings },
    { status: "COMPLETED", value: completedBookings },
    { status: "CANCELLED", value: cancelledBookings },
    { status: "ATTENDED", value: attendedBookings },
    { status: "RESCHEDULED", value: rescheduledBookings },
  ];

  return {
    users: {
      total: totalUsers,
      byRole: {
        students: totalStudents,
        tutors: totalTutors,
        admins: totalAdmins,
      },
      byStatus: {
        active: activeUsers,
        inactive: inactiveUsers,
        band: bandUsers,
      },
    },
    profiles: {
      students: totalStudentProfiles,
      tutors: totalTutorProfiles,
    },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      attended: attendedBookings,
      rescheduled: rescheduledBookings,
      byStatus: bookingStatusSplit,
    },
    reviews: {
      total: totalReviews,
    },
    categories: {
      total: totalCategories,
    },
    tutorSlots: {
      total: totalTutorSlots,
      booked: bookedTutorSlots,
      available: totalTutorSlots - bookedTutorSlots,
    },
    charts: {
      userRoleSplit,
      bookingStatusSplit,
    },
  };
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
  studentProfileUpsert,
  getDashboardAnalytics
};
