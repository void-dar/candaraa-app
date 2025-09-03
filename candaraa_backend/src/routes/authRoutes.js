import express from "express";
import validate from "../middleware/schemaValidator.js"
import {} from "../helpers/authPassport.js"
import {sendOtp, verifyOtp} from "../helpers/phoneOTP.js"
import { createUserSchema, loginUserSchema } from "../schema/User.js"
import passport from "passport";
import registerUserWithPassword from "../controllers/authController.js";
import {generateToken} from "../helpers/generateToken.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router();


router.post("/register", validate(createUserSchema), registerUserWithPassword, passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  res.json({ token });
});

router.post("/login", validate(loginUserSchema),passport.authenticate("local", { session: false }), (req, res) => {
  const token = generateToken(req.user);
  res.json({ token });
});

router.post("/otp/send", authMiddleware, async (req, res) => {
  const { phoneNumber } = req.body;
  await sendOtp(phoneNumber, req.user);
  res.json({ message: "OTP sent" });
});

router.post("/otp/verify", authMiddleware, async (req, res) => {
  const { phoneNumber, code } = req.body;
  const userId = await verifyOtp(phoneNumber, code, req.user);
  if (!userId) return res.status(400).json({ error: "Invalid OTP" });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const token = generateToken(user);
  res.json({ token });
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