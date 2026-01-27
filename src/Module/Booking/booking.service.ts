import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";



const createBooking = async (payload: {
    studentId: string;
    tutorProfileId: string;
    dateTime: string;
    status: BookingStatus;
}) => {

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { id: payload.tutorProfileId },
        select: { userId: true }
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    return await prisma.booking.create({
        data: {
            studentId: payload.studentId,
            tutorId: tutorProfile.userId,
            dateTime: new Date(payload.dateTime),
            status: payload.status || "CONFIRMED"
        }
    });
};

const getAllbooking = async () => {
    const result = await prisma.booking.findMany()
    return result
}


const getSingleBooking = async (
    bookingId: string,
    role: UserRole,
    userId: string
) => {
    if (role === UserRole.ADMIN) {
        return await prisma.booking.findUnique({
            where: { id: bookingId }
        });
    }

    if (role === UserRole.STUDENT) {
        return await prisma.booking.findFirst({
            where: {
                id: bookingId,
                studentId: userId
            }
        });
    }

    throw new Error("Unauthorized access");
};

const getMyBooking = async (userId: string) => {
    return await prisma.booking.findMany({
        where: {
            studentId: userId
        },
        orderBy: {
            dateTime: "desc"
        }
    });
};
const getMyTutorBookings = async (userId: string) => {
    return await prisma.booking.findMany({
        where: {
            tutorId: userId
        },
        include: {
            student: true
        },
        orderBy: {
            dateTime: "desc"
        }
    });
};
const updateBookingStatus = async (
    bookingId: string,
    newStatus: BookingStatus,
    userId: string,
    role: UserRole
) => {

    if (role === UserRole.ADMIN) {
        return await prisma.booking.update({
            where: { id: bookingId },
            data: { status: newStatus }
        });
    }


    // Tutor confirm
    if (role === UserRole.TUTOR && newStatus === "CONFIRMED") {
        return await prisma.booking.update({
            where: { id: bookingId, tutorId: userId },
            data: { status: newStatus }
        });
    }

    // Student cancel
    if (role === UserRole.STUDENT && newStatus === "CANCELLED") {
        return await prisma.booking.update({
            where: { id: bookingId, studentId: userId },
            data: { status: newStatus }
        });
    }
    throw new Error("Unauthorized status change");
};



export const bookingServices = {
    createBooking,
    getAllbooking,
    getSingleBooking,
    getMyBooking,
    getMyTutorBookings,
    updateBookingStatus
}
