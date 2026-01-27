import { Request, Response } from "express";
import { bookingServices } from "./booking.service";




const createBooking = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.studentId = user?.id;
        const result = await bookingServices.createBooking(req.body)

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (err: any) {
        res.status(400).send(err)
        console.log(err);
    }
}


const getAllBooking = async (req: Request, res: Response) => {
    try {
        const result = await bookingServices.getAllbooking()
        res.status(200).json({
            success: true,
            data: result
        })
    } catch (err: any) {
        res.status(400).send(err)
        console.log(err);
    }
}

export const bookingController = {
    createBooking,
    getAllBooking
}