import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { addWallet, deleteWallet, updateWallet, withdrawCoins } from "../controllers/walletController.js";

const router = express.Router();

router.post("/add", verifyToken, addWallet);
router.delete("/delete", verifyToken, deleteWallet);
router.put("/update", verifyToken, updateWallet);
router.post("/withdraw", verifyToken, withdrawCoins);

export default router;
