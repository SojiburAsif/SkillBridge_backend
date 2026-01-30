import { prisma } from "../../lib/prisma";

const PostReview = async (data: {
    rating: number;
    comment: string;
    bookingId: string;
    studentId: string;
    tutorId: string;
}) => {
    // check tutor exists
    const tutor = await prisma.user.findUnique({ where: { id: data.tutorId } });
    if (!tutor) throw new Error("Tutor not found");

    // check student exists
    const student = await prisma.user.findUnique({ where: { id: data.studentId } });
    if (!student) throw new Error("Student not found");

    // check booking exists
    const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
    if (!booking) throw new Error("Booking not found");

    // create review
    const review = await prisma.review.create({ data });

    // update tutor average rating
    const agg = await prisma.review.aggregate({
        where: { tutorId: data.tutorId },
        _avg: { rating: true },
    });

    await prisma.tutorProfile.update({
        where: { userId: data.tutorId },
        data: { rating: agg._avg.rating ?? 0 },
    });

    return review;
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

export const ReviewServices = {
    AllUserReview,
    PostReview,
};
