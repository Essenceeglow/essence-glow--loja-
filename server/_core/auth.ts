import { ForbiddenError } from "@shared/_core/errors";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifySupabaseToken } from "./supabaseAuth";

/**
 * Autentica a requisição pelo token do Supabase e devolve o usuário da loja
 * (criando o registro na primeira vez). Lança erro se o token for inválido.
 */
export async function authenticateRequest(authHeader: string | null): Promise<User> {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const verified = await verifySupabaseToken(token);
  if (!verified) {
    throw ForbiddenError("Invalid or missing Supabase session");
  }

  const signedInAt = new Date();
  let user = await db.getUserByOpenId(verified.id);

  if (!user) {
    await db.upsertUser({
      openId: verified.id,
      name: verified.name,
      email: verified.email,
      loginMethod: "supabase",
      lastSignedIn: signedInAt,
    });
    user = await db.getUserByOpenId(verified.id);
  } else {
    await db.upsertUser({ openId: verified.id, lastSignedIn: signedInAt });
  }

  if (!user) throw ForbiddenError("User not found");
  return user;
}
