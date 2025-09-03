import { success } from "zod";
import prisma from "../database/db.js";
import { coinsToUSD, usdToCrypto } from "../helpers/conversion.js"

// Add a wallet
export const addWallet = async (req, res) => {
  const userId = req.user.id;
  const walletAddress = req.body.walletAddress;
  try {
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        walletAddress,
      },
    });

    await prisma.finance.update({
      where: { userId },
      data: { walletId: wallet.walletId },
    });

    res.status(201).json({ wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create wallet" });
  }
};

// Delete wallet
export const deleteWallet = async (req, res) => {
    const userId = req.user.id;
    const checkWallet = await prisma.wallet.findUnique({
        where: {userId: userId}
    })
    if (!checkWallet) res.status(404).json({success: false, message: "Wallet not found"})
    const walletId  = checkWallet.walletId;

  try {
    // Remove wallet reference from Finance first
    await prisma.finance.update({
      where: { userId },
      data: { walletId: null },
    });

    // Delete the wallet
    await prisma.wallet.delete({
      where: { walletId },
    });

    res.status(200).json({ message: "Wallet deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete wallet" });
  }
};


// Update wallet
export const updateWallet = async (req, res) => {
  const userId = req.user.id;
  const checkWallet = await prisma.wallet.findUnique({
    where: {userId: userId}
  })
  if (!checkWallet) res.status(404).json({success: false, message: "Wallet not found"})
  const walletId  = checkWallet.walletId;
  const { walletAddress } = req.body;

  try {
    // 1️⃣ Update the wallet
    const wallet = await prisma.wallet.update({
      where: { walletId },
      data: { walletAddress },
    });

    // 2️⃣ Update Finance to point to this wallet
    await prisma.finance.update({
      where: { userId },
      data: { walletId: wallet.walletId },
    });

    res.status(200).json({ wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update wallet" });
  }
};


// Withdraw coins as crypto
export const withdrawCoins = async (req, res) => {
  const userId = req.user.id;
  const { walletId, cryptoType, coins } = req.body;

  if (!walletId || !cryptoType || !coins || coins <= 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({ where: { walletId } });
    if (!wallet || wallet.userId !== userId) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Get user's finance record
    const finance = await prisma.finance.findUnique({ where: { userId } });
    if (!finance || finance.coins < coins) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Convert coins to crypto amount
    const usdAmount = coinsToUSD(coins); 
    const cryptoAmount = await usdToCrypto(cryptoType, usdAmount); 

    // Update finance (subtract coins)
    await prisma.finance.update({
      where: { userId },
      data: { coins: { decrement: coins } },
    });

    // Add crypto to wallet (store in JSON field)
    const updatedCrypto = { ...wallet.crypto, [cryptoType]: (wallet.crypto?.[cryptoType] || 0) + cryptoAmount };

    await prisma.wallet.update({
      where: { walletId },
      data: { crypto: updatedCrypto },
    });

    res.status(200).json({
      success: true,
      message: `Successfully converted ${coins} coins to ${cryptoAmount} ${cryptoType}`,
      cryptoAmount,
      walletId,
      cryptoType,
    });
  } catch (err) {
    
    console.error(err);
    res.status(500).json({success: false, message: "Withdrawal failed" });
  }
};
