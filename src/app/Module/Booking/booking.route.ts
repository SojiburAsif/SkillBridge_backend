import express from 'express';
import { bookingController } from './booking.controller';
import { auth, UserRole } from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { BookingValidation } from './booking.validation';

const router = express.Router();

// --- Payment & Webhook Routes (No auth needed as SSLCommerz hits these) ---
router.post("/bookings/payment/success/:tranId", bookingController.paymentSuccess);
router.post("/bookings/payment/fail/:tranId", bookingController.paymentFail);
router.post("/bookings/payment/cancel/:tranId", bookingController.paymentCancel);
router.post("/bookings/payment/ipn", bookingController.paymentIpn);

// --- Core Booking Routes ---
router.post(
    "/bookings", 
    auth(UserRole.STUDENT), 
    validateRequest(BookingValidation.createBookingZodSchema), 
    bookingController.createBooking
);
router.post(
  "/bookings/:bookingId/pay",
  auth(UserRole.STUDENT),
  bookingController.payBooking
);
router.get("/all/bookings", auth(UserRole.ADMIN), bookingController.getAllBooking);
router.get("/my/bookings/categorized", auth(UserRole.STUDENT, UserRole.TUTOR), bookingController.getCategorizedBookings);
router.get("/my/bookings", auth(UserRole.STUDENT), bookingController.getMyBooking);
router.get("/my/bookings/tutor", auth(UserRole.TUTOR), bookingController.getMyTutorBookings);
router.get("/bookings/:bookingId", auth(UserRole.ADMIN, UserRole.STUDENT), bookingController.getIdByBooking);
router.delete("/bookings/:bookingId", auth(UserRole.ADMIN), bookingController.adminDeleteBooking);
router.patch(
    "/bookings/:bookingId", 
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), 
    validateRequest(BookingValidation.changeBookingStatusZodSchema), 
    bookingController.changeBookingStatus
);

// --- Mutual Confirmation & Refund (Advanced Phase) ---
router.patch("/bookings/:bookingId/confirm", auth(UserRole.STUDENT, UserRole.TUTOR), bookingController.mutualConfirm);
router.patch(
  "/bookings/:bookingId/attend",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  bookingController.attendVideoCall
);
router.patch(
  "/bookings/:bookingId/reschedule",
  auth(UserRole.TUTOR, UserRole.ADMIN),
  validateRequest(BookingValidation.rescheduleBookingZodSchema),
  bookingController.rescheduleBooking
);
router.patch("/bookings/:bookingId/refund", auth(UserRole.ADMIN), bookingController.processRefund);

export const StudentBookingRouter = router;