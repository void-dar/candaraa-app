import express from "express"
import verifyToken from "../middleware/authMiddleware.js"
import { getLeaderBoard } from "../controllers/leaderboardController.js";


const router = express.Router();


router.get("/all", verifyToken, getLeaderBoard)


export default router;