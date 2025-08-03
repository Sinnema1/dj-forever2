import jwt from "jsonwebtoken";
import User from "../models/User.js";

export interface Context {
  user?: any;
  isAuthenticated: boolean;
}

export async function createContext({ req }: { req: any }): Promise<Context> {
  let token = req.headers.authorization || "";

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (!token) {
    return { isAuthenticated: false };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.id);

    return {
      user,
      isAuthenticated: !!user,
    };
  } catch {
    return { isAuthenticated: false };
  }
}
