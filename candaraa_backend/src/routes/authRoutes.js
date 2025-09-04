import express from "express";
import validate from "../middleware/schemaValidator.js"
import prisma from "../database/db.js";
import {} from "../helpers/authPassport.js"
import {sendOtp, verifyOtp} from "../helpers/phoneOTP.js"
import { createUserSchema, loginUserSchema } from "../schema/User.js"
import passport from "passport";
import registerUserWithPassword from "../controllers/authController.js";
import {generateToken} from "../helpers/generateToken.js"
import authMiddleware from "../middleware/authMiddleware.js"
import { success } from "zod";

const router = express.Router();


router.post("/register", validate(createUserSchema), registerUserWithPassword, passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  let user = req.user;
  res.json({ token, user });
});

router.post("/login", validate(loginUserSchema),passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  
  res.json({ token, user });
});

router.post("/otp/send",  async (req, res) => {
  const { phoneNumber } = req.body;
  const user = await prisma.user.findUnique({
    where: {phoneNumber: phoneNumber}
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
  res.json({ token, user });
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
    res.json({ token });
  }
);


export default router;