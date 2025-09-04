import express from "express"
const router = express.Router();
import {getUsers, deleteUser, getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion, getTokenTransactions, getCoinStats} from "../controllers/adminContollers"
import {verifyToken} from "../middleware/authMiddleware"
import isAdmin from "../middleware/adminMiddleware"


router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

// Question management routes
router.get('/questions', verifyToken, isAdmin, getQuestions);
router.get('/questions/:id', verifyToken, isAdmin, getQuestionById);
router.post('/questions', verifyToken, isAdmin, createQuestion);
router.put('/questions/:id', verifyToken, isAdmin, updateQuestion);
router.delete('/questions/:id', verifyToken, isAdmin, deleteQuestion);




// Economy routes
router.get('/economy/transactions', verifyToken, isAdmin, getTokenTransactions);
router.get('/economy/coin-stats', verifyToken, isAdmin, getCoinStats);

module.exports = router;