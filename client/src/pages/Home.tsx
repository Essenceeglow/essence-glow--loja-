import { Link } from "wouter";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Leaf, Droplet, Smile, HeartHandshake, Heart, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const heroBanners = [
  {
    src: "/images/hero-esfoliantes.jpg",
    alt: "Essence & Glow: esfoliantes corporais Porán Bem Me Quero Frutas nos sabores pitaya, melancia, manga rosa e pêssego",
  },
  {
    src: "/images/hero-cuidados.jpg",
    alt: "Essence & Glow: beleza, hidratação e perfume em uma só rotina de autocuidado",
  },
];

export default function Home() {
  // Carrossel do banner principal
  const [bannerIndex, setBannerIndex] = React.useState(0);
  const [bannerPaused, setBannerPaused] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const goToBanner = (index: number) =>
    setBannerIndex((index + heroBanners.length) % heroBanners.length);

  React.useEffect(() => {
    if (bannerPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerPaused]);

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
      <section className="gradient-transcendent py-6 md:py-10 overflow-hidden">
        <div className="container">
          <div
            className="relative mx-auto max-w-4xl"
            onMouseEnter={() => setBannerPaused(true)}
            onMouseLeave={() => setBannerPaused(false)}
            onTouchStart={(e) => {
              setBannerPaused(true);
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const start = touchStartX.current;
              touchStartX.current = null;
              setBannerPaused(false);
              if (start === null) return;
              const delta = e.changedTouches[0].clientX - start;
              if (Math.abs(delta) > 50) goToBanner(bannerIndex + (delta < 0 ? 1 : -1));
            }}
          >
            <div className="overflow-hidden rounded-3xl md:rounded-[2.5rem] shadow-lg">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {heroBanners.map((banner, i) => (
                  <Link
                    key={banner.src}
                    href="/catalog"
                    className="block w-full shrink-0"
                    aria-hidden={i !== bannerIndex}
                    tabIndex={i !== bannerIndex ? -1 : 0}
                  >
                    <img
                      src={banner.src}
                      alt={banner.alt}
                      width={1166}
                      height={695}
                      className="block w-full h-auto"
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : undefined}
                    />
                  </Link>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => goToBanner(bannerIndex - 1)}
              aria-label="Banner anterior"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow items-center justify-center text-pink-700 transition-smooth"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => goToBanner(bannerIndex + 1)}
              aria-label="Próximo banner"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow items-center justify-center text-pink-700 transition-smooth"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {heroBanners.map((banner, i) => (
                <button
                  key={banner.src}
                  type="button"
                  onClick={() => goToBanner(i)}
                  aria-label={`Ir para o banner ${i + 1}`}
                  aria-current={i === bannerIndex}
                  className={`h-2.5 rounded-full transition-all ${
                    i === bannerIndex ? "w-6 bg-pink-700" : "w-2.5 bg-white/80 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6 md:mt-8">
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
                    className={`relative bg-gradient-to-br ${category.color} aspect-square w-full flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform`}
                  >
                    <Sparkles className="w-12 h-12 text-white/90" strokeWidth={1.5} />
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Sem imagem enviada ainda: mantém o fundo rosa com o ícone.
                        e.currentTarget.style.display = "none";
                      }}
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
