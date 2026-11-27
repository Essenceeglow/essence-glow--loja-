import { ENV } from "./env";

const API = "https://api.mercadopago.com";

function getToken() {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione esse secret com o Access Token do Mercado Pago."
    );
  }
  return ENV.mercadoPagoAccessToken;
}

export type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
};

/**
 * Cria uma "preference" no Mercado Pago (Checkout Pro) para um pedido.
 * Retorna a URL para onde o cliente deve ser redirecionado para pagar.
 */
export async function createPaymentPreference(params: {
  orderId: number;
  orderNumber: string;
  items: PreferenceItem[];
  shippingCost: number;
  payerEmail?: string | null;
}) {
  const items = [...params.items];
  if (params.shippingCost > 0) {
    items.push({ id: "frete", title: "Frete", quantity: 1, unit_price: params.shippingCost });
  }

  const siteUrl = ENV.publicSiteUrl.replace(/\/$/, "");

  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: "BRL",
      })),
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      external_reference: String(params.orderId),
      back_urls: siteUrl
        ? {
            success: `${siteUrl}/checkout/sucesso?order=${params.orderNumber}`,
            failure: `${siteUrl}/checkout/erro?order=${params.orderNumber}`,
            pending: `${siteUrl}/checkout/pendente?order=${params.orderNumber}`,
          }
        : undefined,
      auto_return: siteUrl ? "approved" : undefined,
      notification_url: siteUrl ? `${siteUrl}/api/webhooks/mercadopago` : undefined,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago preference failed (${res.status}): ${detail}`);
  }

  const result = (await res.json()) as { id?: string; init_point?: string };

  return {
    preferenceId: result.id,
    // O Mercado Pago removeu o ambiente "sandbox": o link correto é sempre
    // "init_point" (sandbox_init_point é um campo legado e não deve ser usado).
    checkoutUrl: result.init_point ?? null,
  };
}

/**
 * Consulta o status de um pagamento no Mercado Pago pelo ID do pagamento
 * (usado pelo webhook de notificação).
 */
export async function getPaymentStatus(paymentId: string) {
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago payment lookup failed (${res.status}): ${detail}`);
  }
  const result = (await res.json()) as { status?: string; external_reference?: string | null };
  return {
    status: result.status, // approved, pending, rejected, etc.
    externalReference: result.external_reference,
  };
}
