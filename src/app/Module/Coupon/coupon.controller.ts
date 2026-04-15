import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { CouponService } from './coupon.service';


const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Coupon created successfully',
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCoupons();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Coupons retrieved successfully',
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.deleteCoupon(req.params.id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Coupon deleted successfully',
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.applyCoupon(req.body.code, req.body.originalPrice);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Coupon applied successfully',
    data: result,
  });
});

export const CouponController = {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon,
};
