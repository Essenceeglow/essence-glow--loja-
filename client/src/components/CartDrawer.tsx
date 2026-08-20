import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus } from "lucide-react";
import { Link } from "wouter";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity?: (id: number, quantity: number) => void;
  onRemoveItem?: (id: number) => void;
}

export default function CartDrawer({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + (typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const total = subtotal + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Seu Carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">🛍️</div>
            <p className="text-center text-muted-foreground text-sm">
              Seu carrinho está vazio. Comece a explorar nossa coleção!
            </p>
            <Link href="/catalog" className="w-full">
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Continuar Comprando
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de Produtos */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0">
                  {/* Imagem */}
                  <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image?.startsWith("http") || item.image?.startsWith("/") || item.image?.startsWith("data:") ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{item.image || "🛍️"}</span>
                    )}
                  </div>

                  {/* Nome e Preço */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-bold text-accent">
                      R$ {typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 hover:bg-muted rounded transition-smooth"
                      title="Diminuir quantidade"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity?.(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-muted rounded transition-smooth"
                      title="Aumentar quantidade"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemoveItem?.(item.id)}
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-smooth"
                      title="Remover do carrinho"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo e Checkout */}
            <div className="space-y-3 pt-4 border-t border-border mt-4">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-semibold">
                    {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-accent text-base">R$ {total.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="block">
                <Button
                  className="w-full text-sm"
                  onClick={() => onOpenChange(false)}
                >
                  Ir para Checkout
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => onOpenChange(false)}
              >
                Continuar Comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
