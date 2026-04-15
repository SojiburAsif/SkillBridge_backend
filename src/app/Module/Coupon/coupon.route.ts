import { Router } from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { CouponController } from './coupon.controller';

const router = Router();

router.post('/', auth(UserRole.ADMIN), CouponController.createCoupon);
router.get('/', auth(UserRole.ADMIN), CouponController.getAllCoupons);
router.delete('/:id', auth(UserRole.ADMIN), CouponController.deleteCoupon);
router.post('/apply', auth(UserRole.STUDENT), CouponController.applyCoupon);

export const CouponRoutes = router;
