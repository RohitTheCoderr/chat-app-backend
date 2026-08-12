import express from "express";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  sendFriendRequest,
  cancelFriendRequest,
  getNonFriendList,
  getFriendList,
  getSendedFriendRequests,
} from "../controllers/friendController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request/:userId", protect, sendFriendRequest);
router.get("/requests", protect, getFriendRequests);
router.get("/sended/requests", protect, getSendedFriendRequests);
router.patch("/request/accept/:userId", protect, acceptFriendRequest);
router.patch("/request/decline/:userId", protect, declineFriendRequest);
router.delete("/request/cancel/:userId", protect, cancelFriendRequest);
router.get("/request/non-friends", protect, getNonFriendList);
router.get("/request/friends", protect, getFriendList);

export default router;
