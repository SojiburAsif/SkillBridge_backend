import { Request, Response } from "express";
import { bookingServices } from "./booking.service";
import { UserRole } from "../../middleware/auth";
import { BookingStatus } from "../../../../generated/prisma/enums";

const createBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const { tutorProfileId, slotId, couponCode } = req.body;

        const bookingResult = await bookingServices.createBooking({
            studentId: user.id,
            tutorProfileId,
            slotId,
            couponCode
        });

        // The booking result now contains the SSL Gateway URL
        res.status(200).json({ success: true, data: bookingResult });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const payBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ success: false, error: "Unauthorized" });

        const bookingId = req.params.bookingId as string;
        const result = await bookingServices.initPaymentForExistingBooking(bookingId, user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const paymentSuccess = async (req: Request, res: Response) => {
    try {
        const tranId = req.params.tranId as string;
        await bookingServices.processPaymentSuccess(tranId);
        
        // Redirect to frontend success page
        res.redirect(`http://localhost:3000/payment/success?transactionId=${tranId}`);
    } catch (err: any) {
        res.redirect(`http://localhost:3000/payment/fail?reason=${err.message}`);
    }
};

const paymentFail = async (req: Request, res: Response) => {
    try {
        const tranId = req.params.tranId as string;
        await bookingServices.handlePaymentFailOrCancel(tranId);
        res.redirect(`http://localhost:3000/payment/fail?transactionId=${tranId}`);
    } catch (err: any) {
        res.redirect(`http://localhost:3000/payment/fail`);
    }
};

const paymentCancel = async (req: Request, res: Response) => {
    try {
        const tranId = req.params.tranId as string;
        await bookingServices.handlePaymentFailOrCancel(tranId);
        res.redirect(`http://localhost:3000/payment/cancel?transactionId=${tranId}`);
    } catch (err: any) {
        res.redirect(`http://localhost:3000/payment/cancel`);
    }
};

const paymentIpn = async (req: Request, res: Response) => {
    try {
        // IPN request from SSLCommerz 
        const ipnData = req.body;
        if (ipnData && ipnData.status === 'VALID' && ipnData.tran_id) {
            await bookingServices.processPaymentSuccess(ipnData.tran_id);
        } else if (ipnData && (ipnData.status === 'FAILED' || ipnData.status === 'CANCELLED') && ipnData.tran_id) {
            await bookingServices.handlePaymentFailOrCancel(ipnData.tran_id);
        }
        
        res.status(200).json({ message: "IPN Received" });
    } catch (err: any) {
        res.status(400).json({ message: "IPN Error", error: err.message });
    }
};

const mutualConfirm = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized");
        const bookingId = req.params.bookingId as string;

        const result = await bookingServices.handleMutualConfirmation(
            bookingId, 
            user.id, 
            user.role
        );
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const attendVideoCall = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized");
        const bookingId = req.params.bookingId as string;

        const result = await bookingServices.attendVideoCall(bookingId, user.id, user.role);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const rescheduleBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized");
        const bookingId = req.params.bookingId as string;

        const { dateTime } = req.body;
        const result = await bookingServices.rescheduleBooking(bookingId, String(dateTime), user.id, user.role);
        res.status(200).json({ success: true, data: result, message: "Booking rescheduled" });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const processRefund = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.bookingId as string;
        const result = await bookingServices.processRefund(bookingId);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const getAllBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.getAllbooking()
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const getIdByBooking = async (req: Request, res: Response) => {
    try {
        const bookingIdRaw = req.params.bookingId;
        const bookingId = (Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw) as string;
        
        const user = req.user;
        if (!user) throw new Error("Unauthorized: user not found");

        const result = await bookingServices.getSingleBooking(bookingId, user.role as UserRole, user.id);
        if (!result) return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
        
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const getMyBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

        const result = await bookingServices.getMyBooking(user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getMyTutorBookings = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized: user not found");

        const result = await bookingServices.getMyTutorBookings(user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const changeBookingStatus = async (req: Request, res: Response) => {
    try {
        const bookingIdRaw = req.params.bookingId;
        const bookingId = (Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw) as string;
        
        const user = req.user;
        if (!user) throw new Error("Unauthorized: user not found");

        const bookingStatus = req.body.status as BookingStatus;
        if (!bookingId) throw new Error("BookingId is required!");

        const result = await bookingServices.updateBookingStatus(bookingId, bookingStatus, user.id, user.role as UserRole);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const adminDeleteBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized: user not found");
        if (user.role !== UserRole.ADMIN) throw new Error("Unauthorized");

        const bookingIdRaw = req.params.bookingId;
        const bookingId = (Array.isArray(bookingIdRaw) ? bookingIdRaw[0] : bookingIdRaw) as string;
        if (!bookingId) throw new Error("BookingId is required!");

        const result = await bookingServices.adminDeleteBooking(bookingId);
        res.status(200).json({ success: true, data: result, message: "Booking deleted" });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const getCategorizedBookings = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) throw new Error("Unauthorized: user not found");

        const result = await bookingServices.getCategorizedBookings(user.id, user.role);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const bookingController = {
    getCategorizedBookings,
    createBooking,
    payBooking,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    paymentIpn,
    mutualConfirm,
    attendVideoCall,
    rescheduleBooking,
    processRefund,
    getAllBooking,
    getIdByBooking,
    getMyBooking,
    getMyTutorBookings,
    changeBookingStatus,
    adminDeleteBooking
};