import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Looks() {
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.looks.getFlavors.useQuery();

  const product = data?.product ?? null;
  const variants = data?.variants ?? [];

  const handleAddToCart = (variant: (typeof variants)[number]) => {
    if (!product) return;
    window.dispatchEvent(new CustomEvent('addToCart', {
      detail: {
        id: product.id,
        name: variant.label,
        price: parseFloat(product.price as any),
        quantity: 1,
        image: variant.images && variant.images.length > 0 ? variant.images[0] : "📦",
        variantId: variant.id,
        color: variant.label,
      }
    }));
    toast.success(`${variant.label} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Compre o Look
            </h1>
            <p className="text-lg text-muted-foreground">
              {product
                ? `Escolha seu sabor favorito de ${product.name}`
                : "Escolha seu sabor favorito"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">
                Nenhum combo disponível no momento. Volte em breve!
              </p>
              <Button onClick={() => navigate("/catalog")}>Ver Catálogo</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {variants.map((variant) => (
                <Card key={variant.id} className="overflow-hidden hover:shadow-soft transition-smooth flex flex-col">
                  <Link href={`/product/${product?.id}`}>
                    <div className="bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center overflow-hidden p-4 cursor-pointer">
                      {variant.images && variant.images.length > 0 ? (
                        <img
                          src={variant.images[0]}
                          alt={variant.label ?? ""}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-5xl">📦</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <h3 className="font-serif font-bold text-foreground mb-2">
                      {variant.label}
                    </h3>
                    {product && (
                      <p className="text-lg font-bold text-accent mb-4">
                        R$ {parseFloat(product.price as any).toFixed(2)}
                      </p>
                    )}
                    <Button className="w-full gap-2" onClick={() => handleAddToCart(variant)}>
                      <ShoppingBag className="w-4 h-4" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
