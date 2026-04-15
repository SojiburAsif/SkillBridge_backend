import { Router } from 'express';
import { getMySessions, getAllSessions, deleteSession } from './session.controller';
import { auth, UserRole } from '../../middleware/auth';

const router = Router();

// Any user or tutor can check their own sessions
router.get('/my-sessions', auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), getMySessions);

// Only Admin can see all system-wide sessions
router.get('/all-sessions', auth(UserRole.ADMIN), getAllSessions);

// User or admin can terminate a specific session
router.delete('/:sessionId', auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), deleteSession);

export const SessionRoutes = router;
