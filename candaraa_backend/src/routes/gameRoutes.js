import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { gameControl, getPointsToNextLevel } from "../controllers/gameController.js";

const router = express.Router();


router.post("/action", verifyToken, gameControl);
router.post("/level", verifyToken, getPointsToNextLevel)


export default router;