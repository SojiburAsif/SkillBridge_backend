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

export const UserController = {
    getUser,
    getSingleUserController,
    updateUserStatusController
};
