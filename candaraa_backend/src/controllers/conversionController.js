import prisma from "../database/db.js";
import { FinanceAction } from "../../generated/prisma/index.js";
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
  let user = req.user
  const { coins} = req.body;
  if (!coins || coins <= 0) return res.status(400).json({ success: false, message: "Invalid coin amount" });

  try {
    let formerCoins = user.coins;
    if (formerCoins < coins) {res.status(400).json({success: false, message: "Insufficient balance"})}
    const usdValue = coinsToUSD(coins);
    const cryptoAmount = await usdToCrypto(usdValue, 'usdt');
    newAmountCoin = formerCoins - coins
    newAmountUsdt = user.usdt + cryptoAmount

    await prisma.user.update({where: {id: user.id}, data: {coins: newAmountCoin, usdt: newAmountUsdt}})
    await prisma.transaction.update({where: {id: user.id}, data: {amount: cryptoAmount, type: FinanceAction.EARN}})
    res.status(200).json({
      success: true,
      newAmountCoin,
      usdValue,
      usdt: newAmountUsdt,
      cryptoId: "usdt",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

