import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username should not be more than 30 characters"),
  email: z.email("Invalid email"),
  region: z.enum(["AFRICA", "EUROPE"], "Supports only users in Europe or Africa for now"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  password: z.string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be at most 100 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }
);

const loginUserSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string()
})

export { createUserSchema, loginUserSchema };