// src/utils/auth.ts

import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../Errors";
import { TokenPayload } from "../types/custom";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET as string;

// للـ SuperAdmin (أنت - البائع)
export const generateSuperAdminToken = (data: {
  id: string;
  name: string;
  email: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    email: data.email,
    name: data.name,
    role: "superadmin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};



// للـ Admin (موظف بصلاحيات)
export const generateAdminToken = (data: {
  id: string;
  name: string;
  email: string;
}): string => {
  const payload: TokenPayload = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// التحقق من التوكن
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    throw new UnauthorizedError("Invalid token");
  }
};
