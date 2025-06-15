import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token = req.headers.authorization || "";
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = user;
  } catch {
    (req as any).user = null;
  }
  next();
}
