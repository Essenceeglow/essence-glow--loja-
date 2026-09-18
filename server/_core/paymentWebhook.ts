import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { orders, orderItems, products, users } from "../../drizzle/schema";
import { getPaymentStatus } from "./mercadoPago";
import { notifyNewSale } from "./emailNotifications";

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
          const [currentOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
          const wasAlreadyPaid = currentOrder?.status === "paid";

          await db.update(orders).set({ status: newStatus }).where(eq(orders.id, orderId));

          // Só notifica na primeira vez que o pedido vira "pago" (evita e-mail duplicado
          // se o Mercado Pago reenviar o mesmo aviso, o que é comum acontecer).
          if (newStatus === "paid" && !wasAlreadyPaid && currentOrder) {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
            const allProducts = await db.select().from(products);
            const productMap = new Map(allProducts.map((p) => [p.id, p]));
            const [customer] = await db.select().from(users).where(eq(users.id, currentOrder.userId)).limit(1);

            await notifyNewSale({
              orderNumber: currentOrder.orderNumber,
              totalAmount: String(currentOrder.totalAmount),
              customerName: customer?.name,
              customerEmail: customer?.email,
              items: items.map((i) => ({
                productName: productMap.get(i.productId)?.name ?? `Produto #${i.productId}`,
                quantity: i.quantity,
              })),
            });
          }
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
