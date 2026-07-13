import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid authorization header.", "UNAUTHENTICATED");
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as { sub: string; role: string };
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token.", "UNAUTHENTICATED");
  }
}

/** Must run after requireAuth — relies on req.userRole being set. */
export function requireAdmin(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN" && req.userRole !== "SUPER_ADMIN") {
    throw new AppError(403, "Admin access required.", "FORBIDDEN");
  }
  next();
}
