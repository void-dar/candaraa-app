import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import { addWallet, deleteWallet, updateWallet, withdrawUsdt, getTransactions, getWallet } from "../controllers/walletController.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const Limiter = rateLimit({
  windowMs: 60 * 1000,  
  max: 5,               
  message: { error: "Too many OTP requests. Please try again later." }
});


router.post("/add",Limiter, verifyToken, addWallet);
router.delete("/delete",Limiter, verifyToken, deleteWallet);
router.post("/update",Limiter, verifyToken, updateWallet);
router.post("/withdraw",Limiter, verifyToken, withdrawUsdt);
router.get("/transaction",Limiter,verifyToken, getTransactions);
router.get("/getWallet",Limiter,  verifyToken, getWallet)

export default router;
