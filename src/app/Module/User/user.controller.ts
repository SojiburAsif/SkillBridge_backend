import { Request, Response } from "express";
import { UserServices } from "./user.service";
import { $Enums } from "../../../../generated/prisma/client";

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

// Get basic user info (for inbox profile preview)
const getBasicUserController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "User id is required" });
        const result = await UserServices.getBasicUserById(id as string);
        if (!result) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
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

const updateTutorProfileStatusController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tutorStatus } = req.body;
        const allowed = ["ACTIVE", "INACTIVE", "PENDING", "BANNED"];
        if (!allowed.includes(String(tutorStatus))) throw new Error("Invalid tutorStatus value");
        const result = await UserServices.updateTutorProfileStatus(id as string, tutorStatus as "ACTIVE" | "INACTIVE" | "PENDING" | "BANNED");
        res.status(200).json({ success: true, data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

const deleteUserByAdminController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await UserServices.deleteUserByAdmin(id as string);
        res.status(200).json({ success: true, message: "User deleted successfully", data: result });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
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

const getDashboardAnalytics = async (req: Request, res: Response) => {
    try {
        const result = await UserServices.getDashboardAnalytics();

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

const getMyProfileController = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await UserServices.getMyProfile(user.id as string, user.role as string);

        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully!",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updateMyProfileController = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await UserServices.updateMyProfile(
            req.body,
            user.id as string,
            user.role as string
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
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
    getBasicUserController,
    updateUserStatusController,
    updateTutorProfileStatusController,
    deleteUserByAdminController,
    StudentProfileCreate,
    getStudentProfile,
    getAllStudentProfiles,
    getDashboardAnalytics,
    updateMyProfile: updateMyProfileController,
    getMyProfileController
};
