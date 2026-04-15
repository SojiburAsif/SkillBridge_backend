import { prisma } from '../../lib/prisma';
import { UserRole } from '../../middleware/auth';

export const getUserStatsFromDB = async (userId: string, role: string) => {
    if (role === UserRole.ADMIN) {
        const totalStudents = await prisma.user.count({ where: { role: UserRole.STUDENT } });
        const totalTutors = await prisma.tutorProfile.count();
        const totalBookings = await prisma.booking.count();
        const totalAdmins = await prisma.user.count({ where: { role: UserRole.ADMIN } });

        // Monthly Bookings for Line/Bar Chart (Last 12 Months)
        const monthlyBookingsRaw: any[] = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;

        const monthlyBookings = monthlyBookingsRaw.map(item => ({
            month: item.month,
            total: Number(item.totalBookings)
        }));

        // Booking Status Distribution for Pie Chart
        const bookingStatusRaw = await prisma.booking.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        const bookingStatusDistribution = bookingStatusRaw.map(item => ({
            status: item.status,
            count: item._count.id
        }));

        // Role Distribution for Pie Chart
        const roleDistributionRaw = await prisma.user.groupBy({
            by: ['role'],
            _count: { id: true }
        });
        const roleDistribution = roleDistributionRaw.map(item => ({
            role: item.role,
            count: item._count.id
        }));

        return {
            overview: {
                totalStudents,
                totalTutors,
                totalAdmins,
                totalBookings,
            },
            charts: {
                monthlyBookings,
                bookingStatusDistribution,
                roleDistribution
            }
        };
    } else if (role === UserRole.TUTOR) {
        const totalBookings = await prisma.booking.count({ where: { tutorId: userId } });
        const completedBookings = await prisma.booking.count({ where: { tutorId: userId, status: 'COMPLETED' } });
        const upcomingBookings = await prisma.booking.count({ where: { tutorId: userId, status: 'CONFIRMED' } });
        const reviewsReceived = await prisma.review.count({ where: { tutorId: userId } });
        
        // Monthly Bookings for Line/Bar Chart (Last 12 Months)
        const monthlyBookingsRaw: any[] = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            WHERE "tutorId" = ${userId}
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;

        const monthlyBookings = monthlyBookingsRaw.map(item => ({
            month: item.month,
            total: Number(item.totalBookings)
        }));

        // Booking Status Distribution for Pie Chart
        const bookingStatusRaw = await prisma.booking.groupBy({
            by: ['status'],
            where: { tutorId: userId },
            _count: { id: true }
        });
        const bookingStatusDistribution = bookingStatusRaw.map(item => ({
            status: item.status,
            count: item._count.id
        }));

        return {
            overview: {
                totalBookings,
                completedBookings,
                upcomingBookings,
                reviewsReceived,
            },
            charts: {
                monthlyBookings,
                bookingStatusDistribution
            }
        };
    } else {
        // STUDENT
        const totalBookings = await prisma.booking.count({ where: { studentId: userId } });
        const completedBookings = await prisma.booking.count({ where: { studentId: userId, status: 'COMPLETED' } });
        const upcomingBookings = await prisma.booking.count({ where: { studentId: userId, status: 'CONFIRMED' } });
        const reviewsGiven = await prisma.review.count({ where: { studentId: userId } });

        // Monthly Bookings for Line/Bar Chart (Last 12 Months)
        const monthlyBookingsRaw: any[] = await prisma.$queryRaw`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM') as month, 
                COUNT(id) as "totalBookings"
            FROM "Booking"
            WHERE "studentId" = ${userId}
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12;
        `;

        const monthlyBookings = monthlyBookingsRaw.map(item => ({
            month: item.month,
            total: Number(item.totalBookings)
        }));

        // Booking Status Distribution for Pie Chart
        const bookingStatusRaw = await prisma.booking.groupBy({
            by: ['status'],
            where: { studentId: userId },
            _count: { id: true }
        });
        const bookingStatusDistribution = bookingStatusRaw.map(item => ({
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
