import express from "express";
import { getGuestQuestions } from "../controllers/guestController.js";


const router = express.Router();


router.get("/questions", getGuestQuestions);

export default router;