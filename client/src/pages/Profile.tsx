import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, MapPin, ShoppingBag, LogOut, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando Pagamento",
  paid: "Pago",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  // Pedidos reais do cliente logado
  const { data: orders = [], isLoading: isLoadingOrders } = trpc.orders.list.useQuery();

  const addresses = [
    {
      id: 1,
      label: "Casa",
      street: "Rua das Flores",
      number: "123",
      city: "São Paulo",
      state: "SP",
      cep: "01234-567",
      isDefault: true,
    },
    {
      id: 2,
      label: "Trabalho",
      street: "Avenida Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
      cep: "01311-100",
      isDefault: false,
    },
  ];

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Desconectado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="container py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Minha Conta
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus dados, pedidos e endereços
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-pink-400 rounded-full flex items-center justify-center text-white text-2xl">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user?.name || "Usuário"}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2 mb-3"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
                    <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Endereços Salvos</p>
                    <p className="text-2xl font-bold text-foreground">{addresses.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile" className="gap-2">
                    <User className="w-4 h-4" />
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Pedidos
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereços
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-8">
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-serif font-bold text-foreground">
                        Informações Pessoais
                      </h2>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </Button>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Nome Completo
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">{formData.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-muted-foreground">{formData.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                          Telefone
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="(11) 99999-9999"
                          />
                        ) : (
                          <p className="text-muted-foreground">
                            {formData.phone || "Não informado"}
                          </p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-4 pt-4 border-t border-border">
                          <Button
                            onClick={handleSaveProfile}
                            className="flex-1"
                          >
                            Salvar Alterações
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-8">
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Você ainda não fez nenhum pedido.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <Card key={order.id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-accent">
                                R$ {parseFloat(order.totalAmount).toFixed(2)}
                              </p>
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  ORDER_STATUS_COLORS[order.status] ?? "bg-muted text-foreground"
                                }`}
                              >
                                {ORDER_STATUS_LABELS[order.status] ?? order.status}
                              </span>
                            </div>
                          </div>
                          <div className="mb-4 pb-4 border-t border-border pt-4">
                            <p className="text-sm text-muted-foreground mb-2">Itens:</p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-muted text-foreground px-3 py-1 rounded"
                                >
                                  {item.productName} {item.quantity > 1 ? `(${item.quantity}x)` : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                          {order.address && (
                            <div className="text-sm text-muted-foreground border-t border-border pt-4">
                              <p className="font-semibold text-foreground mb-1">Endereço de entrega</p>
                              <p>
                                {order.address.street}, {order.address.number}
                                {order.address.complement ? ` - ${order.address.complement}` : ""}
                                <br />
                                {order.address.city} - {order.address.state}, {order.address.cep}
                              </p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="mt-8">
                  <div className="space-y-4 mb-8">
                    {addresses.map((address) => (
                      <Card key={address.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">{address.label}</h3>
                                {address.isDefault && (
                                  <span className="text-xs bg-accent text-white px-2 py-1 rounded">
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.street}, {address.number}
                                <br />
                                {address.city}, {address.state} {address.cep}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button className="w-full gap-2">
                    <MapPin className="w-4 h-4" />
                    Adicionar Novo Endereço
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
