export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Antes disparava o OAuth do Manus. Agora só leva o usuário para a
// página de login/cadastro (email + senha via Supabase Auth).
export const startLogin = () => {
  window.location.href = "/login";
};
