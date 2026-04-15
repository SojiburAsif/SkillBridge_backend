import { Router } from "express";
import { notificationController } from "./notification.controller";
import { auth, UserRole } from "../../middleware/auth";

const router = Router();

// Apply auth to all notification routes to ensure req.user exists
const restrictAuth = auth(UserRole.ADMIN, UserRole.TUTOR, UserRole.STUDENT);

router.get("/my-notifications", restrictAuth, notificationController.getMyNotifications);
router.patch("/my-notifications/read-all", restrictAuth, notificationController.markAllAsRead);
router.patch("/my-notifications/:id/read", restrictAuth, notificationController.markAsRead);
router.delete("/my-notifications/:id", restrictAuth, notificationController.deleteNotification);

export const NotificationRoutes = router;