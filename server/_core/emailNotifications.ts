import { ENV } from "./env";

function isConfigured() {
  return Boolean(ENV.resendApiKey && ENV.notificationEmail);
}

/**
 * Manda um e-mail avisando o dono da loja que um pedido acabou de ser pago.
 * Se a chave do Resend ou o e-mail de destino não estiverem configurados,
 * simplesmente não faz nada (não quebra o checkout por causa disso).
 */
export async function notifyNewSale(params: {
  orderNumber: string;
  totalAmount: string;
  customerName?: string | null;
  customerEmail?: string | null;
  items: { productName: string; quantity: number }[];
}) {
  if (!isConfigured()) return;

  try {
    const itemsList = params.items
      .map((i) => `- ${i.productName} (${i.quantity}x)`)
      .join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      from: "Essence & Glow <onboarding@resend.dev>",
      to: ENV.notificationEmail,
      subject: `🎉 Nova venda: ${params.orderNumber} - R$ ${params.totalAmount}`,
      text: `Você recebeu um novo pedido pago!

Pedido: ${params.orderNumber}
Total: R$ ${params.totalAmount}
Cliente: ${params.customerName ?? "Não informado"}
E-mail do cliente: ${params.customerEmail ?? "Não informado"}

Itens:
${itemsList}

Acesse o painel /admin para ver todos os detalhes e o endereço de entrega.`,
      }),
    });
    if (!res.ok) {
      console.error("[Email] Resend respondeu erro:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    // Nunca deixa uma falha de e-mail travar a confirmação do pagamento.
    console.error("[Email] Falha ao enviar notificação de venda:", error);
  }
}
