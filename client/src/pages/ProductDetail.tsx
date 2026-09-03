import { useState } from "react";
import * as React from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, Star, ShoppingBag, Loader2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  // Buscar produto real do banco de dados
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: parseInt(id || "1") },
    { enabled: !!id }
  );

  // Buscar as variantes (cor/sabor/nome) deste produto - todas na mesma página
  const { data: variants } = trpc.products.getVariants.useQuery(
    { productId: parseInt(id || "1") },
    { enabled: !!id }
  );

  const selectedVariant = variants?.find((v) => v.id === selectedVariantId) ?? null;
  // Foto exibida: a da variante selecionada (se tiver uma própria), senão a do produto
  const displayImages =
    selectedVariant?.image ? [selectedVariant.image] : product?.images ?? [];

  // Ao trocar de produto (navegação normal), reseta seleção
  React.useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantId(null);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    if (variants && variants.length > 0 && !selectedVariant) {
      toast.error("Escolha uma opção antes de adicionar ao carrinho");
      return;
    }

    // Dispatch event para adicionar ao carrinho
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: {
        id: product.id,
        name: selectedVariant ? `${product.name} - ${selectedVariant.label}` : product.name,
        price: product.price,
        quantity: quantity,
        image: selectedVariant?.image || (product.images && product.images.length > 0 ? product.images[0] : "📦"),
        variantId: selectedVariant?.id,
        color: selectedVariant?.label,
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
              <div
                className="bg-gradient-to-br from-muted to-muted/50 rounded-lg p-8 mb-4 h-96 flex items-center justify-center text-6xl overflow-hidden cursor-zoom-in relative group"
                onClick={() => displayImages.length > 0 && setIsLightboxOpen(true)}
              >
                {displayImages.length > 0 ? (
                  <>
                    <img
                      src={displayImages[selectedImageIndex] ?? displayImages[0]}
                      alt={selectedVariant ? `${product.name} - ${selectedVariant.label}` : product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-smooth flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-smooth drop-shadow" />
                    </div>
                  </>
                ) : (
                  <span>📦</span>
                )}
              </div>
              {!selectedVariant && product.images && product.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {product.images.map((image: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`bg-muted rounded-lg p-4 h-24 flex items-center justify-center text-3xl overflow-hidden cursor-pointer hover:opacity-80 transition-smooth border-2 ${
                        selectedImageIndex === idx ? "border-accent" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
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

                {/* Variantes (mesma página, troca a foto ao clicar) */}
                {variants && variants.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      Escolha uma opção {!selectedVariant && <span className="text-destructive">*</span>}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(variant.id);
                            setSelectedImageIndex(0);
                          }}
                          className={`flex items-center gap-2 border-2 rounded-lg p-2 pr-3 transition-smooth hover:border-accent ${
                            selectedVariantId === variant.id
                              ? "border-accent bg-accent/10"
                              : "border-border"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
                            {variant.image ? (
                              <img
                                src={variant.image}
                                alt={variant.label ?? ""}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">📦</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {variant.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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

      {/* Lightbox - visualização em tela cheia das fotos */}
      {isLightboxOpen && displayImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-smooth"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          {displayImages.length > 1 && (
            <button
              type="button"
              className="absolute left-4 md:left-8 text-white/80 hover:text-white transition-smooth"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(
                  (selectedImageIndex - 1 + displayImages.length) % displayImages.length
                );
              }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          <img
            src={displayImages[selectedImageIndex] ?? displayImages[0]}
            alt={selectedVariant ? `${product.name} - ${selectedVariant.label}` : product.name}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {displayImages.length > 1 && (
            <button
              type="button"
              className="absolute right-4 md:right-8 text-white/80 hover:text-white transition-smooth"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((selectedImageIndex + 1) % displayImages.length);
              }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          {displayImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
