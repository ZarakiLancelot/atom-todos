import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

import { verifyToken } from "./jwt";

type AuthRequest = Request & { auth?: JwtPayload };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
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
