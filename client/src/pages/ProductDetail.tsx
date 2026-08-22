import { useState } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, Star, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Buscar produto real do banco de dados
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: parseInt(id || "1") },
    { enabled: !!id }
  );

  const handleAddToCart = () => {
    if (!product) return;
    
    // Dispatch event para adicionar ao carrinho
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : "📦",
      }
    }));
    toast.success(`${product.name} adicionado ao carrinho!`);
    setQuantity(1);
  };

  const handleShare = () => {
    toast.success("Link copiado para a área de transferência!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Produto não encontrado</p>
            <Link href="/catalog">
              <a className="text-accent hover:underline mt-4 inline-block">Voltar ao catálogo</a>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <Link href="/catalog" className="hover:text-accent">
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div>
              <div className="bg-gradient-to-br from-muted to-muted/50 rounded-lg p-8 mb-4 h-96 flex items-center justify-center text-6xl overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images && product.images.map((image: string, idx: number) => (
                  <div key={idx} className="bg-muted rounded-lg p-4 h-24 flex items-center justify-center text-3xl overflow-hidden cursor-pointer hover:opacity-80">
                    <img 
                      src={image} 
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(parseFloat(String(product.rating) || "0"))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviewCount || 0} avaliações)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-accent">
                      R$ {parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {parseFloat(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                    <p className="text-sm text-green-600 mt-2">
                      Economia: R$ {(parseFloat(product.originalPrice) - parseFloat(product.price)).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Selectors */}
                <div className="space-y-6 mb-8">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Quantidade
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-8">
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Stock Info */}
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-foreground">
                    <strong>Disponibilidade:</strong> Em estoque
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="mb-16">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Características do Produto
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>✓ Fórmula premium e sofisticada</li>
                  <li>✓ Longa duração e acabamento impecável</li>
                  <li>✓ Cruelty-free e vegan</li>
                  <li>✓ Embalagem elegante</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Avaliações dos Clientes
                </h3>
                <div className="space-y-4">
                  <div className="border-b border-border pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-foreground">Cliente Satisfeito</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Excelente produto! Superou minhas expectativas."
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
