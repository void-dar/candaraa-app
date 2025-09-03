import prisma  from "../database/db.js";
import { actionRewards } from "../helpers/rewards.js";
import { calculateLevel } from "../helpers/level.js";
import { checkBadges } from "../helpers/badges.js";


const getDifficultyForLevel = (level) => {
  if (level >= 60) return "HARD";
  if (level >= 30) return "MEDIUM";
  return "EASY";
};

export const getRandomQuestion = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const difficulty = getDifficultyForLevel(user.level);

    const questions = await prisma.question.findMany({ where: { difficulty } });
    if (questions.length === 0) return res.status(404).json({ success: false, message: "No questions available for your level" });

    const randomIndex = Math.floor(Math.random() * questions.length);
    const { answer, ...questionData } = questions[randomIndex]; 

    res.status(200).json({ question: questionData });
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

   
    let points = 0;

    if (answer === question.answer) {
      // Assign rewards based on difficulty
      const reward = actionRewards[question.difficulty] || { xp: 10, points: 5 };
     
      points = reward.points;
    }

    
    const newPoints = userBefore.points + points;
    const newLevel = calculateLevel(newPoints);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        level: newLevel,
      },
      select: { id: true, xp: true, points: true, level: true, badges: true },
    });

    
    const earnedBadges = checkBadges(updatedUser);
    if (earnedBadges.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { badges: { push: earnedBadges } },
      });
      updatedUser.badges.push(...earnedBadges);
    }

    res.status(200).json({
      correct: answer === question.correct,
      reward: { xp, points },
      profile: updatedUser,
      earnedBadges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const addQuestion = async (req, res) => {
  const { prompt, category, region , options, answer, difficulty } = req.body;

  if (!prompt || !category || !region || !options || !answer || !difficulty) {
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