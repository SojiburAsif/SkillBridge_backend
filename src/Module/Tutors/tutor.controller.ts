import { Request, Response } from "express";
import { tutorServices } from "./tutor.service";
import { string } from "better-auth/*";


const getAlltetutor = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        console.log(" value:", search)
        const searchString = typeof search === 'string' ? search : undefined
        const result = await tutorServices.getAlltetutor({ search: searchString });
        res.status(200).json({
            success: true,
            data: result
        })

    } catch (err: any) {
        res.status(400)
        console.log(err);
    }
}

const createtutor = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({
                error: "unauthorization",
            })
        }
        const result = await tutorServices.createtutor(req.body, user.id as string);
        res.status(200).json({
            success: true,
            data: result
        })

    } catch (err: any) {
        res.status(400)
        console.log(err);
    }
}

const updateTutorController = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: "unauthorized" });

        const result = await tutorServices.updateTutorProfile(req.body, user.id as string);

        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({ success: false, error: err.message });
    }
};

const getTutorProfile = async (req: Request, res: Response) => {
    try {
        const { tutorId } = req.params;
        if (!tutorId) {
            throw new Error("TutorId is requerd!")
        }
        const result = await tutorServices.getTutorProfileById(tutorId as string);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};


const getCategories = async (req: Request, res: Response) => {
    try {
        const result = await tutorServices.getCategoriesAll()
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
}


export const TutorController = {
    createtutor,
    updateTutorController,
    getAlltetutor,
    getTutorProfile,
    getCategories
}