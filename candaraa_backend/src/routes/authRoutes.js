import express from "express";
import validate from "../middleware/schemaValidator.js"
import verifyToken from "../middleware/authMiddleware.js";
import prisma from "../database/db.js";
import {isNewDay, isTwoOrMoreDaysApart} from "../helpers/authPassport.js"
import {sendOtp, verifyOtp} from "../helpers/phoneOTP.js"
import { createUserSchema, loginUserSchema } from "../schema/User.js"
import passport from "passport";
import registerUserWithPassword from "../controllers/authController.js";
import {generateToken, generateRefreshToken} from "../helpers/generateToken.js"
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit"

const router = express.Router();

const otpLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3,              
  message: { error: "Too many OTP requests. Please try again later." }
});

const Limiter = rateLimit({
  windowMs: 60 * 1000,  
  max: 5,               
  message: { error: "Too many OTP requests. Please try again later." }
});


router.post("/register",Limiter, validate(createUserSchema), registerUserWithPassword, passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  let user = req.user;
  const refreshToken = generateRefreshToken(req.user)
  res.json({ token, user, refreshToken });
});

router.post("/login",Limiter, validate(loginUserSchema),passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  let user = req.user;
  const refreshToken = generateRefreshToken(req.user)
  res.json({ token, user, refreshToken });
});

router.post("/otp/send",otpLimiter,  async (req, res) => {
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
  let code = await sendOtp(phoneNumber);
  res.json({ message: "OTP sent", code: code });
});

router.post("/otp/verify",otpLimiter,  async (req, res) => {
  const { phoneNumber, code } = req.body;

  let {user} = await verifyOtp(phoneNumber, code);
  if (!user) return res.status(400).json({ error: "Invalid OTP" });


  const userId = user.id;
  let lastSeen = new Date();
  let streak = user.streak;
  if (isNewDay(lastSeen, user.updatedAt)) { 
    streak++;
  }
  if (isTwoOrMoreDaysApart(lastSeen, user.updatedAt)){
    streak = 0
  }
    
  user = await prisma.user.update({ where: { id: userId }, data: {streak: streak},  select: {
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
    updatedAt: true }
  });

  
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user)
  res.json({ token, user, refreshToken});
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

      res.cookie('token', token, {
        httpOnly: true,    
        secure: true,     
        sameSite: 'lax',   
        maxAge: 30 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,     
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    res.redirect(`${process.env.FRONTEND}?google=true`);

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


    const token = generateToken(user);
    

    
    res.json({ token, refreshToken});
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/verifyEmail",Limiter,verifyToken, async (req, res) => {
  try {
    let userId = req.user.id;
    let token = req.query.token

    
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    if (!decoded) return res.status(401).json({ message: "Invalid token" });
    
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (userId === userId) {
      await prisma.user.update({where: {id: userId},
      data: {isVerified: true}})
    }else {
      res.status(400).json({
        success: false,
        message: "Something went wrong"
      })
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unexpected error"
    })
  }
})

router.get('/tokens', (req, res) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!token || !refreshToken) {
    return res.status(401).json({ message: 'Tokens not found' });
  }

  res.json({ token, refreshToken });
});

export default router;