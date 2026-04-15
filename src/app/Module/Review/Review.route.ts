import express from "express";
import { ReviewController } from "./Review.controller";
import { auth, UserRole } from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { ReviewValidation } from "./Review.validation";

const router = express.Router();

router.get("/reviews", ReviewController.GetAllReviews);
router.get("/reviews/tutor/:tutorId", auth(UserRole.TUTOR, UserRole.STUDENT, UserRole.ADMIN), ReviewController.GetTutorReviews);
router.get("/reviews/student/me", auth(UserRole.STUDENT), ReviewController.GetMyGivenReviews);
router.get("/reviews/booking/:bookingId", auth(), ReviewController.GetReviewByBookingId);
router.post("/reviews/by-bookings", auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), ReviewController.GetReviewsByBookingIds);

router.post("/reviews", 
  auth(UserRole.STUDENT), 
  validateRequest(ReviewValidation.createReviewZodSchema), 
  ReviewController.ReviewPost
);

router.delete("/reviews/:reviewId", auth(UserRole.ADMIN), ReviewController.DeleteReviewAdmin);


export const reviewRouter = router;
