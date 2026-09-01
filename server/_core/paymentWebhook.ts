import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { orders } from "../../drizzle/schema";
import { getPaymentStatus } from "./mercadoPago";

/**
 * Registra a rota que o Mercado Pago chama automaticamente para avisar
 * sobre mudanças no status de um pagamento (aprovado, recusado, pendente...).
 *
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
 */
export function registerPaymentWebhook(app: Express) {
  app.post("/api/webhooks/mercadopago", async (req: Request, res: Response) => {
    try {
      // O Mercado Pago manda o tipo de evento e o id do recurso (pagamento).
      const paymentId =
        req.body?.data?.id ??
        req.query["data.id"] ??
        req.query.id;

      const type = req.body?.type ?? req.query.type;

      if (type !== "payment" || !paymentId) {
        // Outros tipos de evento (ex: merchant_order) são ignorados por enquanto.
        res.status(200).send("ok");
        return;
      }

      const { status, externalReference } = await getPaymentStatus(String(paymentId));

      if (!externalReference) {
        res.status(200).send("ok");
        return;
      }

      const orderId = parseInt(externalReference, 10);
      if (Number.isNaN(orderId)) {
        res.status(200).send("ok");
        return;
      }

      let newStatus: "pending" | "paid" | "cancelled" | null = null;
      if (status === "approved") newStatus = "paid";
      else if (status === "rejected" || status === "cancelled") newStatus = "cancelled";

      if (newStatus) {
        const db = await getDb();
        if (db) {
          await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));
        }
      }

      res.status(200).send("ok");
    } catch (error) {
      console.error("[MercadoPago Webhook] Error:", error);
      // Sempre responde 200 para o Mercado Pago não ficar re-tentando indefinidamente
      // por um erro que já foi logado do nosso lado.
      res.status(200).send("ok");
    }
  });
}
