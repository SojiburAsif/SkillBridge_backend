import { Request, Response } from 'express';
import { getUserStatsFromDB } from './dashboard.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

type AuthRequest = Request & { user?: { id: string; role: string; [k: string]: any } };

export const getUserStats = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user || (!user.id && !user.role)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized", success: false });
    }

    const stats = await getUserStatsFromDB(user.id as string, user.role as string);
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: 'Stats retrieved successfully for user',
        data: stats,
    });
});
