import jwt from "jsonwebtoken";

import { getJwtSecret } from "../../config/env";

const JWT_SECRET = getJwtSecret();

export type JwtPayload = { sub: string; email: string};

export function signToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email } satisfies JwtPayload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
