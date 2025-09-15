import { defineSecret } from "firebase-functions/params";
import jwt from "jsonwebtoken";

import { getJwtSecret } from "../../config/env";

const JWT_SECRET = defineSecret("JWT_SECRET");

export type JwtPayload = { sub: string; email: string};

export function signToken(userId: string, email: string): string {
  const secret = JWT_SECRET.value() || getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ sub: userId, email } satisfies JwtPayload, secret, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const secret = JWT_SECRET.value() || getJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.verify(token, secret) as JwtPayload;
}
