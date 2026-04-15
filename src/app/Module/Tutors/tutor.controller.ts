/* tutor.controller.ts
   - Express controllers for tutor endpoints
   - Fixes TypeScript complaint by only adding defined query params to payload
*/

import { Request, Response } from "express";
import { tutorServices } from "./tutor.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

/**
 * Small helper type: our auth middleware should attach `user` to Request.
 */
type AuthRequest = Request & { user?: { id: string;[k: string]: any } };

const getAlltetutor = catchAsync(async (req: Request, res: Response) => {
    const { search, categoryId, rating, price, page, limit } = req.query;

    const payload: any = {};
    if (typeof search === "string") payload.search = search;
    if (typeof categoryId === "string") payload.categoryId = categoryId;
    if (typeof rating === "string" && !isNaN(Number(rating))) payload.rating = Number(rating);
    if (typeof price === "string" && !isNaN(Number(price))) payload.price = Number(price);
    if (typeof page === "string" && !isNaN(Number(page))) payload.page = Number(page);
    if (typeof limit === "string" && !isNaN(Number(limit))) payload.limit = Number(limit);

    const { meta, result } = await tutorServices.getAlltetutor(payload);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Tutors retrieved successfully",
        meta,
        data: result
    });
});

const getMytetutorProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user; 
    if (!user || !user.id) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Unauthorized: user id missing",
        });
    }

    const profile = await tutorServices.getMyProfiletetutor({ userId: user.id });

    if (!profile) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: "Profile not found",
        });
    }

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "My tutor profile retrieved successfully",
        data: profile
    });
});

const updateTutorController = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized", success: false });

    // Extract slots from body
    const { slots, ...tutorData } = req.body;

    const result = await tutorServices.updateTutorProfile(
        tutorData, 
        user.id as string,
        Array.isArray(slots) ? slots : undefined
    );
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Tutor profile saved successfully",
        data: result
    });
});

const getTutorProfile = catchAsync(async (req: Request, res: Response) => {
    const { tutorId } = req.params;
    if (!tutorId) throw new Error("TutorId is required!");

    const result = await tutorServices.getTutorProfileById(tutorId as string);
    
    if (!result) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Tutor not found" });
    }

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Tutor retrieved successfully",
        data: result
    });
});

export const TutorController = {
    updateTutorController,
    getAlltetutor,
    getTutorProfile,
    getMytetutorProfile
};
