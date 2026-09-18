import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, User } from "lucide-react";

export default function OrderSuccess() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("order");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Pedido realizado com sucesso!
          </h1>
          <p className="text-muted-foreground mb-1">
            Seu pagamento foi aprovado e seu pedido já está sendo preparado.
          </p>
          {orderNumber && (
            <p className="text-sm text-muted-foreground mb-6">
              Número do pedido: <span className="font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}

          <div className="flex flex-col gap-3 mt-8">
            <Button className="w-full gap-2" onClick={() => navigate("/profile")}>
              <Package className="w-4 h-4" />
              Ver Meus Pedidos
            </Button>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
