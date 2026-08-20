# Beauty & Fashion Store - TODO

## Banco de Dados e Backend
- [x] Criar schema de produtos (categories, products, variants, pricing)
- [x] Criar schema de pedidos (orders, order_items, order_status)
- [x] Criar schema de endereços (user_addresses, default_address)
- [x] Criar schema de avaliações (product_reviews, ratings)
- [x] Criar schema de "Compre o Look" (product_bundles, bundle_items)
- [x] Implementar procedures tRPC para CRUD de produtos
- [x] Implementar procedures tRPC para gerenciamento de carrinho (sessão - localStorage)
- [ ] Implementar procedures tRPC para checkout e criação de pedidos

## Frontend - Layout e Navegação
- [x] Configurar design system (cores, tipografia, espaçamento)
- [x] Criar header com logo, busca, carrinho e menu de usuário
- [x] Criar footer com links e informações
- [x] Implementar navegação responsiva (mobile menu)

## Frontend - Página Inicial (Home)
- [x] Banner hero com gradiente transcendente
- [x] Seção de categorias (Maquiagem, Skincare, Pijamas, Lingerie)
- [x] Seção de produtos em destaque
- [x] Seção de "Compre o Look" (preview)

## Frontend - Catálogo de Produtos
- [x] Página de listagem de produtos por categoria
- [x] Filtros por tipo, faixa de preço e tamanho
- [x] Campo de busca funcional
- [x] Paginação ou infinite scroll
- [x] Exibição responsiva (grid mobile/tablet/desktop)

## Frontend - Página de Detalhes do Produto (PDP)
- [x] Galeria de imagens (zoom, thumbnails)
- [x] Seleção de tamanho e variação
- [x] Descrição completa do produto
- [x] Seção de avaliações de clientes
- [x] Botão "Adicionar ao Carrinho"
- [x] Seção "Compre o Look" (produtos relacionados)

## Frontend - Carrinho de Compras
- [x] Drawer lateral com resumo dos itens
- [x] Controle de quantidades (aumentar/diminuir)
- [x] Remover itens do carrinho
- [x] Cálculo automático de total
- [x] Botão "Ir para Checkout"

## Frontend - Checkout e Pagamento
- [x] Formulário de endereço (CEP, rua, número, complemento, cidade, estado)
- [x] Seleção de endereço salvo (se existir)
- [x] Resumo do pedido
- [ ] Integração Stripe (Elements/Payment Intent)
- [ ] Processamento de cartão de crédito/débito
- [ ] Confirmação de pedido

## Frontend - Autenticação e Perfil
- [x] Login e cadastro de usuários
- [x] Página de perfil do usuário
- [x] Histórico de pedidos
- [x] Gerenciamento de endereços salvos
- [x] Logout

## Backend - Integração Stripe
- [x] Configurar chaves Stripe (public e secret)
- [ ] Criar endpoint para criar Payment Intent
- [ ] Criar endpoint para confirmar pagamento
- [ ] Tratamento de erros de pagamento

## Correções Urgentes Implementadas
- [x] Remover separação de categorias no header
- [x] Corrigir Página de Detalhes do Produto (buscar dados reais)
- [x] Corrigir erro de duplicate identifier em routers.ts
- [x] Criar tabelas de banco de dados
- [x] Adicionar primeiro produto

## Backend - Integração Mercado Pago (Prioridade)
- [ ] Configurar chaves Mercado Pago (public e secret)
- [ ] Criar endpoint para criar preferência de pagamento
- [ ] Integrar Mercado Pago Checkout no frontend
- [ ] Tratamento de callbacks de pagamento

## Backend - Notificações
- [ ] Configurar sistema de notificações para proprietária
- [ ] Enviar notificação ao criar novo pedido
- [ ] Incluir detalhes do pedido na notificação

## Backend - Procedures tRPC para Checkout
- [x] Criar procedure para criar/atualizar endereço
- [x] Criar procedure para criar pedido
- [x] Criar procedure para listar pedidos do usuário
- [ ] Criar procedure para atualizar status do pedido

## Testes e Validação
- [ ] Testes unitários (procedures tRPC)
- [ ] Testes de fluxo de compra (E2E)
- [x] Validação de responsividade (mobile/tablet/desktop)
- [ ] Validação de acessibilidade

## Deploy e Entrega
- [ ] Configurar variáveis de ambiente (Mercado Pago, notificações)
- [x] Criar checkpoint com correções urgentes
- [ ] Adicionar mais produtos de exemplo
- [ ] Testar fluxo completo de compra
- [ ] Entregar site ao usuário
