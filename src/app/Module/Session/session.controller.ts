import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { SessionService } from './session.service';
import { StatusCodes } from 'http-status-codes';

type AuthRequest = Request & { user?: { id: string; role: string; [k: string]: any } };

export const getMySessions = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const sessions = await SessionService.getMySessions(userId);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: 'Your active sessions retrieved successfully',
        data: sessions,
    });
});

export const getAllSessions = catchAsync(async (req: Request, res: Response) => {
    const sessions = await SessionService.getAllSessions();

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: 'All system sessions retrieved successfully',
        data: sessions,
    });
});

export const deleteSession = catchAsync(async (req: AuthRequest, res: Response) => {
    const sessionId = req.params.sessionId as string;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId || !role) throw new Error("Unauthorized");

    await SessionService.deleteSession(sessionId, userId, role);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: 'Session terminated successfully',
        data: null,
    });
});
