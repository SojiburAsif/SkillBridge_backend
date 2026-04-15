import { prisma } from "../../lib/prisma";
import { $Enums, StudentProfile } from "../../../../generated/prisma/client";
import { AppError } from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

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

// Get basic user info for chat profile preview (Auth required)
const getBasicUserById = async (userId: string) => {
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
          category: { select: { id: true, name: true, icon: true } },
        },
      },
      studentProfile: {
        select: {
          id: true,
          grade: true,
          interests: true,
          gender: true,
          institution: true,
        },
      },
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

const updateTutorProfileStatus = async (userId: string, status: "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED") => {
  const profile = await prisma.tutorProfile.findUnique({ where: { userId }, select: { userId: true } });
  if (!profile) throw new Error("Tutor profile not found");
  return await prisma.tutorProfile.update({
    where: { userId },
    data: { status },
    select: { userId: true, status: true, updatedAt: true },
  });
};

const deleteUserByAdmin = async (userId: string) => {
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!existing) throw new Error("User not found");
  await prisma.user.delete({ where: { id: userId } });
  return { id: userId };
};


const createStudentProfile = async (
  data: Omit<StudentProfile, "id" | "createdAt" | "updatedAt" | "userId">,
  userId: string
) => {
  const existingStudent = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (existingStudent) {
    throw new AppError(StatusCodes.CONFLICT, "Student profile already exists for this user.");
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
  name?: string;
  phone?: string;
  image?: string;
};

type ProfileUpdatePayload = {
  // User fields
  name?: string;
  phone?: string;
  image?: string;
  
  // Student fields
  grade?: string;
  interests?: string;

  // Tutor fields
  bio?: string;
  price?: number;
  experience?: string;
  categoryId?: string;
  categoryIds?: string[];
  tutorStatus?: "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED";

  // Shared generic fields (both Tutor & Student)
  gender?: string;
  institution?: string;
};

const updateMyProfile = async (
  payload: ProfileUpdatePayload,
  userId: string,
  role: string
) => {
  const { name, phone, image, grade, interests, bio, price, experience, categoryId, categoryIds, tutorStatus, gender, institution } = payload;

  // Do core profile update atomically, but keep multi-category sync outside of the
  // transaction so DB errors there cannot poison the whole transaction.
  const pendingCategoryIds = role === "TUTOR" && Array.isArray(categoryIds)
    ? categoryIds.filter(Boolean).slice(0, 4)
    : null;

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Update general User model fields if provided
    if (name || phone || image !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(image !== undefined && { image })
        },
      });
    }

    // 2. Update role-specific profile fields
    if (role === "STUDENT") {
      const studentProfileData: any = {};
      if (grade !== undefined) studentProfileData.grade = grade;
      if (interests !== undefined) studentProfileData.interests = interests;
      if (gender !== undefined) studentProfileData.gender = gender;
      if (institution !== undefined) studentProfileData.institution = institution;

      if (Object.keys(studentProfileData).length > 0) {
        await tx.studentProfile.update({
          where: { userId },
          data: studentProfileData
        });
      }
    } else if (role === "TUTOR") {
      // Ensure tutorProfile exists (so tutor can update progressively)
      await tx.tutorProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          bio: "",
          experience: "",
          price: 0,
        },
      });

      const tutorProfileData: any = {};
      if (bio !== undefined) tutorProfileData.bio = bio;
      if (price !== undefined) tutorProfileData.price = price;
      if (experience !== undefined) tutorProfileData.experience = experience;
      const ids = pendingCategoryIds;
      const primary = (ids && ids.length > 0) ? ids[0] : (categoryId !== undefined && categoryId !== "" ? categoryId : undefined);
      if (primary !== undefined) tutorProfileData.categoryId = primary;
      if (gender !== undefined) tutorProfileData.gender = gender;
      if (institution !== undefined) tutorProfileData.institution = institution;
      if (tutorStatus !== undefined) tutorProfileData.status = tutorStatus;

      if (Object.keys(tutorProfileData).length > 0) {
        // Tutor profile may not exist yet → upsert (create if missing)
        await tx.tutorProfile.upsert({
          where: { userId },
          update: tutorProfileData,
          create: {
            userId,
            bio: typeof tutorProfileData.bio === "string" ? tutorProfileData.bio : "",
            experience: typeof tutorProfileData.experience === "string" ? tutorProfileData.experience : "",
            price: Number.isFinite(Number(tutorProfileData.price)) ? Number(tutorProfileData.price) : 0,
            ...(tutorProfileData.gender !== undefined ? { gender: tutorProfileData.gender } : {}),
            ...(tutorProfileData.institution !== undefined ? { institution: tutorProfileData.institution } : {}),
            ...(tutorProfileData.categoryId !== undefined ? { categoryId: tutorProfileData.categoryId } : {}),
          },
        });
      }
    }

    // 3. Fetch and return the updated user with their active profile
    const updated = await tx.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: role === "STUDENT",
        tutorProfile: role === "TUTOR" ? ({ include: { category: true } } as any) : false,
      }
    });

    // Attach multi-categories without relying on generated Prisma types
    if (role === "TUTOR" && (updated as any)?.tutorProfile?.id) {
      const tutorProfileId = String((updated as any).tutorProfile.id);
      try {
        const m = (tx as any).tutorProfileCategory;
        if (m?.findMany) {
          const rows = await m.findMany({
            where: { tutorProfileId },
            include: { category: true },
            orderBy: { order: "asc" },
          });
          (updated as any).tutorProfile.categories = rows;
        }
      } catch {
        // ignore
      }
    }

    return updated;
  });

  // Best-effort multi-category sync (outside transaction)
  if (role === "TUTOR" && pendingCategoryIds) {
    const tutorProfileId = (updated as any)?.tutorProfile?.id ? String((updated as any).tutorProfile.id) : null;
    if (tutorProfileId) {
      try {
        const m = (prisma as any).tutorProfileCategory;
        if (m?.deleteMany && m?.createMany) {
          await m.deleteMany({ where: { tutorProfileId } });
          if (pendingCategoryIds.length > 0) {
            await m.createMany({
              data: pendingCategoryIds.map((cid: string, idx: number) => ({
                tutorProfileId,
                categoryId: cid,
                order: idx,
              })),
            });
          }
        }
      } catch {
        // ignore (db not migrated yet / client not generated)
      }
    }
  }

  return updated;
};

const getMyProfile = async (userId: string, role: string) => {
  const base = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: role === "STUDENT",
      tutorProfile: role === "TUTOR" ? ({ include: { category: true } } as any) : false,
    }
  });
  if (role === "TUTOR" && (base as any)?.tutorProfile?.id) {
    const tutorProfileId = String((base as any).tutorProfile.id);
    try {
      const m = (prisma as any).tutorProfileCategory;
      if (m?.findMany) {
        const rows = await m.findMany({
          where: { tutorProfileId },
          include: { category: true },
          orderBy: { order: "asc" },
        });
        (base as any).tutorProfile.categories = rows;
      }
    } catch {
      // ignore
    }
  }
  return base;
};

export const UserServices = {
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
