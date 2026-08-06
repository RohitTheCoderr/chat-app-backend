import express from "express";
import {
  deleteNotificationById,
  getUnreadNotificationCountByType,
  getUnreadNotificationsByType,
  markedAllReadNotificationsByType,
  markedReadNotificationsById,
} from "../controllers/notification.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/notifications/:type/unread",
  protect,
  getUnreadNotificationsByType,
);

router.get(
  "/notifications/:type/unread-count",
  protect,
  getUnreadNotificationCountByType,
);

router.patch(
  "/notification/:notificationId/read",
  protect,
  markedReadNotificationsById,
);

router.patch(
  "/notifications/:type/all-read",
  protect,
  markedAllReadNotificationsByType,
);

router.delete(
  "/notification/:notificationId/delete",
  protect,
  deleteNotificationById,
);

export default router;
