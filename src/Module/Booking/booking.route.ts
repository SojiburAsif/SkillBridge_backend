import express from 'express';
import { bookingController } from './booking.controller';

import { auth, UserRole } from '../../middleware/auth';




const router = express.Router();
router.get("/all/bookings", auth(UserRole.ADMIN), bookingController.getAllBooking)

router.get("/my/bookings", auth(UserRole.STUDENT), bookingController.getMyBooking)

router.get("/my/bookings/tutor", auth(UserRole.TUTOR), bookingController.getMyTutorBookings)

router.get("/bookings/:bookingId", auth(UserRole.ADMIN, UserRole.STUDENT), bookingController.getIdByBooking)

router.post("/bookings", auth(UserRole.STUDENT), bookingController.createBooking)

router.patch("/bookings/:bookingId", auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), bookingController.changeBookingStatus);


export const StudentBookingRouter = router;