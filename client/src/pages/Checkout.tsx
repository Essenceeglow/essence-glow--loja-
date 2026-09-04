import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Truck, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { CartItem } from "@/App";

const CART_STORAGE_KEY = "essence-glow-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"address" | "review">("address");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems] = useState<CartItem[]>(loadCart);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
  });

  const createAddress = trpc.addresses.create.useMutation();
  const createOrder = trpc.orders.create.useMutation();
  const createPreference = trpc.payments.createPreference.useMutation();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (!formData.fullName || !formData.cep || !formData.street || !formData.number || !formData.city || !formData.state) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    setStep("review");
  };

  const handleFinish = async () => {
    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Salva o endereço de entrega
      const addressResult = await createAddress.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        city: formData.city,
        state: formData.state,
        isDefault: true,
      });

      // 2. Cria o pedido (fica como "pending" até o pagamento ser confirmado)
      const orderResult = await createOrder.mutateAsync({
        addressId: addressResult.id,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variantId,
        })),
        totalAmount: total,
        shippingCost: shipping,
        paymentMethod: "mercadopago",
      });

      // 3. Gera o link de pagamento do Mercado Pago
      const preference = await createPreference.mutateAsync({
        orderId: orderResult.orderId,
      });

      // 4. Esvazia o carrinho e leva o cliente para o pagamento
      localStorage.removeItem(CART_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("clearCart"));

      window.location.href = preference.checkoutUrl;
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível finalizar o pedido. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm px-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Seu carrinho está vazio
            </h1>
            <p className="text-muted-foreground mb-6">
              Adicione produtos ao carrinho antes de finalizar a compra.
            </p>
            <Button onClick={() => navigate("/catalog")}>Explorar Catálogo</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete sua compra em poucos passos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Steps */}
              <div className="mb-8 flex gap-4">
                {["address", "review"].map((s, idx) => (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-smooth ${
                        step === s
                          ? "bg-accent text-white"
                          : ["address", "review"].indexOf(step) > idx
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < 1 && <div className="w-8 h-1 bg-border" />}
                  </div>
                ))}
              </div>

              {/* Address Step */}
              {step === "address" && (
                <Card className="p-8 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Endereço de Entrega
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Nome Completo *
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleAddressChange}
                        placeholder="Seu nome"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Telefone
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleAddressChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        CEP *
                      </label>
                      <Input
                        name="cep"
                        value={formData.cep}
                        onChange={handleAddressChange}
                        placeholder="00000-000"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Rua *
                        </label>
                        <Input
                          name="street"
                          value={formData.street}
                          onChange={handleAddressChange}
                          placeholder="Nome da rua"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Número *
                        </label>
                        <Input
                          name="number"
                          value={formData.number}
                          onChange={handleAddressChange}
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-foreground mb-2 block">
                        Complemento
                      </label>
                      <Input
                        name="complement"
                        value={formData.complement}
                        onChange={handleAddressChange}
                        placeholder="Apto, bloco, referência..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Cidade *
                        </label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleAddressChange}
                          placeholder="Sua cidade"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Estado *
                        </label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleAddressChange}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Review Step */}
              {step === "review" && (
                <Card className="p-8 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Revisar Pedido
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Endereço de Entrega</h3>
                      <p className="text-muted-foreground text-sm">
                        {formData.fullName}
                        <br />
                        {formData.street}, {formData.number}
                        {formData.complement && ` - ${formData.complement}`}
                        <br />
                        {formData.city}, {formData.state} - {formData.cep}
                      </p>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold text-foreground mb-3">Pagamento</h3>
                      <p className="text-muted-foreground text-sm">
                        No próximo passo você será redirecionado para o Mercado Pago, onde pode
                        pagar com Pix, cartão de crédito ou boleto, com total segurança.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {step === "review" && (
                  <Button
                    variant="outline"
                    onClick={() => setStep("address")}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  className="flex-1 gap-2"
                  onClick={step === "address" ? handleContinue : handleFinish}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {step === "review"
                    ? isSubmitting
                      ? "Redirecionando para pagamento..."
                      : "Ir para Pagamento"
                    : "Próximo"}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-24">
                <h3 className="font-serif text-xl font-bold text-foreground mb-6">
                  Resumo do Pedido
                </h3>

                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {item.image?.startsWith("http") || item.image?.startsWith("/") ? (
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-lg">{item.image || "🛍️"}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity}x R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-semibold">
                      {shipping === 0 ? "Grátis" : `R$ ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                    <span>Total</span>
                    <span className="text-accent">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                    <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-700">
                      Frete grátis em compras acima de R$ 100
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
