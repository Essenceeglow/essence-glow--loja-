import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

// Cliente Supabase usado apenas para validar o token de acesso enviado
// pelo navegador (Authorization: Bearer <token>). A chave "anon" é pública
// por design e suficiente para chamar auth.getUser(token).
const supabaseAdmin = ENV.supabaseUrl && ENV.supabaseAnonKey
  ? createClient(ENV.supabaseUrl, ENV.supabaseAnonKey)
  : null;

export type SupabaseVerifiedUser = {
  id: string; // uuid do usuário no Supabase Auth
  email: string | null;
  name: string | null;
};

/**
 * Verifica um access token do Supabase Auth e retorna os dados básicos
 * do usuário autenticado, ou null se o token for inválido/ausente.
 */
export async function verifySupabaseToken(
  token: string | undefined | null
): Promise<SupabaseVerifiedUser | null> {
  if (!token) return null;

  if (!supabaseAdmin) {
    console.error(
      "[SupabaseAuth] SUPABASE_URL / SUPABASE_ANON_KEY não configurados no servidor."
    );
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    const name =
      (data.user.user_metadata?.name as string | undefined) ??
      (data.user.user_metadata?.full_name as string | undefined) ??
      data.user.email ??
      null;

    return {
      id: data.user.id,
      email: data.user.email ?? null,
      name,
    };
  } catch (error) {
    console.warn("[SupabaseAuth] Falha ao verificar token:", error);
    return null;
  }
}
