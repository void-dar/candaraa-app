import prisma  from "../database/db.js";
import { Difficulty, Region } from "../../generated/prisma/index.js";
import { actionRewards } from "../helpers/rewards.js";
import { calculateLevel } from "../helpers/level.js";
import { pointsToCoins} from "../helpers/conversion.js";
import { Decimal } from "@prisma/client/runtime/library"



const getDifficultyForLevel = (level) => {
  if (level >= 60) return Difficulty.HARD;
  if (level >= 30) return Difficulty.MEDIUM;
  return Difficulty.EASY;
};


export const getRandomQuestion = async (req, res) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get difficulty based on user level
    const difficulty = getDifficultyForLevel(user.level);

    // Fetch all questions matching the difficulty
    const questions = await prisma.question.findMany({
      where: { difficulty: { has: difficulty } },
    });

    if (questions.length === 0)
      return res.status(404).json({ success: false, message: "No questions available for your level" });

    // Shuffle the questions and take up to 10
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 10) 

    res.status(200).json({ questions: selectedQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const answerQuestion = async (req, res) => {
  const userId = req.user.id;
  const { questionId, answer } = req.body;

  try {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const userBefore = await prisma.user.findUnique({ where: { id: userId } });

   
   

    if (answer.toString() === question.answer) {
      let points = 0;
      let coins = 0;

      // Assign rewards based on difficulty
      const reward = actionRewards[question.difficulty] || { points: 5 };
     
      points = reward.points;
      coins = pointsToCoins(points);
      coins = new Decimal(coins)

      const newPoints = userBefore.points + points;
      const newLevel = calculateLevel(newPoints);
      



      let updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: points },
          coins: { increment: coins },
          level: newLevel,
        },
        select: { id: true, coins: true, points: true, level: true },
      });
          
     

      res.status(200).json({
        answer: answer === question.answer,
        points: points,
        user: updatedUser,
        reward: reward
        
      });

    }else {
      res.status(200).json({
        success: false,
        user: userBefore,
        answer: false
      })
    }

    
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const addQuestion = async (req, res) => {
  const { prompt, category, region , answer, difficulty } = req.body;
  region = Region[region.toUpperCase()]
  difficulty = Difficulty[difficulty.toUpperCase()]
  if (!prompt  || !region  || !answer || !difficulty) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const question = await prisma.question.create({
      data: { prompt, category, region, options, answer, difficulty },
    });

    res.status(201).json({ success: true, message: "Question added", question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { prompt, category, region , options, answer, difficulty } = req.body;

  try {
      const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: { prompt, category, region , options, answer, difficulty },
    });

    res.status(200).json({ message: "Question updated", question: updatedQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    await prisma.question.delete({ where: { id: questionId } });
    res.status(200).json({ success: true, message: "Question deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};