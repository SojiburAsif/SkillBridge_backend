import cron from "node-cron";
import { prisma } from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../../generated/prisma/enums";

export const startBookingCleanupJob = () => {
    // Pending payment cleanup (auto-delete after 1 hour)
    cron.schedule("*/10 * * * *", async () => {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const abandonedBookings = await prisma.booking.findMany({
                where: {
                    status: BookingStatus.AWAITING_PAYMENT,
                    paymentStatus: PaymentStatus.PENDING,
                    createdAt: {
                        lt: oneHourAgo,
                    },
                },
                select: {
                    id: true,
                    slotId: true,
                }
            });

            if (abandonedBookings.length > 0) {
                console.log(`[Cron] Found ${abandonedBookings.length} abandoned bookings.`);
                for (const booking of abandonedBookings) {
                    await prisma.$transaction(async (tx) => {
                        if (booking.slotId) {
                            await tx.tutorSlot.update({
                                where: { id: booking.slotId },
                                data: { isBooked: false },
                            });
                        }
                        // As requested: auto delete pending bookings after 1 hour
                        await tx.booking.delete({
                            where: { id: booking.id },
                        });
                    });
                }
            }
        } catch (error) {
            console.error("[Cron] Error during abandoned bookings cleanup:", error);
        }
    });

    // 20-Minute Alert Notification
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const upperLimit = new Date(now.getTime() + 21 * 60 * 1000); 
            const lowerLimit = new Date(now.getTime() + 19 * 60 * 1000); 

            // Find upcoming PAID/CONFIRMED bookings exactly ~20 minutes from now
            const upcomingBookings = await prisma.booking.findMany({
                where: {
                    paymentStatus: PaymentStatus.PAID,
                    dateTime: {
                        gte: lowerLimit,
                        lte: upperLimit
                    }
                },
                include: { tutor: true, student: true }
            });

            for (const booking of upcomingBookings) {
                const callId = booking.videoCallId || booking.id;
                
                const title = "Session starting in 20 minutes!";
                const message = `Your session starts soon. Join using Video Call ID: ${callId}`;

                // Notify Student
                await prisma.notification.create({
                    data: {
                        userId: booking.studentId,
                        title, message, transactionId: booking.transactionId
                    }
                });

                // Notify Tutor
                await prisma.notification.create({
                    data: {
                        userId: booking.tutorId,
                        title, message, transactionId: booking.transactionId
                    }
                });
            }
        } catch (error) {
            console.error("[Cron] Error checking 20-min upcoming sessions:", error);
        }
    });

    console.log("[Cron] Background scheduling initialized.");
};
