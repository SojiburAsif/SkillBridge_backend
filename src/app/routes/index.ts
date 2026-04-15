import { Router } from 'express';
import { tutorRouter } from '../Module/Tutors/tutor.route';
import { StudentBookingRouter } from '../Module/Booking/booking.route';
import { userRouter } from '../Module/User/user.route';
import { reviewRouter } from '../Module/Review/Review.route';
import { TutorSlot } from '../Module/TutorSlot/tutorSlot.route';
import { DashboardRoutes } from '../Module/Dashboard/dashboard.route';
import { SessionRoutes } from '../Module/Session/session.route';
import { AuthRoutes } from '../Module/auth/auth.route';
import { categoryRouter } from '../Module/Category/category.route';
import { NotificationRoutes } from '../Module/Notification/notification.route';
import { WishlistRoutes } from '../Module/Wishlist/wishlist.route';
import { MessageRoutes } from '../Module/Message/message.route';
import { CouponRoutes } from '../Module/Coupon/coupon.route';
import { AnalyticsRoutes } from '../Module/Analytics/analytics.route';
// Import auth/session/admin routes when created

const router = Router();

const moduleRoutes = [
  { path: '/', route: tutorRouter },
  { path: '/', route: StudentBookingRouter },
  { path: '/', route: userRouter },
  { path: '/', route: reviewRouter },
  { path: '/', route: TutorSlot },
  { path: '/categories', route: categoryRouter },
  { path: '/dashboard', route: DashboardRoutes },
  { path: '/sessions', route: SessionRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/', route: NotificationRoutes },
  { path: '/wishlists', route: WishlistRoutes },
  { path: '/messages', route: MessageRoutes },
  { path: '/coupons', route: CouponRoutes },
  { path: '/analytics', route: AnalyticsRoutes },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
