// server/src/graphql/context.ts
import type { Request } from "express";
import { authenticateToken } from "../middleware/auth.js";

export interface GraphQLContext {
  user?: { _id: string; fullName: string; email: string };
}

// Change to async to match Apollo's expected signature
export async function createContext({
  req,
}: {
  req: Request;
}): Promise<GraphQLContext> {
  const result = authenticateToken({ req });
  return { user: result.user ?? undefined };
}
