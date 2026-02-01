import { Request, Response } from "express";
import { UserServices } from "./user.service";
import { $Enums } from "../../../generated/prisma/client";

// Get all users
const getUser = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.AllUser();
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};
const getStudentProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Unauthorized",
            });
        }
        const result = await UserServices.getStudentProfile(user.id as string);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Get single user
const getSingleUserController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await UserServices.getSingleUser(id as string);
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};


const updateUserStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate against enum values
        if (!Object.values($Enums.UserStatus).includes(status)) {
            throw new Error("Invalid status value");
        }

        const result = await UserServices.updateUserStatus(id as string, status as $Enums.UserStatus);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};



const StudentProfileCreate = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Unauthorized",
            });
        }

        const result = await UserServices.createStudentProfile(req.body, user.id as string);

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
const getAllStudentProfiles = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.getAllStudentProfiles();

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



const studentProfileUpsert = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await UserServices.studentProfileUpsert(
            req.body,
            user.id as string
        );

        res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};



export const UserController = {
    getUser,
    getSingleUserController,
    updateUserStatusController,
    StudentProfileCreate,
    getStudentProfile,
    getAllStudentProfiles,
    studentProfileUpsert
};
