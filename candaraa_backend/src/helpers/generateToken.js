import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
}
