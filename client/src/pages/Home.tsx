import { Link } from "wouter";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Leaf, Droplet, Smile, HeartHandshake, Heart, Sparkles, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const categories = [
    {
      name: "Skincare",
      description: "Cuidados com a pele",
      image: "/images/skincare-category.jpg",
      color: "from-purple-300 to-pink-300",
    },
  ];

  const features = [
    { icon: Leaf, label: "Ativos Naturais" },
    { icon: Droplet, label: "Hidratação Intensa" },
    { icon: Smile, label: "Pele Saudável e Radiante" },
    { icon: HeartHandshake, label: "Cruelty Free e Vegano" },
  ];

  // Produtos reais do banco de dados
  const { data: allProducts, isLoading: isLoadingProducts } = trpc.products.getAll.useQuery();

  // Sabores para a seção "Compre o Look"
  const { data: lookData, isLoading: isLoadingLooks } = trpc.looks.getFlavors.useQuery();
  const lookVariants = lookData?.variants ?? [];

  // Produtos em Destaque: usa os que o admin marcou manualmente como destaque.
  // Se nenhum foi marcado ainda, mostra os mais recentes como alternativa,
  // sempre com fotos de verdade primeiro (produtos sem foto ficam por último).
  const nonLookProducts = (allProducts ?? []).filter((p) => p.id !== lookData?.product?.id);
  const manuallyFeatured = nonLookProducts.filter((p: any) => p.featured === 1);
  const featuredProducts = (manuallyFeatured.length > 0 ? manuallyFeatured : nonLookProducts)
    .slice()
    .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .slice(0, 4);

  const handleQuickAdd = (e: React.MouseEvent, product: (typeof featuredProducts)[number]) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price as any),
        quantity: 1,
        image: product.images && product.images.length > 0 ? product.images[0] : "📦",
      }
    }));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="gradient-transcendent py-16 md:py-20 overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="spacious">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 max-w-8 bg-accent/40" />
                <span className="text-xs md:text-sm font-semibold tracking-widest text-accent uppercase">
                  Cuidado que realça sua melhor versão
                </span>
                <div className="h-px flex-1 max-w-8 bg-accent/40" />
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                <span className="text-foreground">Beleza e Elegância</span>
                <br />
                <span className="text-accent">em Cada Detalhe</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Descubra nossa coleção exclusiva de skincare. Produtos selecionados
                com cuidado para você{" "}
                <span className="font-semibold text-foreground">se sentir incrível</span>,
                todos os dias.
              </p>

              <div className="flex gap-4 mb-10">
                <Link href="/catalog">
                  <Button
                    size="lg"
                    className="gap-2 bg-pink-600 text-white hover:bg-pink-700"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link href="/looks">
                  <Button size="lg" variant="outline">
                    Compre o Look
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {features.map((feature) => (
                  <div key={feature.label} className="flex flex-col items-center text-center gap-2">
                    <feature.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-muted-foreground leading-tight">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/hero-products.jpg"
                alt="Produtos Essence & Glow"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <div className="inline-flex items-center gap-2 bg-card border border-accent/20 rounded-full px-6 py-3 shadow-sm">
              <Heart className="w-4 h-4 text-accent" fill="currentColor" />
              <span className="text-sm text-muted-foreground">
                Um ritual diário de <span className="font-bold text-accent">amor</span> por você
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Nossas Categorias
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore nossos produtos selecionados com cuidado
            </p>
          </div>

          <div className="grid grid-cols-1 max-w-sm mx-auto gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/catalog?category=${category.name.toLowerCase()}`}
              >
                <Card className="group cursor-pointer hover:shadow-soft transition-smooth overflow-hidden h-full">
                  <div
                    className={`bg-gradient-to-br ${category.color} h-40 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform`}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-accent">DESTAQUES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-lg text-muted-foreground">
              Tendências 2026 que você não pode perder
            </p>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum produto cadastrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="group cursor-pointer hover:shadow-soft transition-smooth overflow-hidden h-full flex flex-col">
                    <div className="bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden p-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-smooth line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < Math.floor(parseFloat(product.rating as any) || 0)
                                  ? "text-yellow-400"
                                  : "text-muted"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {parseFloat(product.rating as any || "0").toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-accent">
                          R$ {parseFloat(product.price as any).toFixed(2)}
                        </span>
                        <Button size="sm" variant="outline" onClick={(e) => handleQuickAdd(e, product)}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/catalog">
              <Button size="lg" variant="outline">
                Ver Todos os Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compre o Look Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Compre o Look
            </h2>
            <p className="text-lg text-muted-foreground">
              {lookData?.product
                ? `Escolha seu sabor favorito de ${lookData.product.name}`
                : "Sugestões de combinações perfeitas para você"}
            </p>
          </div>

          {isLoadingLooks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : lookVariants.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhum combo disponível no momento. Volte em breve!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {lookVariants.slice(0, 4).map((variant) => (
                  <Link key={variant.id} href="/looks">
                    <Card className="p-4 hover:shadow-soft transition-smooth cursor-pointer h-full flex flex-col">
                      <div className="bg-gradient-to-br from-muted to-muted/50 h-32 flex items-center justify-center overflow-hidden rounded-lg mb-3 p-2">
                        {variant.images && variant.images.length > 0 ? (
                          <img
                            src={variant.images[0]}
                            alt={variant.label ?? ""}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <h3 className="font-serif font-semibold text-foreground text-sm text-center">
                        {variant.label}
                      </h3>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/looks">
                  <Button size="lg">Ver Todos os Sabores</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
