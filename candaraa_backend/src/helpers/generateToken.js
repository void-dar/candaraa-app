import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.ACCESS_SECRET, {
    expiresIn: "30m",
  });
}

export function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
}
