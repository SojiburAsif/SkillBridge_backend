import { prisma } from "../../lib/prisma";
import { BookingStatus } from "../../../../generated/prisma/enums";

const PostReview = async (data: {
    rating: number;
    comment: string;
    bookingId: string;
    studentId: string;
    tutorId: string;
}) => {
    // 1. Check if booking exists, is COMPLETED, and hasn't been reviewed
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

    // 2. Transaction to create review & update tutor ratings atomically
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
            },
        });

        return review;
    });
};

const GetReviewByBookingId = async (bookingId: string) => {
    return await prisma.review.findUnique({
        where: { bookingId },
        include: { student: true, tutor: true }
    });
};

const GetReviewsByBookingIds = async (bookingIds: string[]) => {
    const ids = Array.isArray(bookingIds) ? bookingIds.filter((x) => typeof x === "string" && x.length > 5) : [];
    if (ids.length === 0) return [];
    return prisma.review.findMany({
        where: { bookingId: { in: ids } },
        select: { bookingId: true },
    });
};

const AllUserReview = async () => {
    return await prisma.review.findMany({
        include: { student: true, tutor: true, booking: true },
        orderBy: { createdAt: "desc" }
    });
};

const GetReviewByTutorId = async (tutorId: string) => {
    return await prisma.review.findMany({
        where: { tutorId },
        include: {
            student: { select: { name: true, email: true, image: true } },
            booking: true,
        },
        orderBy: { createdAt: 'desc' }
    });
};

const GetMyReviews = async (studentId: string) => {
    return await prisma.review.findMany({
        where: { studentId },
        include: {
            tutor: { select: { name: true, email: true, image: true } },
            booking: true,
        },
        orderBy: { createdAt: 'desc' }
    });
};

const DeleteReview = async (reviewId: string) => {
    return await prisma.$transaction(async (tx) => {
        const review = await tx.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new Error("Review not found");

        const deletedReview = await tx.review.delete({ where: { id: reviewId } });

        // Recalculate average after deletion
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
            },
        });

        return deletedReview;
    });
};

export const ReviewServices = {
    AllUserReview,
    PostReview,
    GetReviewByBookingId,
    GetReviewsByBookingIds,
    GetReviewByTutorId,
    GetMyReviews,
    DeleteReview
};
