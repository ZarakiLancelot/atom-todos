import { JwtPayload } from "../infra/security/jwt";

declare module "express-serve-static-core" {
  interface Request {
    auth?: JwtPayload;
  }
}
