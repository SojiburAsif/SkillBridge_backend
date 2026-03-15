import { Request, Response } from "express";

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: "NOT_FOUND",
        message: "Router Not Found",
        path: req.originalUrl,
        method: req.method
    });
};
