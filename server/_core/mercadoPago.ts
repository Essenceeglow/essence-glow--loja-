import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { ENV } from "./env";

function getClient() {
  if (!ENV.mercadoPagoAccessToken) {
    throw new Error(
      "MERCADOPAGO_ACCESS_TOKEN não configurado. Adicione essa variável de ambiente com o Access Token do Mercado Pago."
    );
  }
  return new MercadoPagoConfig({ accessToken: ENV.mercadoPagoAccessToken });
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
  const client = getClient();
  const preference = new Preference(client);

  const items = [...params.items];
  if (params.shippingCost > 0) {
    items.push({
      id: "frete",
      title: "Frete",
      quantity: 1,
      unit_price: params.shippingCost,
    });
  }

  const siteUrl = ENV.publicSiteUrl.replace(/\/$/, "");

  const result = await preference.create({
    body: {
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
    },
  });

  return {
    preferenceId: result.id,
    // Em produção usar init_point; sandbox_init_point funciona com credenciais de teste.
    // O Mercado Pago só devolve "sandbox_init_point" quando as credenciais usadas
    // são de TESTE. Priorizar ele garante que, em teste, o cliente caia na tela
    // certa de pagamento (senão dava erro ao tentar pagar com cartão de teste).
    // O Mercado Pago removeu o ambiente "sandbox" — o link correto é sempre
    // "init_point", tanto para teste quanto para produção. A diferença entre
    // testar e valer de verdade está em qual CONTA você usa pra comprar, não
    // no link. (sandbox_init_point é um campo legado e não deve ser usado.)
    checkoutUrl: result.init_point ?? null,
  };
}

/**
 * Consulta o status de um pagamento no Mercado Pago pelo ID do pagamento
 * (usado pelo webhook de notificação).
 */
export async function getPaymentStatus(paymentId: string) {
  const client = getClient();
  const payment = new Payment(client);
  const result = await payment.get({ id: paymentId });
  return {
    status: result.status, // approved, pending, rejected, etc.
    externalReference: result.external_reference,
  };
}
