import { ENV } from "./env";

export type SupabaseVerifiedUser = {
  id: string; // uuid do usuário no Supabase Auth
  email: string | null;
  name: string | null;
};

/**
 * Verifica um access token do Supabase Auth (enviado pelo navegador em
 * Authorization: Bearer <token>) e devolve os dados básicos do usuário,
 * ou null se o token for inválido/ausente.
 * Usa a API REST do Supabase direto (a chave "anon" é pública por design).
 */
export async function verifySupabaseToken(
  token: string | undefined | null
): Promise<SupabaseVerifiedUser | null> {
  if (!token) return null;

  if (!ENV.supabaseUrl || !ENV.supabaseAnonKey) {
    console.error("[SupabaseAuth] SUPABASE_URL / SUPABASE_ANON_KEY não configurados.");
    return null;
  }

  try {
    const res = await fetch(`${ENV.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: ENV.supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;

    const user = (await res.json()) as {
      id?: string;
      email?: string | null;
      user_metadata?: { name?: string; full_name?: string };
    };
    if (!user?.id) return null;

    return {
      id: user.id,
      email: user.email ?? null,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? user.email ?? null,
    };
  } catch (error) {
    console.warn("[SupabaseAuth] Falha ao verificar token:", error);
    return null;
  }
}
