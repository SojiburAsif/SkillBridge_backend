import { Request, Response } from "express";
import { ReviewServices } from "./Review.service";

const ReviewPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ success: false, error: "Unauthorized" });
        }

        const { rating, comment, bookingId, tutorId } = req.body;

        if (!rating || !comment || !bookingId || !tutorId) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const result = await ReviewServices.PostReview({
            rating,
            comment,
            bookingId,
            studentId: user.id,
            tutorId,
        });

        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};


const GetAllReviews = async (req: Request, res: Response) => {
    try {
        const result = await ReviewServices.AllUserReview();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
};

const GetReviewByBookingId = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const result = await ReviewServices.GetReviewByBookingId(bookingId as string);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            error: err.message,
        });
    }
};

const GetReviewsByBookingIds = async (req: Request, res: Response) => {
    try {
        const body = req.body ?? {};
        const bookingIds = Array.isArray(body.bookingIds) ? body.bookingIds : [];
        const result = await ReviewServices.GetReviewsByBookingIds(bookingIds);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const GetTutorReviews = async (req: Request, res: Response) => {
    try {
        let { tutorId } = req.params;
        const user = req.user;

        // If 'me' is passed, fetch reviews for the logged-in tutor
        if (tutorId === 'me' && user) {
            tutorId = user.id;
        }

        if (!tutorId) {
            return res.status(400).json({ success: false, error: "Tutor ID is required" });
        }

        const result = await ReviewServices.GetReviewByTutorId(tutorId as string);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const GetMyGivenReviews = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({ success: false, error: "Unauthorized" });
        }

        const result = await ReviewServices.GetMyReviews(user.id);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const DeleteReviewAdmin = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.params;
        if (!reviewId) throw new Error("Review ID is required");

        const result = await ReviewServices.DeleteReview(reviewId as string);
        res.status(200).json({ success: true, data: result, message: "Review deleted successfully" });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const ReviewController = {
    ReviewPost,
    GetAllReviews,
    GetReviewByBookingId,
    GetReviewsByBookingIds,
    GetTutorReviews,
    GetMyGivenReviews,
    DeleteReviewAdmin
};
