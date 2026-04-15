import express from "express";
import { auth, UserRole } from "../../middleware/auth";
import { UserController } from "./user.controller";
import { ProfileUpdateValidationSchema } from "./user.validation";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

// Admin: get all users
router.get("/admin/users", auth(UserRole.ADMIN), UserController.getUser);

// Admin: get single user
router.get("/admin/users/:id", auth(UserRole.ADMIN), UserController.getSingleUserController);

// Admin: update user status
router.patch("/admin/users/:id", auth(UserRole.ADMIN), UserController.updateUserStatusController);
router.patch("/admin/users/:id/tutor-status", auth(UserRole.ADMIN), UserController.updateTutorProfileStatusController);
router.delete("/admin/users/:id", auth(UserRole.ADMIN), UserController.deleteUserByAdminController);

// Dashboard stats for Admin
router.get("/admin/dashboard/analytics", auth(UserRole.ADMIN), UserController.getDashboardAnalytics);

// Unified Profile Update for both Student and Tutor
router.patch(
    "/my-profile",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    validateRequest(ProfileUpdateValidationSchema),
    UserController.updateMyProfile
);

// Unified Get My Profile for both Student and Tutor
router.get(
    "/my-profile",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    UserController.getMyProfileController
);

// Authenticated basic profile (for inbox / chat header)
router.get(
    "/users/basic/:id",
    auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
    UserController.getBasicUserController
);

export const userRouter = router;
