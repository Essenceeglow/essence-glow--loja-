import { AsyncLocalStorage } from "node:async_hooks";
import type { drizzle } from "drizzle-orm/postgres-js";
import type postgres from "postgres";

/**
 * Variáveis, secrets e bindings do Worker (configurados no painel do Cloudflare
 * ou no wrangler.jsonc). Substituem o antigo process.env do Render.
 */
export type Bindings = {
  ASSETS?: { fetch(request: Request): Promise<Response> };
  /** Opcional: binding do Hyperdrive (pool de conexões do Cloudflare). */
  HYPERDRIVE?: { connectionString: string };
  DATABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  OWNER_OPEN_ID?: string;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  PUBLIC_SITE_URL?: string;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
};

type Store = {
  env: Bindings;
  sql?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle>;
};

// Cada requisição tem o seu próprio "contexto": variáveis e conexão com o banco.
// No Workers não dá para reaproveitar conexão entre requisições diferentes.
const als = new AsyncLocalStorage<Store>();

export function runWithEnv<T>(env: Bindings, fn: () => Promise<T>): Promise<T> {
  return als.run({ env }, fn);
}

export function getStore(): Store | undefined {
  return als.getStore();
}

export function getBindings(): Bindings {
  return als.getStore()?.env ?? {};
}
