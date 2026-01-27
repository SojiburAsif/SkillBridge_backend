import { Request, Response } from "express";
import { UserServices } from "./user.service";

const getUser = async (req: Request, res: Response) => {
    try {

        const result = await UserServices.AllUser()
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



export const UserController = {
    getUser
}