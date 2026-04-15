import { Router } from 'express';
import { getUserStats } from './dashboard.controller';
import { auth, UserRole } from '../../middleware/auth';

const router = Router();

router.get('/stats', auth(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT), getUserStats);

export const DashboardRoutes = router;
