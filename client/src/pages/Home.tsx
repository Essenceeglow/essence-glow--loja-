import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Sparkles } from "lucide-react";

export default function Home() {
  const categories = [
    {
      name: "Skincare",
      description: "Cuidados com a pele",
      image: "/images/skincare-category.jpg",
      color: "from-purple-300 to-pink-300",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Máscara Facial Hidratante",
      price: "R$ 89,90",
      image: "🧴",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Sérum Corporal Retinol",
      price: "R$ 129,90",
      image: "✨",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Água Micelar Suave",
      price: "R$ 42,90",
      image: "💦",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Protetor Solar Facial FPS 60",
      price: "R$ 69,90",
      image: "☀️",
      rating: 4.9,
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="gradient-transcendent py-20 md:py-32">
        <div className="container">
          <div className="max-w-2xl">
            <div className="spacious">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                Beleza e Elegância em Cada Detalhe
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Descubra nossa coleção exclusiva de skincare. Produtos selecionados com cuidado para você se sentir incrível.
              </p>
              <div className="flex gap-4">
                <Link href="/catalog">
                  <Button
                    size="lg"
                    className="gap-2 bg-pink-600 text-white hover:bg-pink-700"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Explorar Catálogo
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Compre o Look
                </Button>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="group cursor-pointer hover:shadow-soft transition-smooth overflow-hidden h-full flex flex-col">
                  <div className="bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                    {product.image}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-smooth">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400"
                                : "text-muted"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        {product.price}
                      </span>
                      <Button size="sm" variant="outline">
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

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
              Sugestões de combinações perfeitas para você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-soft transition-smooth">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-muted rounded-lg h-32 flex items-center justify-center text-3xl"
                  >
                    ✨
                  </div>
                ))}
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Rotina Skincare Completa
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Produtos essenciais para uma pele radiante
              </p>
              <Button className="w-full">Ver Combo</Button>
            </Card>

            <Card className="p-8 hover:shadow-soft transition-smooth">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-muted rounded-lg h-32 flex items-center justify-center text-3xl"
                  >
                    💎
                  </div>
                ))}
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                Noite Especial
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Maquiagem e lingerie para momentos inesquecíveis
              </p>
              <Button className="w-full">Ver Combo</Button>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
