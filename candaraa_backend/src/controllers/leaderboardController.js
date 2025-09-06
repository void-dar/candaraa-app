import prisma from "../database/db.js";




// any logged-in user
export const getLeaderBoard = async (req, res) => {
    try {
    const { page = 1, limit = 10,} = req.query;
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { points: 'desc' },
      select: {
        id: true,
        username: true,
        points: true,
        region: true,
        streak: true,
        level: true
      }
    });
    
    let totalUsers = users.length

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalUsers / limit),
      }
    });


    }catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error " + error
      })
    }
}
   
 

