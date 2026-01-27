import express from "express";
import { auth, UserRole } from "../../middleware/auth";
import { UserController } from "./user.controller";


const router = express.Router();

// Admin: get all users
router.get("/admin/users", auth(UserRole.ADMIN), UserController.getUser);

// Admin: get single user
router.get("/admin/users/:id", auth(UserRole.ADMIN), UserController.getSingleUserController);

// Admin: update user status
router.patch("/admin/users/:id", auth(UserRole.ADMIN), UserController.updateUserStatusController);

export const userRouter = router;
