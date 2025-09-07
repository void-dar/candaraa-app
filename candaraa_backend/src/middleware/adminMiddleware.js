const isAdmin = (req, res, next) => {
  let user = req.user; 

  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (user.role !== "ADMIN")
    return res.status(403).json({ message: "Admin access required" });
    user = req.user;
  next();
};


export default isAdmin;