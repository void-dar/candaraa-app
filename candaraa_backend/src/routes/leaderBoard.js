import express from "express"
import verifyToken from "../middleware/authMiddleware.js"
import { getLeaderBoard } from "../controllers/leaderboardController.js";


const router = express.Router();


router.get("/all", getLeaderBoard)
router.get("/region", verifyToken, getLeaderBoard)


export default router;