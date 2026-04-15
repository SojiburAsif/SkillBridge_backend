import { Router } from 'express';
import { Register, loginUser, changePassword, logoutUser } from './auth.controller';
import { auth } from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ChangePasswordValidationSchema, LoginValidationSchema, RegisterValidationSchema } from './auth.validation';

const router = Router();

// Endpoint: /api/auth-custom/custom-register
router.post('/register', validateRequest(RegisterValidationSchema), Register);

// Endpoint: /api/auth-custom/sign-in/email
router.post('/sign-in/email', validateRequest(LoginValidationSchema), loginUser);

// Endpoint: /api/auth-custom/change-password
router.post('/change-password', auth(), validateRequest(ChangePasswordValidationSchema), changePassword);

// Endpoint: /api/auth-custom/logout
router.post('/logout', logoutUser);

export const AuthRoutes = router;
