import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

const getAdminAnalytics = async () => {
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
    paidBookingsWithPrice,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.tutorProfile.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count(),
    prisma.category.count(),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    }),
    prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      select: {
        tutorSlot: { select: { tutor: { select: { price: true } } } },
      },
    }),
  ]);

  const totalRevenue = paidBookingsWithPrice.reduce((sum, b) => {
    const p = b.tutorSlot?.tutor?.price;
    const n = p ? Number(p) : 0;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const avgRevenuePerBooking =
    paidBookingsWithPrice.length > 0 ? totalRevenue / paidBookingsWithPrice.length : 0;

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
    recentBookings,
  };
};

const getTutorAnalytics = async (tutorUserId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: tutorUserId },
  });

  if (!tutor) {
    throw new AppError(404, 'Tutor profile not found');
  }

  const [totalBookings, pendingBookings, completedBookings, cancelledBookings, paidBookingsWithPrice] =
    await prisma.$transaction([
      prisma.booking.count({ where: { tutorId: tutorUserId } }),
      prisma.booking.count({
        where: { tutorId: tutorUserId, status: { in: ['AWAITING_PAYMENT', 'PENDING_CONFIRMATION', 'RESCHEDULED'] } },
      }),
      prisma.booking.count({
        where: { tutorId: tutorUserId, status: { in: ['COMPLETED', 'ATTENDED'] } },
      }),
      prisma.booking.count({ where: { tutorId: tutorUserId, status: 'CANCELLED' } }),
      prisma.booking.findMany({
        where: { tutorId: tutorUserId, paymentStatus: 'PAID' },
        select: {
          tutorSlot: { select: { tutor: { select: { price: true } } } },
        },
      }),
    ]);

  const totalRevenue = paidBookingsWithPrice.reduce((sum, b) => {
    const p = b.tutorSlot?.tutor?.price;
    const n = p ? Number(p) : 0;
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const avgRevenuePerBooking =
    paidBookingsWithPrice.length > 0 ? totalRevenue / paidBookingsWithPrice.length : 0;

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    avgRevenuePerBooking,
    avgRating: tutor.rating ?? 0,
    totalReviews: tutor.totalReviews ?? 0,
  };
};

export const AnalyticsService = {
  getAdminAnalytics,
  getTutorAnalytics,
};
