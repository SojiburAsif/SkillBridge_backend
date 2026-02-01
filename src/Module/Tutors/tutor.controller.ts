/* tutor.controller.ts
   - Express controllers for tutor endpoints
   - Fixes TypeScript complaint by only adding defined query params to payload
*/

import { Request, Response } from "express";
import { tutorServices } from "./tutor.service";

/**
 * Small helper type: our auth middleware should attach `user` to Request.
 * If your project already has a typed RequestWithUser, replace this.
 */
type AuthRequest = Request & { user?: { id: string;[k: string]: any } };

/* GET /api/tutors - query: search, categoryId, rating, price */
const getAlltetutor = async (req: Request, res: Response) => {
    try {
        const { search, categoryId, rating, price } = req.query;

        // normalize types
        const searchString = typeof search === "string" ? search : undefined;
        const categoryIdString = typeof categoryId === "string" ? categoryId : undefined;
        const ratingNumber = typeof rating === "string" ? Number(rating) : undefined;
        const priceNumber = typeof price === "string" ? Number(price) : undefined;

        // Build payload but DO NOT include keys with undefined values.
        // This avoids TS exactOptionalPropertyTypes error when passing object literal.
        const payload: any = {};
        if (searchString !== undefined) payload.search = searchString;
        if (categoryIdString !== undefined) payload.categoryId = categoryIdString;
        if (!isNaN(Number(ratingNumber)) && ratingNumber !== undefined) payload.rating = ratingNumber;
        if (!isNaN(Number(priceNumber)) && priceNumber !== undefined) payload.price = priceNumber;

        const result = await tutorServices.getAlltetutor(payload);

        res.status(200).json({ success: true, count: result.length, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};




const getMytetutorProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user; // auth middleware থেকে

        if (!user || !user.id) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized: user id missing",
            });
        }

        const userId = user.id; // 👈 এখানেই magic

        const profile = await tutorServices.getMyProfiletetutor({ userId });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: profile,
        });
    } catch (err: any) {
        console.error("getMyTutorProfile error:", err);
        return res.status(500).json({
            success: false,
            error: err.message || "Server error",
        });
    }
};






/* POST /api/tutors - create profile (with optional slots) */
const createtutor = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        // destructure slots out, rest go to tutorData
        const { slots, ...tutorData } = req.body;

        // pass slots explicitly as an array or undefined
        const result = await tutorServices.createtutor(tutorData, user.id as string, Array.isArray(slots) ? slots : undefined);

        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

/* PUT /api/tutors - update profile */
const updateTutorController = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const result = await tutorServices.updateTutorProfile(req.body, user.id as string);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

/* GET /api/tutors/:tutorId */
const getTutorProfile = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) throw new Error("TutorId is required!");

        const result = await tutorServices.getTutorProfileById(tutorId as string);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

/* categories */
const getCategories = async (req: Request, res: Response) => {
    try {
        const result = await tutorServices.getCategoriesAll();
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

const PostCategory = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const category = req.body;
        if (!category || !category.name?.trim()) return res.status(400).json({ error: "Category name is required" });

        const result = await tutorServices.creaCategory(category);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message || "Failed to create category" });
    }
};

export const TutorController = {
    createtutor,
    updateTutorController,
    getAlltetutor,
    getTutorProfile,
    getCategories,
    PostCategory,
    getMytetutorProfile
};
