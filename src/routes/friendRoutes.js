import express from "express"
import { getFriendRequests, sendFriendRequest } from "../controllers/friendController"
import protect from "../middleware/authMiddleware"

const router=express.Router()

router.post("/request/:userId", protect, sendFriendRequest)
router.get("/requests", protect, getFriendRequests)
router.patch("/request/accept/:userId", protect, acceptFriendRequest)
router.patch("/request/decline/:userId", protect, declineFriendRequest)
router.delete("/request/cancel/:userId", protect, cancelFriendRequest)

export default router