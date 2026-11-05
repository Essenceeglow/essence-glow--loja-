import type { User } from "../../drizzle/schema";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: Request;
  user: User | null;
};

export async function createContext(req: Request): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateRequest(req.headers.get("authorization"));
  } catch {
    // Autenticação é opcional nas rotas públicas.
    user = null;
  }
  return { req, user };
}
