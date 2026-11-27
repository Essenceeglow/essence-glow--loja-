# Essence & Glow no Cloudflare — passo a passo

A loja roda inteira em **um Worker do Cloudflare**:

- O **site** (pasta `dist/public`, gerada pelo Vite) é servido direto pelo Cloudflare, grátis e sem limite.
- A **API** (`/api/*`: produtos, login, pedidos, Mercado Pago) roda no Worker (`worker/index.ts`).
- O **banco** continua no **Supabase** (nada muda nos dados).
- Uma **tarefa diária** acessa o banco para o Supabase grátis não pausar por inatividade.

A loja do Render continua no ar, intacta, até você decidir virar o domínio. **Não faça merge desta branch na `main` antes disso** (o Render publica a `main`).

---

## 1. Conectar o repositório

1. Crie/entre na conta em <https://dash.cloudflare.com>.
2. Vá em **Workers & Pages → Create → Import a repository** e conecte o GitHub.
3. Escolha o repositório da loja e a branch **`cloudflare`**.
4. Nome do projeto/Worker: **`essence-glow`** (precisa ser igual ao `name` do `wrangler.jsonc`).
5. Configurações de build:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
6. Em **Build variables** (variáveis usadas na hora de construir o site), adicione os mesmos valores que você já tem no Render:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

> O primeiro deploy pode terminar com a loja sem banco. É normal: falta o passo 2.

## 2. Variáveis e secrets do Worker (copie do Render)

No Worker **essence-glow → Settings → Variables and Secrets**, crie (as mesmas do **Render → Environment**):

| Nome | O que é |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres do Supabase (a mesma do Render) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `OWNER_OPEN_ID` | ID (UUID) do seu usuário admin no Supabase Auth |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token do Mercado Pago (produção) |
| `PUBLIC_SITE_URL` | Endereço público da loja, sem barra no fim |
| `RESEND_API_KEY` | (opcional) chave do Resend, para o e-mail de venda |
| `NOTIFICATION_EMAIL` | (opcional) e-mail que recebe o aviso de venda |

Marque as chaves/senhas como **Secret**. Depois de salvar, faça um novo deploy (**Deployments → Retry**) ou dê um push na branch.

**Se o banco não conectar:** no Supabase clique em **Connect** e copie a string do **Session pooler** (porta 5432, host `...pooler.supabase.com`). Ela funciona em IPv4 e costuma resolver.

## 3. Testar no endereço do Cloudflare

O Cloudflare cria um endereço tipo `https://essence-glow.SEU-USUARIO.workers.dev`.

1. Coloque esse endereço em `PUBLIC_SITE_URL` (enquanto testa).
2. Teste: produtos aparecem, login e cadastro, painel `/admin`, upload de imagem, carrinho, **uma compra real barata**, e se o pedido vira "pago" depois do pagamento.
3. Se algo falhar, veja **Workers → essence-glow → Logs** (a observabilidade já está ligada).

## 4. Virar o domínio

1. Em **Settings → Domains & Routes → Add → Custom domain**, adicione o domínio (ele precisa estar no DNS do Cloudflare).
2. Atualize `PUBLIC_SITE_URL` para o domínio final.
3. No **Supabase → Authentication → URL Configuration**, coloque o domínio final em *Site URL* e em *Redirect URLs*.
4. Mercado Pago: a URL do webhook é enviada junto com cada pagamento (`PUBLIC_SITE_URL/api/webhooks/mercadopago`). Se você também cadastrou um webhook fixo no painel do Mercado Pago, atualize ou remova o endereço antigo.

## 5. Desligar o Render

Só depois de **um dia inteiro** de loja estável no Cloudflare. Até lá, o Render é o seu plano B (para voltar, basta apontar o domínio de novo).

---

## O que mudou no código (resumo)

- Servidor Express → Worker (`worker/index.ts`, tRPC pelo adaptador `fetch`).
- Mercado Pago e Resend agora usam a API REST direto (sem os pacotes antigos).
- A verificação do login chama a API do Supabase direto.
- A conexão com o banco é criada a cada requisição (exigência do Workers).
- Removidos os restos do Manus (OAuth antigo, LLM, mapas, voz, storage proxy, plugins do Vite).
- Erros da API não mostram mais detalhes internos.
- Título da página corrigido para "Essence & Glow | Skincare".

## Rodar no computador (opcional)

```bash
npm install
cp .dev.vars.example .dev.vars   # preencha os valores
npm run build
npm run dev:api                  # Worker + site em http://localhost:8787
```

## Plano de upgrade (opcional): Hyperdrive

Se a loja parecer lenta no acesso ao banco, dá para ligar o **Hyperdrive** (pool de conexões do Cloudflare, incluído no plano grátis): crie em *Storage & Databases → Hyperdrive* apontando para o Supabase e adicione ao `wrangler.jsonc`:

```jsonc
"hyperdrive": [{ "binding": "HYPERDRIVE", "id": "ID_DO_SEU_HYPERDRIVE" }]
```

O código já usa o Hyperdrive automaticamente se o binding existir.

## Limite do plano grátis

O Workers grátis permite **10 ms de CPU por requisição** (tempo esperando o banco não conta) e 100 mil requisições por dia. Se alguma rota estourar o limite, o Cloudflare responde com erro 1102. O plano pago (US$ 5/mês) tira esse limite.

