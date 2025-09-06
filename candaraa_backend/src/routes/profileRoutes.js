import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/adminMiddleware.js";
import prisma from "../database/db.js";



const router = express.Router();

// any logged-in user
router.get("/user", verifyToken, async (req, res) => {
    try {
        let checkUser = await prisma.user.findUnique({
          where: {id: req.user.id},
          select: {
            id: true,
            username: true,
            email: true,
            phoneNumber: true,
            isPremium: true,
            isVerified: true,
            region: true,
            role: true,
            level: true,
            points: true,
            coins: true,
            usdt: true,
            streak: true,
            createdAt: true,
            updatedAt: true}
        })
        if (!checkUser) {
          res.status(400).json({
            success: false,
            message: "user not found"
          })
        }
        res.status(201).json({
          success: true,
          user: checkUser
        })
    }catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error"
      })
    }
 
});

// admin-only route
router.delete("/user/:id", verifyToken, isAdmin, (req, res) => {
  res.json({ message: `User ${req.params.id} deleted` });
});

export default router;