import express from "express";
import { ReviewController } from "./Review.controller";
import { auth, UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/reviews", ReviewController.GetAllReviews);
router.post("/reviews", auth(UserRole.STUDENT), ReviewController.ReviewPost);

export const reviewRouter = router;
