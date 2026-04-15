import { Router } from 'express';

import { auth, UserRole } from '../../middleware/auth';
import { AnalyticsController } from './analytics.controller';

const router = Router();

router.get('/admin', auth(UserRole.ADMIN), AnalyticsController.getAdminAnalytics);
router.get('/tutor', auth(UserRole.TUTOR), AnalyticsController.getTutorAnalytics);

export const AnalyticsRoutes = router;
