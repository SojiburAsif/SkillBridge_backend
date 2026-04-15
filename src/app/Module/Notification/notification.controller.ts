import { Request, Response } from "express";
import { notificationService } from "./notification.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

type AuthRequest = Request & { user?: { id: string; role: string; [k: string]: any } };

const getMyNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");

    const result = await notificationService.getMyNotifications(user.id);
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
    });
});

const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");

    const notificationId = req.params.id as string;
    const result = await notificationService.markAsRead(notificationId, user.id);
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Notification marked as read successfully",
        data: result,
    });
});

const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");

    const result = await notificationService.markAllAsRead(user.id);
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "All notifications marked as read successfully",
        data: result,
    });
});

const deleteNotification = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) throw new Error("Unauthorized");

    const notificationId = req.params.id as string;
    const result = await notificationService.deleteNotification(notificationId, user.id);
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Notification deleted successfully",
        data: result,
    });
});

export const notificationController = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};