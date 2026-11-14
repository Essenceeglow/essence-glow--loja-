import { getBindings } from "./runtime";

// Lê as variáveis da requisição atual (Cloudflare Worker).
export const ENV = {
  get ownerOpenId() {
    return getBindings().OWNER_OPEN_ID ?? "";
  },
  get supabaseUrl() {
    return (getBindings().SUPABASE_URL ?? "").replace(/\/+$/, "");
  },
  get supabaseAnonKey() {
    return getBindings().SUPABASE_ANON_KEY ?? "";
  },
  get mercadoPagoAccessToken() {
    return getBindings().MERCADOPAGO_ACCESS_TOKEN ?? "";
  },
  get publicSiteUrl() {
    return getBindings().PUBLIC_SITE_URL ?? "";
  },
  get resendApiKey() {
    return getBindings().RESEND_API_KEY ?? "";
  },
  get notificationEmail() {
    return getBindings().NOTIFICATION_EMAIL ?? "";
  },
};
