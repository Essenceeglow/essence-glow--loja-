import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Package } from "lucide-react";

export default function OrderPending() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("order");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-9 h-9 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Pagamento em análise
          </h1>
          <p className="text-muted-foreground mb-1">
            Recebemos seu pedido e estamos aguardando a confirmação do pagamento
            (isso é normal em pagamentos por boleto ou Pix).
          </p>
          {orderNumber && (
            <p className="text-sm text-muted-foreground mb-6">
              Número do pedido: <span className="font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}

          <div className="flex flex-col gap-3 mt-8">
            <Button className="w-full gap-2" onClick={() => navigate("/profile")}>
              <Package className="w-4 h-4" />
              Acompanhar Meus Pedidos
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
