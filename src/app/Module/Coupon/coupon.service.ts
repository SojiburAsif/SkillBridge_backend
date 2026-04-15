import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

const createCoupon = async (payload: { code: string; discountPercentage: number; maxUsage: number; expireDate: Date }) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: payload.code.toUpperCase() },
  });

  if (existingCoupon) {
    throw new AppError(400, 'Coupon code already exists');
  }

  const coupon = await prisma.coupon.create({
    data: {
      ...payload,
      code: payload.code.toUpperCase(),
    },
  });

  return coupon;
};

const getAllCoupons = async () => {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

const deleteCoupon = async (id: string) => {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) {
    throw new AppError(404, 'Coupon not found');
  }
  return await prisma.coupon.delete({ where: { id } });
};

const applyCoupon = async (code: string, originalPrice: number) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    throw new AppError(404, 'Invalid coupon code');
  }

  if (coupon.expireDate < new Date()) {
    throw new AppError(400, 'Coupon has expired');
  }

  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    throw new AppError(400, 'Coupon usage limit reached');
  }

  const discountAmount = Math.round(originalPrice * (coupon.discountPercentage / 100));
  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  return {
    couponId: coupon.id,
    originalPrice,
    discountAmount,
    finalPrice,
  };
};

export const CouponService = {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon,
};
