import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Truck, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const [step, setStep] = useState<"address" | "payment" | "review">("address");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    city: "",
    state: "",
  });

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  // Mock cart items
  const cartItems = [
    { id: 1, name: "Blush em Stick", price: 89.90, quantity: 1, image: "🎨" },
    { id: 2, name: "Sérum Corporal", price: 129.90, quantity: 1, image: "✨" },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 15;
  const total = subtotal + shipping;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = () => {
    if (!formData.fullName || !formData.email || !formData.cep || !formData.street) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (step === "address") {
      setStep("payment");
    } else if (step === "payment") {
      if (!cardData.cardNumber || !cardData.cardName || !cardData.expiry || !cardData.cvc) {
        toast.error("Por favor, preencha os dados do cartão");
        return;
      }
      setStep("review");
    } else {
      toast.success("Pedido realizado com sucesso!");
      // Aqui seria chamado o tRPC para criar o pedido
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete sua compra em poucos passos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Steps */}
              <div className="mb-12">
                <div className="flex gap-4 mb-8">
                  {["address", "payment", "review"].map((s, idx) => (
                    <div key={s} className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-smooth ${
                          step === s
                            ? "bg-accent text-white"
                            : ["address", "payment", "review"].indexOf(step) > idx
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {idx < 2 && <div className="w-8 h-1 bg-border" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Step */}
              {step === "address" && (
                <Card className="p-8 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Endereço de Entrega
                  </h2>

                  <div className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          Email *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleAddressChange}
                          placeholder="seu@email.com"
                        />
                      </div>
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

                    {/* Address */}
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
                        placeholder="Apto, sala, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Cidade *
                        </label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleAddressChange}
                          placeholder="São Paulo"
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

              {/* Payment Step */}
              {step === "payment" && (
                <Card className="p-8 mb-8">
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                    Método de Pagamento
                  </h2>

                  <Tabs defaultValue="card" className="mb-8">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card" className="gap-2">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Crédito
                      </TabsTrigger>
                      <TabsTrigger value="pix" className="gap-2">
                        Pix
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="card" className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Número do Cartão
                        </label>
                        <Input
                          name="cardNumber"
                          value={cardData.cardNumber}
                          onChange={handleCardChange}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Nome no Cartão
                        </label>
                        <Input
                          name="cardName"
                          value={cardData.cardName}
                          onChange={handleCardChange}
                          placeholder="NOME SOBRENOME"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">
                            Validade
                          </label>
                          <Input
                            name="expiry"
                            value={cardData.expiry}
                            onChange={handleCardChange}
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-foreground mb-2 block">
                            CVC
                          </label>
                          <Input
                            name="cvc"
                            value={cardData.cvc}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength={3}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700">
                          Seus dados de pagamento são criptografados e seguros. Processado via Stripe.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="pix" className="py-8">
                      <p className="text-muted-foreground text-center">
                        Pix será disponibilizado em breve. Por enquanto, use cartão de crédito.
                      </p>
                    </TabsContent>
                  </Tabs>
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
                        {formData.street}, {formData.number}
                        {formData.complement && ` - ${formData.complement}`}
                        <br />
                        {formData.city}, {formData.state} {formData.cep}
                      </p>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold text-foreground mb-3">Método de Pagamento</h3>
                      <p className="text-muted-foreground text-sm">
                        Cartão terminado em {cardData.cardNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {step !== "address" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (step === "payment") setStep("address");
                      else if (step === "review") setStep("payment");
                    }}
                  >
                    Voltar
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={handleSubmitOrder}
                >
                  {step === "review" ? "Confirmar Pedido" : "Próximo"}
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
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-lg flex-shrink-0">
                        {item.image}
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
                    <span className="font-semibold">R$ {shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                    <span>Total</span>
                    <span className="text-accent">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">
                    Frete grátis em compras acima de R$ 100
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
