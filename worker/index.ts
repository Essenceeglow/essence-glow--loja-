import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { sql } from "drizzle-orm";
import { createContext } from "../server/_core/context";
import { handleMercadoPagoWebhook } from "../server/_core/paymentWebhook";
import { runWithEnv, type Bindings } from "../server/_core/runtime";
import { closeDb, getDb } from "../server/db";
import { appRouter } from "../server/routers";

type Ctx = { waitUntil(promise: Promise<unknown>): void };

async function handleApi(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/trpc")) {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: () => createContext(request),
      onError({ path, error }) {
        console.error(`[tRPC] ${path ?? "?"}:`, error.message);
      },
    });
  }

  if (url.pathname === "/api/webhooks/mercadopago" && request.method === "POST") {
    return handleMercadoPagoWebhook(request);
  }

  return new Response("Not found", { status: 404 });
}

export default {
  // Só chamadas /api/* chegam aqui; o site (arquivos estáticos) é servido
  // direto pelo Cloudflare (ver "assets" no wrangler.jsonc).
  async fetch(request: Request, env: Bindings, ctx: Ctx): Promise<Response> {
    return runWithEnv(env, async () => {
      try {
        return await handleApi(request);
      } catch (error) {
        console.error("[Worker] Erro não tratado:", error);
        return new Response("Internal Server Error", { status: 500 });
      } finally {
        ctx.waitUntil(closeDb());
      }
    });
  },

  // Tarefa agendada (1x por dia): faz uma consulta simples ao banco para o
  // Supabase não pausar o projeto por inatividade (plano grátis).
  async scheduled(_controller: unknown, env: Bindings, ctx: Ctx): Promise<void> {
    await runWithEnv(env, async () => {
      try {
        const db = await getDb();
        if (db) {
          await db.execute(sql`select 1`);
          console.log("[Cron] Banco acordado com sucesso.");
        } else {
          console.warn("[Cron] Banco não configurado.");
        }
      } catch (error) {
        console.error("[Cron] Falha ao consultar o banco:", error);
      } finally {
        ctx.waitUntil(closeDb());
      }
    });
  },
};
