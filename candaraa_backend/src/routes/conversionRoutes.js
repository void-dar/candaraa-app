import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { convertPointsToCoins, convertCoinsToCrypto} from "../controllers/conversionController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();


const Limiter = rateLimit({
  windowMs: 60 * 1000,  
  max: 5,               
  message: { error: "Too many OTP requests. Please try again later." }
});


router.get("/points-to-coins",Limiter, verifyToken, convertPointsToCoins);
router.post("/coins-to-crypto",Limiter, verifyToken, convertCoinsToCrypto);


export default router;
