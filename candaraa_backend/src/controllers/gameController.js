import prisma from "../database/db.js";
import { calculateLevel, pointsForNextLevel} from "../helpers/level.js";
import {actionRewards} from "../helpers/rewards.js"


const gameControl =  async (req, res) => {
  const userId = req.user.id;
  const { actionType } = req.body;

  if (!actionRewards[actionType]) {
    return res.status(400).json({ message: "Invalid action type" });
  }

  const { points } = actionRewards[actionType];

  try {
    
    const userBefore = await prisma.user.findUnique({ where: { id: userId } });

    const newPoints = userBefore.points + points;
    const newLevel = calculateLevel(newPoints);
    let nextLevel = pointsForNextLevel(newLevel);

    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        level: newLevel,
      },
      select: { id: true, level: true, points: true, badges: true },
    });

    
    
    res.status(200).json({
      success: true,
      message: `Action '${actionType}' completed!`,
      profile: updatedUser,
      pointsForNextLevel: nextLevel
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

const getPointsToNextLevel = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) res.json({success: false, message: "User not found"})
    let level = user.level;
    let nextLevel = pointsForNextLevel(level);
    res.status(200).json({
      success: true,
      level,
      pointsForNextLevel: nextLevel
    });
  } catch (error) {
     console.error(err);
     res.status(500).json({ message: "Server error" });
  }
}

export {gameControl, getPointsToNextLevel}

