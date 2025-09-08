import express from "express";
import { getGuestQuestions, answerQuestion } from "../controllers/guestController.js";


const router = express.Router();


router.get("/questions", getGuestQuestions);
router.post("/answer", answerQuestion)

export default router;