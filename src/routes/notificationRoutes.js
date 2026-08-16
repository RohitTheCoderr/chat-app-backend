import express from "express";
import {
  deleteNotificationById,
  getAllNotifications,
  getUnreadNotificationCountByType,
  getUnreadNotificationsByType,
  markedAllReadNotificationsByType,
  markedReadNotificationsById,
} from "../controllers/notification.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllNotifications);

router.get("/unread/:type", protect, getUnreadNotificationsByType);

router.get("/unread-count", protect, getUnreadNotificationCountByType);

router.patch("/read/:notificationId", protect, markedReadNotificationsById);

router.patch("/all-read/:type", protect, markedAllReadNotificationsByType);

router.delete("/delete/:notificationId", protect, deleteNotificationById);

export default router;
