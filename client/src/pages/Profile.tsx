import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, MapPin, ShoppingBag, LogOut, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  // Mock data
  const orders = [
    {
      id: "PED-001",
      date: "2026-07-05",
      total: 219.80,
      status: "Entregue",
      items: ["Sérum Facial Colágeno", "Sérum Corporal Retinol"],
    },
    {
      id: "PED-002",
      date: "2026-06-28",
      total: 89.90,
      status: "Em Trânsito",
      items: ["Máscara Facial Hidratante"],
    },
  ];

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
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent">
                              R$ {order.total.toFixed(2)}
                            </p>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                order.status === "Entregue"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="mb-4 pb-4 border-t border-border pt-4">
                          <p className="text-sm text-muted-foreground mb-2">Itens:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-muted text-foreground px-3 py-1 rounded"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </Card>
                    ))}
                  </div>
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
