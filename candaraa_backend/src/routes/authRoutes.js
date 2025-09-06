import express from "express";
import validate from "../middleware/schemaValidator.js"
import prisma from "../database/db.js";
import {} from "../helpers/authPassport.js"
import {sendOtp, verifyOtp} from "../helpers/phoneOTP.js"
import { createUserSchema, loginUserSchema } from "../schema/User.js"
import passport from "passport";
import registerUserWithPassword from "../controllers/authController.js";
import {generateToken, generateRefreshToken} from "../helpers/generateToken.js"


const router = express.Router();


router.post("/register", validate(createUserSchema), registerUserWithPassword, passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  let user = req.user;
  const refreshToken = generateRefreshToken(req.user)
  res.json({ token, user, refreshToken });
});

router.post("/login", validate(loginUserSchema),passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  let user = req.user;
  const refreshToken = generateRefreshToken(req.user)
  res.json({ token, user, refreshToken });
});

router.post("/otp/send",  async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await prisma.user.findUnique({
    where: {phoneNumber: phoneNumber}, select: {
       
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
            updatedAt: true
    }
  })
  if (!user) {res.status(404).json({success: false, error: "User not found"})}
  await sendOtp(phoneNumber, req.user);
  res.json({ message: "OTP sent" });
});

router.post("/otp/verify",  async (req, res) => {
  const { phoneNumber, code } = req.body;

  const {user} = await verifyOtp(phoneNumber, code, req.user);
  if (!user) return res.status(400).json({ error: "Invalid OTP" });

  
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(req.user)
  res.json({ token, user, refreshToken });
});



router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
  "/google/secrets",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    const refreshToken = generateRefreshToken(req.user)
    res.json({ token, refreshToken });
  }
);



// Refresh endpoint
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: "No token" });

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Get user
    const user = await prisma.user.findUnique({ where: { id: decoded.id, select: 
       {
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
      }});
    if (!user) return res.status(404).json({ message: "User not found" });

    // Issue new tokens
    const token = generateToken(user);
    

    
    res.json({ token, refreshToken});
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

export default router;