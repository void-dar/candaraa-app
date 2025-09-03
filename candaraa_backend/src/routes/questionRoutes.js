import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import isAdmin from "../middleware/adminMiddleware.js";
import { getRandomQuestion, answerQuestion, addQuestion, updateQuestion, deleteQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.get("/random", verifyToken, getRandomQuestion);
router.post("/answer", verifyToken, answerQuestion);
router.post("/add", verifyToken, isAdmin, addQuestion);
router.put("/update/:id", verifyToken, isAdmin, updateQuestion);
router.delete("/delete/:id", verifyToken, isAdmin, deleteQuestion)


export default router;
