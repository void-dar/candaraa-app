import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { addWallet, deleteWallet, updateWallet, withdrawUsdt, getTransactions, getWallet } from "../controllers/walletController.js";

const router = express.Router();

router.post("/add", verifyToken, addWallet);
router.delete("/delete", verifyToken, deleteWallet);
router.post("/update", verifyToken, updateWallet);
router.post("/withdraw", verifyToken, withdrawUsdt);
router.get("/transaction",verifyToken, getTransactions);
router.get("/getWallet", verifyToken, getWallet)

export default router;
