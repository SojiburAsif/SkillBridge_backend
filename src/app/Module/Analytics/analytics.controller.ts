import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { AnalyticsService } from './analytics.service';


const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getAdminAnalytics();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Admin analytics retrieved successfully',
    data: result,
  });
});

const getTutorAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsService.getTutorAnalytics(req.user!.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Tutor analytics retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getAdminAnalytics,
  getTutorAnalytics,
};
