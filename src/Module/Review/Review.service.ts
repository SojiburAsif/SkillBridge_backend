import { prisma } from "../../lib/prisma";



const PostReview = async (data: {

    rating: number;

    comment: string;

    bookingId: string;

    studentId: string;

    tutorId: string;

}) => {

    // 1. Check if review already exists (Schema level-e @unique thakle-o eita kora best practice)

    const existingReview = await prisma.review.findUnique({

        where: { bookingId: data.bookingId }

    });



    if (existingReview) {

        throw new Error("You have already reviewed this booking!");

    }

    // 2. Transaction use kora bhalo jate review create o rating update eksathe hoy

    return await prisma.$transaction(async (tx) => {

        // Create review

        const review = await tx.review.create({ data });

        // Update tutor average rating

        const agg = await tx.review.aggregate({

            where: { tutorId: data.tutorId },

            _avg: { rating: true },

        });

        await tx.tutorProfile.update({

            where: { userId: data.tutorId },

            data: { rating: agg._avg.rating ?? 0 },

        });

        return review;

    });

};

const GetReviewByBookingId = async (bookingId: string) => {

    return await prisma.review.findUnique({

        where: { bookingId },

        include: {

            student: true,

            tutor: true

        }

    });

};

const AllUserReview = async () => {
    return await prisma.review.findMany({
        include: {
            student: true,
            tutor: true,
            booking: true,
        },
    });
};


const GetReviewByTutorId = async (tutorId: string) => {
    return await prisma.review.findMany({
        where: { tutorId },
        include: {
            student: { select: { name: true, email: true } },
            booking: true,
        },
        orderBy: { createdAt: 'desc' }
    });
};
export const ReviewServices = {
    AllUserReview,
    PostReview,
    GetReviewByBookingId,
    GetReviewByTutorId
};
