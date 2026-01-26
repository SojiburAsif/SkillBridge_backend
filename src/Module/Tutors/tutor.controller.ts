import { Request, Response } from "express";
import { tutorServices } from "./tutor.service";


const getAlltetutor = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        console.log(" value:", search)
        const searchString = typeof search === 'string' ? search : undefined
        const result = await tutorServices.getTutorProfile({ search: searchString });
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

export const TutorController = {
    createtutor,
    updateTutorController,
    getAlltetutor
}