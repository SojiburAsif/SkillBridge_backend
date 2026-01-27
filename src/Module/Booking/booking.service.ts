import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



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




export const bookingServices = {
    createBooking,
    getAllbooking
}
