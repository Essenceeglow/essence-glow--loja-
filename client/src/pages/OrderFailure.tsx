import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function OrderFailure() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("order");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md p-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-9 h-9 text-red-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Não foi possível concluir o pagamento
          </h1>
          <p className="text-muted-foreground mb-1">
            Seu pedido não foi finalizado. Nenhum valor foi cobrado.
          </p>
          {orderNumber && (
            <p className="text-sm text-muted-foreground mb-6">
              Número do pedido: <span className="font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}

          <div className="flex flex-col gap-3 mt-8">
            <Button className="w-full" onClick={() => navigate("/checkout")}>
              Tentar Novamente
            </Button>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">
                Voltar ao Catálogo
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
