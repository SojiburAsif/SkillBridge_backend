import express from 'express';
import { auth, UserRole } from '../../middleware/auth';
import { UserController } from './user.controller';


const router = express.Router();

router.get("/admin/users", auth(UserRole.ADMIN), UserController.getUser)

export const userRouter = router;