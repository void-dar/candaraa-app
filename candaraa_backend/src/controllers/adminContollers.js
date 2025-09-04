// controllers/adminController.js
import prisma from "../database/db"

// User Management Controllers

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const skip = (page - 1) * limit;
    
    let whereClause = {};
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Add type filter
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // Add status filter
    if (status) {
      whereClause.active = status === 'active';
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        coins: true,
        active: true,
        walletAddress: true,
        createdAt: true,
        region: true,
        _count: {
          select: {
            games: true,
            transactions: true,
          }
        }
      }
    });
    
    const totalUsers = await prisma.user.count({ where: whereClause });
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalUsers / limit),
        count: users.length,
        totalRecords: totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username: username },
      include: {
        games: {
          orderBy: { playedAt: 'desc' },
          take: 10,
          include: {
            questions: true
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({user});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Delete user
const deleteUser = async (req, res) => {
  try {
    const { username } = req.params;
    
    await prisma.user.delete({
      where: { username: username }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Question Management Controllers

// Get all questions with filtering and pagination
const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, difficulty, status } = req.query;
    const skip = (page - 1) * limit;
    
    let whereClause = {};
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { question: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    
    // Add category filter
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    // Add difficulty filter
    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = difficulty;
    }
    
    // Add status filter
    if (status) {
      whereClause.active = status === 'active';
    }
    
    const questions = await prisma.question.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });
    
    const totalQuestions = await prisma.question.count({ where: whereClause });
    
    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalQuestions / limit),
        count: questions.length,
        totalRecords: totalQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new question
const createQuestion = async (req, res) => {
  try {
    const { question, type, category, difficulty, correctAnswer, options, explanation, active } = req.body;
    
    const newQuestion = await prisma.question.create({
      data: {
        question,
        type,
        category,
        difficulty,
        correctAnswer,
        options: options || [],
        explanation,
        active: active !== undefined ? active : true
      }
    });
    
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, type, category, difficulty, correctAnswer, options, explanation, active } = req.body;
    
    const updatedQuestion = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        question,
        type,
        category,
        difficulty,
        correctAnswer,
        options,
        explanation,
        active
      }
    });
    
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.question.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// // Import questions from CSV
// const importQuestions = async (req, res) => {
//   try {
//     // This would typically handle a file upload
//     // For simplicity, we'll assume the CSV data is in the request body
//     const { questions } = req.body;
    
//     if (!questions || !Array.isArray(questions)) {
//       return res.status(400).json({ error: 'Invalid questions data' });
//     }
    
//     const createdQuestions = await prisma.question.createMany({
//       data: questions,
//       skipDuplicates: true
//     });
    
//     res.status(201).json({ 
//       message: `${createdQuestions.count} questions imported successfully` 
//     });
//   } catch (error) {
//     console.error('Error importing questions:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// Get token transactions
const getTokenTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;
    
    let whereClause = {};
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    const totalTransactions = await prisma.transaction.count({ where: whereClause });
    
    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalTransactions / limit),
        count: transactions.length,
        totalRecords: totalTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get coin statistics
const getCoinStats = async (req, res) => {
  try {
    // Total coins in circulation
    const totalCoinsResult = await prisma.user.aggregate({
      _sum: {
        coins: true
      }
    });
    
    const totalCoins = totalCoinsResult._sum.coins || 0;
    
    // Coins earned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCoinsResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'EARN',
        createdAt: {
          gte: today
        }
      }
    });
    
    const todayCoins = todayCoinsResult._sum.amount || 0;
    
    // Coins converted to tokens
    const convertedCoinsResult = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'CONVERT'
      }
    });
    
    const convertedCoins = Math.abs(convertedCoinsResult._sum.amount) || 0;
    
    res.json({
      totalCoins,
      todayCoins,
      convertedCoins
    });
  } catch (error) {
    console.error('Error fetching coin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export {
  // User management
  getUsers,
  getUserByUsername,
  deleteUser,
  
  // Question management
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,

  // Economy
  getTokenTransactions,
  getCoinStats
};