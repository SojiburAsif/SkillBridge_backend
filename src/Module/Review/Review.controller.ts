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

const GetTutorReviews = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;

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

export const ReviewController = {
    ReviewPost,
    GetAllReviews,
    GetReviewByBookingId,
    GetTutorReviews

};
