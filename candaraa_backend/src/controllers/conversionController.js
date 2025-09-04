import { success } from "zod";
import prisma from "../database/db.js";
import { pointsToCoins, coinsToUSD, usdToCrypto } from "../helpers/conversion.js";

export const convertPointsToCoins = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const coins = pointsToCoins(user.points);
    const usdValue = coinsToUSD(coins);

    res.status(200).json({
      points: user.points,
      coins,
      usdValue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /conversion/coins-to-crypto
export const convertCoinsToCrypto = async (req, res) => {
  const { coins, cryptoId } = req.body;
  if (!coins || coins <= 0) return res.status(400).json({ success: false, message: "Invalid coin amount" });

  try {
    const usdValue = coinsToUSD(coins);
    const cryptoAmount = await usdToCrypto(usdValue, cryptoId || "solana");

    res.status(200).json({
      success: true,
      coins,
      usdValue,
      crypto: cryptoAmount,
      cryptoId: cryptoId || "solana",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

