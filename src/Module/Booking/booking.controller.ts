import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { UserRole } from "../../middleware/auth";
import { BookingStatus } from "../../../generated/prisma/enums";





const createBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { tutorProfileId, slotId, dateTime, status } = req.body;

        const booking = await bookingServices.createBooking({
            studentId: user.id,
            tutorProfileId,
            slotId,
            status
        });

        res.status(200).json({ success: true, data: booking });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const getAllBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.getAllbooking()
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (err: any) {
        res.status(400).send(err)
        console.log(err);
    }
}

const getIdByBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = Array.isArray(req.params.bookingId)
            ? req.params.bookingId[0]
            : req.params.bookingId;

        const user = req.user;
        if (!user) {
            throw new Error("Unauthorized: user not found");
        }

        const { id: userId, role } = user;

        if (!bookingId) {
            throw new Error("BookingId is required!");
        }

        const result = await bookingServices.getSingleBooking(
            bookingId,
            role as UserRole,
            userId
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or unauthorized"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

const getMyBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await bookingServices.getMyBooking(user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};

const getMyTutorBookings = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Unauthorized: user not found");
        }

        const result = await bookingServices.getMyTutorBookings(user.id);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

const changeBookingStatus = async (req: Request, res: Response) => {
    try {
        const bookingId = Array.isArray(req.params.bookingId)
            ? req.params.bookingId[0]
            : req.params.bookingId;

        const user = req.user;
        if (!user) {
            throw new Error("Unauthorized: user not found");
        }

        const { id: userId, role } = user;
        const bookingStatus = req.body.status as BookingStatus;

        if (!bookingId) {
            throw new Error("BookingId is required!");
        }

        const result = await bookingServices.updateBookingStatus(
            bookingId,
            bookingStatus as BookingStatus,
            userId,
            role as UserRole
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};



export const bookingController = {
    createBooking,
    getAllBooking,
    getIdByBooking,
    getMyBooking,
    getMyTutorBookings,
    changeBookingStatus
}