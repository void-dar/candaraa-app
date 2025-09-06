import prisma from "../database/db.js";

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
    const walletAddress  = checkWallet.walletAddress;

  try {

    // Delete the wallet
    await prisma.wallet.delete({
      where: { walletAddress },
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
  const walletAddress  = checkWallet.walletAddress;
  const { newWalletAddress } = req.body;

  try {

    const wallet = await prisma.wallet.update({
      where: { walletAddress },
      data: { newWalletAddress },
    });

    res.status(200).json({ wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update wallet" });
  }
};


// Withdraw coins as crypto
export const withdrawUsdt = async (req, res) => {
  const userId = req.user.id;
  const { walletAddress, cryptoType, usdt } = req.body;

  if (!walletAddress || !cryptoType || !usdt || usdt <= 0) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({ where: { walletAddress } });
    if (!wallet || wallet.userId !== userId) {
      return res.status(404).json({ message: "Wallet not found" });
    }

  
    // Convert coins to crypto amount
   
    const cryptoAmount = await prisma.user.update({where: {id: userId}, data: {usdt: (req.user.usdt - usdt)}, select: {usdt: true}})



    res.status(200).json({
      success: true,
      message: `Successfully converted ${coins} coins to ${cryptoAmount} ${cryptoType}`,
      cryptoAmount,
      walletAddress,
      cryptoType: "usdt",
    });
  } catch (err) {
    
    console.error(err);
    res.status(500).json({success: false, message: "Withdrawal failed" });
  }
};
