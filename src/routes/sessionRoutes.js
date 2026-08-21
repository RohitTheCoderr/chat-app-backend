import express from "express"
import protect from "../middleware/authMiddleware.js";
import { getMySessions, revokeSession } from "../controllers/sessionController.js";
// import { getMySessions } from "../controllers/sessionController";


const router = express.Router();

router.get("/", protect, getMySessions);
router.delete("/:sessionId", protect, revokeSession);

export default router;