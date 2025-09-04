import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { convertPointsToCoins, convertCoinsToCrypto} from "../controllers/conversionController.js";

const router = express.Router();

router.get("/points-to-coins", verifyToken, convertPointsToCoins);
router.post("/coins-to-crypto", verifyToken, convertCoinsToCrypto);


export default router;
