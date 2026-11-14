import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { orders, orderItems, products, users } from "../../drizzle/schema";
import { getPaymentStatus } from "./mercadoPago";
import { notifyNewSale } from "./emailNotifications";

/**
 * Rota que o Mercado Pago chama automaticamente para avisar sobre mudanças no
 * status de um pagamento (aprovado, recusado, pendente...).
 *
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks
 */
export async function handleMercadoPagoWebhook(request: Request): Promise<Response> {
  const ok = () => new Response("ok", { status: 200 });

  try {
    const url = new URL(request.url);
    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null; // o Mercado Pago às vezes manda só query string
    }

    // O Mercado Pago manda o tipo de evento e o id do recurso (pagamento).
    const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
    const type = body?.type ?? url.searchParams.get("type");

    if (type !== "payment" || !paymentId) {
      // Outros tipos de evento (ex: merchant_order) são ignorados por enquanto.
      return ok();
    }

    const { status, externalReference } = await getPaymentStatus(String(paymentId));
    if (!externalReference) return ok();

    const orderId = parseInt(externalReference, 10);
    if (Number.isNaN(orderId)) return ok();

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

    return ok();
  } catch (error) {
    console.error("[MercadoPago Webhook] Error:", error);
    // Sempre responde 200 para o Mercado Pago não ficar re-tentando indefinidamente
    // por um erro que já foi logado do nosso lado.
    return ok();
  }
}
