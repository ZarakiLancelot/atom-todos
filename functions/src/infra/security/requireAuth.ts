import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken } from "./jwt";

type AuthRequest = Request & { auth?: JwtPayload };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    return next();
  }

  const raw =
    req.get("Authorization") ||
    req.get("X-Authorization") ||
    req.get("authorization") ||
    req.get("x-authorization") ||
    "";

  const match = raw.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim() || null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    req.auth = verifyToken(token);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
