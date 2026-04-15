import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendResponse';
import { WishlistService } from './wishlist.service';


const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.toggleWishlist(req.user!.id, req.body.tutorProfileId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.getMyWishlist(req.user!.id);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result,
  });
});

export const WishlistController = {
  toggleWishlist,
  getMyWishlist,
};
