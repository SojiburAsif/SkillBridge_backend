import express from 'express';
import { bookingController } from './booking.controller';

import { auth, UserRole } from '../../middleware/auth';




const router = express.Router();
router.get("/all/bookings", auth(UserRole.ADMIN), bookingController.getAllBooking)

router.post("/bookings", auth(UserRole.STUDENT), bookingController.createBooking)

export const StudentBookingRouter = router;