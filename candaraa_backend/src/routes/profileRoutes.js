import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/adminMiddleware.js";



const router = express.Router();

// any logged-in user
router.get("/user", verifyToken, (req, res) => {
  try {
     res.json({ user: req.user });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "user not found"
    })
  }
 
});

// admin-only route
router.delete("/user/:id", verifyToken, isAdmin, (req, res) => {
  res.json({ message: `User ${req.params.id} deleted` });
});

export default router;