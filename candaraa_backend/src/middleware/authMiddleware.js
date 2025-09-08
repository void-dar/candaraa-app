import jwt from "jsonwebtoken";
import prisma from "../database/db.js"; 

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    if (authHeader) {

      let token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (!decoded) return res.status(401).json({ message: "Invalid token" });

      // check if user exists in DB
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user; // attach user to request

      next();
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;

      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (!decoded) return res.status(401).json({ message: "Invalid token" });

      // check if user exists in DB
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user; // attach user to request

      next();
      }


  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" + err });
  }
};

export default verifyToken;

