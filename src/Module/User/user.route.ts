import express from "express";
import { auth, UserRole } from "../../middleware/auth";
import { UserController } from "./user.controller";


const router = express.Router();

// Admin: get all users
router.get("/admin/users", auth(UserRole.ADMIN), UserController.getUser);

router.get("/student/profile", auth(UserRole.STUDENT), UserController.getStudentProfile);

// Admin: get single user
router.get("/admin/users/:id", auth(UserRole.ADMIN), UserController.getSingleUserController);

// Admin: update user status
router.patch("/admin/users/:id", auth(UserRole.ADMIN), UserController.updateUserStatusController);

router.post("/student/profile", auth(UserRole.STUDENT), UserController.StudentProfileCreate);


export const userRouter = router;
