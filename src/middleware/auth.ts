import { type Context } from "hono";
import jwtAuth from "jsonwebtoken";
import { AppError } from "@/utilities/App.Error.js";
import { logger } from "@/utilities/logger.js";
import { findUser } from "@/user/user.model.js";

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error("JWT_SECRET required");

type Token = {
  id: string
  email: string;
  role: string;
  iat?: number;
  exp?: number
}

export const requireAuth = async (c: Context, next: () => Promise<void>) => {
  const auth = c.req.header("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new AppError("Authentication required", 401, "NO_TOKEN", false);

  try {
    const payload = jwtAuth.verify(token, SECRET) as Token;
    const userRow = await findUser(payload.id);
    if (!userRow || userRow.is_deleted) {
      throw new AppError("User not found or deleted", 401, "USER_NOT_FOUND");
    }

    (c as any).env = { ...(c as any).env, auth: { userId: payload.id, role: payload.role, email: payload.email } };
    await next();

  } catch (error: any) {
    // logger.error(error)
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token expired", 401, "TOKEN_EXPIRED");
    }
    if (error instanceof AppError) throw error;
    throw new AppError("Authentication failed", 401, "FAILED");
  }
}

export const requireRole = (role: string) => {
  return async (c: Context, next: () => Promise<void>) => {
    const auth = (c as any).env?.auth;
    if (!auth) throw new AppError("Not authenticated", 401);
    if (auth.role !== role) throw new AppError("Forbidden", 403, "FORBIDDEN");
    await next();
  }
}