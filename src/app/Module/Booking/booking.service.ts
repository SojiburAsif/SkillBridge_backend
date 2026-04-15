import { BookingStatus, PaymentStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import { initSSLCommerz } from "./payment.utils";
import { CouponService } from "../Coupon/coupon.service";

const initPaymentForExistingBooking = async (bookingId: string, studentId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { student: true },
    });
    if (!booking) throw new Error("Booking not found");
    if (booking.studentId !== studentId) throw new Error("Unauthorized");

    if (booking.paymentStatus === PaymentStatus.PAID) throw new Error("Booking already paid");
    if (booking.status === BookingStatus.CANCELLED) throw new Error("This booking is cancelled");

    // If the booking is too old, it might be cleaned up by cron soon.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (booking.createdAt < oneHourAgo && booking.paymentStatus === PaymentStatus.PENDING) {
        throw new Error("Payment window expired");
    }

    const tutorProfile = await prisma.tutorProfile.findFirst({
        where: { userId: booking.tutorId },
        select: { price: true },
    });
    const payAmount = Number((booking as any).paidAmount ?? tutorProfile?.price ?? 0);
    if (!Number.isFinite(payAmount) || payAmount <= 0) throw new Error("Tutor profile not found");

    const transactionId = booking.transactionId ?? `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
    if (!booking.transactionId) {
        await prisma.booking.update({ where: { id: booking.id }, data: { transactionId } });
    }

    const sslcz = initSSLCommerz();
    const data = {
        total_amount: Number(payAmount),
        currency: 'BDT',
        tran_id: transactionId,

        success_url: `https://skillbridgebackend.vercel.app/api/bookings/payment/success/${transactionId}`,
        fail_url: `https://skillbridgebackend.vercel.app/api/bookings/payment/fail/${transactionId}`,
        cancel_url: `https://skillbridgebackend.vercel.app/api/bookings/payment/cancel/${transactionId}`,
        ipn_url: `https://skillbridgebackend.vercel.app/api/bookings/payment/ipn`,

        shipping_method: 'No',
        product_name: 'Tutor Session',
        product_category: 'Education',
        product_profile: 'general',

        cus_name: booking.student?.name ?? 'Student',
        cus_email: booking.student?.email ?? 'student@mentorflow.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: booking.student?.phone ?? '01711111111'
    };


    const apiResponse = await sslcz.init(data);
    if (apiResponse?.GatewayPageURL) {
        return {
            bookingId: booking.id,
            transactionId,
            paymentUrl: apiResponse.GatewayPageURL,
        };
    }
    throw new Error("Failed to initialize payment gateway");
};

const createBooking = async (payload: {
    studentId: string;
    tutorProfileId: string;
    slotId: string;
    couponCode?: string;
}) => {
    // 1. TutorProfile info
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { id: payload.tutorProfileId },
        select: { userId: true, price: true },
    });

    if (!tutorProfile) throw new Error("Tutor profile not found");

    // 2. Slot validate
    const slot = await prisma.tutorSlot.findFirst({
        where: { id: payload.slotId, tutorId: payload.tutorProfileId },
    });

    if (!slot) throw new Error("Invalid slot");
    if (slot.isBooked) throw new Error("This slot is already booked by someone else!");

    // Price (with optional coupon)
    const originalPrice = Number(tutorProfile.price ?? 0);
    if (!Number.isFinite(originalPrice) || originalPrice < 0) throw new Error("Invalid tutor price");

    let couponId: string | null = null;
    let discountAmount = 0;
    let finalAmount = originalPrice;
    if (payload.couponCode && String(payload.couponCode).trim().length > 0) {
        const applied = await CouponService.applyCoupon(String(payload.couponCode).trim(), originalPrice);
        couponId = applied.couponId;
        discountAmount = Number((applied as any).discountAmount ?? 0);
        finalAmount = Number(applied.finalPrice);
    }

    // Generate Unique Transaction ID
    const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 4. Create booking as AWAITING_PAYMENT and slot update atomically
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
                ...(couponId ? { couponId } : {}),
            } as any,
        });

        await tx.tutorSlot.update({
            where: { id: slot.id },
            data: { isBooked: true },
        });

        if (couponId) {
            await tx.coupon.update({
                where: { id: couponId },
                data: { usageCount: { increment: 1 } },
            });
        }

        return newBooking;
    });

    // 5. Initialize SSLCommerz
    const sslcz = initSSLCommerz();
    const data = {
        total_amount: Number(finalAmount),
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `http://localhost:5000/api/bookings/payment/success/${transactionId}`,
        fail_url: `http://localhost:5000/api/bookings/payment/fail/${transactionId}`,
        cancel_url: `http://localhost:5000/api/bookings/payment/cancel/${transactionId}`,
        ipn_url: `http://localhost:5000/api/bookings/payment/ipn`,
        shipping_method: 'No',
        product_name: 'Tutor Session',
        product_category: 'Education',
        product_profile: 'general',
        cus_name: 'Student',
        cus_email: 'student@mentorflow.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111'
    };

    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
        return {
            booking,
            paymentUrl: apiResponse.GatewayPageURL,
        };
    } else {
        throw new Error("Failed to initialize payment gateway");
    }
};

const processPaymentSuccess = async (transactionId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { transactionId },
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

    // Notify Tutor
    await prisma.notification.create({
        data: {
            userId: booking.tutorId,
            title: "Booking paid",
            message: `Payment received: ৳${Number((booking as any).paidAmount ?? 0).toLocaleString()} · Session: ${booking.dateTime}. Video Room ID: ${videoCallId}`,
            transactionId,
            type: "PAYMENT",
            metadata: {
                kind: "PAYMENT",
                bookingId: booking.id,
                amount: Number((booking as any).paidAmount ?? 0),
                currency: "BDT"
            }
        }
    });

    return updatedBooking;
};

const handlePaymentFailOrCancel = async (transactionId: string) => {
    const booking = await prisma.booking.findUnique({ where: { transactionId } });
    if (!booking) return;

    await prisma.$transaction(async (tx) => {
        if (booking.slotId) {
            await tx.tutorSlot.update({
                where: { id: booking.slotId },
                data: { isBooked: false },
            });
        }

        await tx.booking.update({
            where: { id: booking.id },
            data: {
                status: BookingStatus.CANCELLED,
                paymentStatus: PaymentStatus.FAILED,
            }
        });
    });
};

const updateBookingStatus = async (
    bookingId: string,
    newStatus: BookingStatus,
    userId: string,
    role: UserRole
) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    let updatedBooking;

    if (newStatus === "CONFIRMED" && booking.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("Cannot confirm booking because payment has failed or is pending.");
    }

    if (role === UserRole.ADMIN) {
        updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus },
            include: { tutor: true, student: true }
        });
    }
    else if (role === UserRole.TUTOR && (newStatus === "COMPLETED" || newStatus === "RESCHEDULED" || newStatus === "CONFIRMED")) {
        if (booking.tutorId !== userId) throw new Error("Unauthorized");

        updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus },
            include: { tutor: true, student: true }
        });

        // Notify Student
        await prisma.notification.create({
            data: {
                userId: booking.studentId,
                title: `Booking Status: ${newStatus}`,
                message: `Your booking was marked as ${newStatus} by your tutor.`,
                transactionId: booking.transactionId,
            }
        });
    }
    else if (role === UserRole.STUDENT && (newStatus === "CANCELLED" || newStatus === "ATTENDED")) {
        if (booking.studentId !== userId) throw new Error("Unauthorized");

        if (newStatus === "CANCELLED") {
            const timeDifferenceInHours = (new Date(booking.dateTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);

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

                const admin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
                if (admin) {
                    await prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: "Refund Requested",
                            message: `Student requested a refund for transaction ${booking.transactionId}`,
                            transactionId: booking.transactionId,
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
                transactionId: updatedBooking.transactionId,
            }
        });
    }

    return updatedBooking;
};

const handleMutualConfirmation = async (bookingId: string, userId: string, role: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    if (booking.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("Cannot confirm mutually because payment has failed or is pending.");
    }

    let confirmationData = typeof booking.mutualConfirmation === 'object' && booking.mutualConfirmation !== null
        ? (booking.mutualConfirmation as any)
        : { tutorConfirmed: false, studentConfirmed: false };

    if (role === UserRole.TUTOR && booking.tutorId === userId) {
        confirmationData.tutorConfirmed = true;
    } else if (role === UserRole.STUDENT && booking.studentId === userId) {
        confirmationData.studentConfirmed = true;
    } else {
        throw new Error("Unauthorized confirmation");
    }

    let videoSessionData: any = booking.videoSession ?? { sessionUrl: null, isActive: false, expiresAt: null };

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

    // If a booking was rescheduled, the first confirmation should move it back into the normal flow.
    // Otherwise it stays "RESCHEDULED" forever until both confirm, which is confusing for users.
    const nextStatus =
        confirmationData.tutorConfirmed && confirmationData.studentConfirmed
            ? BookingStatus.CONFIRMED
            : booking.status === BookingStatus.RESCHEDULED
                ? BookingStatus.PENDING_CONFIRMATION
                : booking.status;

    return await prisma.booking.update({
        where: { id: bookingId },
        data: {
            mutualConfirmation: confirmationData,
            videoSession: videoSessionData,
            status: nextStatus
        }
    });
};

const attendVideoCall = async (bookingId: string, userId: string, role: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    if (booking.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("Payment not completed yet");
    }

    // Allow join only 10 minutes before start until 60 minutes after start
    const now = Date.now();
    const start = new Date(booking.dateTime).getTime();
    const joinWindowStart = start - 10 * 60 * 1000;
    const joinWindowEnd = start + 60 * 60 * 1000;

    if (now < joinWindowStart) {
        throw new Error("Join Call will be available 10 minutes before the booking time");
    }
    if (now > joinWindowEnd) {
        throw new Error("This call window has ended");
    }

    let confirmationData =
        typeof booking.mutualConfirmation === "object" && booking.mutualConfirmation !== null
            ? (booking.mutualConfirmation as any)
            : { tutorConfirmed: false, studentConfirmed: false };

    if (role === UserRole.TUTOR && booking.tutorId === userId) {
        confirmationData.tutorConfirmed = true;
    } else if (role === UserRole.STUDENT && booking.studentId === userId) {
        confirmationData.studentConfirmed = true;
    } else {
        throw new Error("Unauthorized attendance");
    }

    // Ensure video session exists
    let videoSessionData: any = booking.videoSession ?? { sessionUrl: null, isActive: false, expiresAt: null };
    const existingUrl = videoSessionData?.sessionUrl;
    if (!existingUrl) {
        videoSessionData.sessionUrl = `https://meet.jit.si/MentorFlow_${booking.id}_${Date.now()}`;
    }

    // If both attended, activate + confirm
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

    // Notify the other party
    const otherUserId = role === UserRole.TUTOR ? updated.studentId : updated.tutorId;
    await prisma.notification.create({
        data: {
            userId: otherUserId,
            title: "Video Call Attended",
            message: `${role} joined the call for booking ${updated.transactionId ?? updated.id}.`,
            transactionId: updated.transactionId ?? null,
        }
    });

    return updated;
};

const rescheduleBooking = async (bookingId: string, dateTimeISO: string, userId: string, role: string) => {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    // Tutor or Admin only (route already restricts)
    if (role === UserRole.TUTOR && booking.tutorId !== userId) throw new Error("Unauthorized");

    const newDate = new Date(dateTimeISO);
    if (Number.isNaN(newDate.getTime())) throw new Error("Invalid dateTime");

    // reset confirmations + deactivate session on reschedule
    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            dateTime: newDate,
            status: BookingStatus.RESCHEDULED,
            mutualConfirmation: { tutorConfirmed: false, studentConfirmed: false } as any,
            videoSession: { sessionUrl: null, isActive: false, expiresAt: null } as any,
        },
        include: { tutor: true, student: true }
    });

    await prisma.notification.create({
        data: {
            userId: updated.studentId,
            title: "Booking Rescheduled",
            message: `Your booking has been rescheduled to ${newDate.toISOString()}.`,
            transactionId: updated.transactionId ?? null,
        }
    });

    return updated;
};
const processRefund = async (bookingId: string) => {
    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: PaymentStatus.REFUND_PROCESSED }
    });

    await prisma.notification.create({
        data: {
            userId: updated.studentId,
            title: "Refund Processed",
            message: `Your refund for transaction ${updated.transactionId} has been fully processed.`,
            transactionId: updated.transactionId,
        }
    });

    return updated;
};

const getAllbooking = async () => prisma.booking.findMany({ include: { tutor: true, student: true } });

const getSingleBooking = async (bookingId: string, role: UserRole, userId: string) => {
    const b = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!b) return null;
    if (role === UserRole.ADMIN) return b;
    if (role === UserRole.STUDENT && b.studentId === userId) return b;
    if (role === UserRole.TUTOR && b.tutorId === userId) return b;
    throw new Error("Unauthorized access");
};

const getMyBooking = async (userId: string) => prisma.booking.findMany({ where: { studentId: userId }, orderBy: { dateTime: "desc" }, include: { tutor: true } });
const getMyTutorBookings = async (userId: string) => prisma.booking.findMany({ where: { tutorId: userId }, orderBy: { dateTime: "desc" }, include: { student: true } });

const adminDeleteBooking = async (bookingId: string) => {
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
                data: { isBooked: false },
            }).catch(() => null);
        }

        if (booking.couponId) {
            const c = await tx.coupon.findUnique({ where: { id: booking.couponId }, select: { usageCount: true } });
            if (c && Number(c.usageCount ?? 0) > 0) {
                await tx.coupon.update({
                    where: { id: booking.couponId },
                    data: { usageCount: { decrement: 1 } },
                });
            }
        }

        await tx.booking.delete({ where: { id: booking.id } });
    });

    return { id: booking.id };
};

const getCategorizedBookings = async (userId: string, role: string) => {
    let whereCondition: any = {};

    if (role === UserRole.STUDENT) {
        whereCondition = { studentId: userId };
    } else if (role === UserRole.TUTOR) {
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

    const now = new Date().getTime();
    // Assuming 1-hour session duration for "Live" categorization
    const SESSION_DURATION_MS = 60 * 60 * 1000;

    const upcoming: any[] = [];
    const live: any[] = [];
    const past: any[] = [];

    bookings.forEach((booking) => {
        const bookingStart = new Date(booking.dateTime).getTime();
        const bookingEnd = bookingStart + SESSION_DURATION_MS;

        // If explicitly cancelled or completed, it's immediately past
        if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
            past.push(booking);
        } else if (now < bookingStart) {
            // Still in the future
            upcoming.push(booking);
        } else if (now >= bookingStart && now <= bookingEnd) {
            // Currently within the 1-hour window
            live.push(booking);
        } else {
            // Time has passed the 1-hour window
            past.push(booking);
        }
    });

    return {
        upcoming,
        live,
        past
    };
};

export const bookingServices = {
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
