import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";



const createBooking = async (payload: {
    studentId: string;
    tutorProfileId: string;
    slotId: string;
    status?: BookingStatus;
}) => {
    // 1️⃣ TutorProfile থেকে userId বের করি
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { id: payload.tutorProfileId },
        select: { userId: true },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    // 2️⃣ Slot validate করি
    const slot = await prisma.tutorSlot.findFirst({
        where: {
            id: payload.slotId,
            tutorId: payload.tutorProfileId, // TutorProfile.id
            isBooked: false,
        },
    });

    if (!slot) {
        throw new Error("Invalid slot or slot already booked");
    }

    // 3️⃣ Booking create (User.id ব্যবহার করে)
    const booking = await prisma.booking.create({
        data: {
            studentId: payload.studentId,
            tutorId: tutorProfile.userId, // ✅ REAL User.id
            slotId: slot.id,
            dateTime: slot.startTime, // ✅ valid Date
            status: payload.status ?? BookingStatus.CONFIRMED,
        },
    });

    // 4️⃣ Slot booked mark করি
    await prisma.tutorSlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
    });

    return booking;
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
            studentId: userId,
        },
        orderBy: {
            dateTime: "desc",
        },
        include: {
            tutor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
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
    if (role === UserRole.TUTOR && newStatus === "COMPLETED") {
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
