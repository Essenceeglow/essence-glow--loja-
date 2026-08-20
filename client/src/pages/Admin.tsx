import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Trash2, Plus, Edit2, Upload, X, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "1",
  });

  // Avaliações
  const [reviews, setReviews] = useState<Array<{ author: string; rating: number; comment: string }>>([]);
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });

  const allProducts = trpc.products.adminGetAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createProduct = trpc.products.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      allProducts.refetch();
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        originalPrice: "",
        categoryId: "1",
      });
      setProductImages([]);
      setReviews([]);
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });

  const updateProduct = trpc.products.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      allProducts.refetch();
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });

  const deleteProduct = trpc.products.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado com sucesso!");
      allProducts.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar produto: ${error.message}`);
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateProduct = () => {
    if (!formData.name || !formData.slug || !formData.price) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createProduct.mutate({
      ...formData,
      categoryId: parseInt(formData.categoryId),
      images: productImages,
    });
  };

  const handleUpdateProduct = (id: number) => {
    if (!formData.name || !formData.price) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    updateProduct.mutate({
      id,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      originalPrice: formData.originalPrice,
      categoryId: parseInt(formData.categoryId),
      images: productImages,
    });
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      categoryId: product.categoryId.toString(),
    });
    setProductImages(product.images || []);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setProductImages([...productImages, event.target.result as string]);
            toast.success(`Imagem "${file.name}" adicionada`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Funções de Avaliações
  const handleAddReview = () => {
    if (!reviewForm.author || !reviewForm.comment) {
      toast.error("Preencha todos os campos da avaliação");
      return;
    }
    setReviews([...reviews, reviewForm]);
    setReviewForm({ author: "", rating: 5, comment: "" });
    toast.success("Avaliação adicionada!");
  };

  const handleRemoveReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
    toast.success("Avaliação removida!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-rose-50 to-mint-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-purple mb-8">Painel de Administração</h1>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          {/* Aba Produtos */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedProduct ? "Editar Produto" : "Criar Novo Produto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Blush Rosado"
                    />
                  </div>
                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="Ex: blush-rosado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Maquiagem</SelectItem>
                        <SelectItem value="2">Skincare</SelectItem>
                        <SelectItem value="3">Pijamas</SelectItem>
                        <SelectItem value="4">Lingerie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Preço *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Preço Original</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          originalPrice: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do produto..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Imagens do Produto</Label>
                  <div className="border-2 border-dashed border-rose-pink/30 rounded-lg p-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center">
                        <label className="cursor-pointer flex items-center gap-2 text-rose-pink hover:text-rose-pink/80">
                          <Upload className="w-5 h-5" />
                          <span>Clique para adicionar imagens</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                      {productImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {productImages.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={img}
                                alt={`Produto ${idx}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <button
                                onClick={() =>
                                  setProductImages(
                                    productImages.filter((_, i) => i !== idx)
                                  )
                                }
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Botão Criar Produto */}
            <div className="bg-gradient-to-r from-rose-pink/10 to-pink-200/10 border-2 border-rose-pink/30 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-rose-pink mb-1">✅ Formulário pronto!</p>
                <p className="text-xs text-gray-600">Clique no botão abaixo para lançar o produto na sua loja.</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={handleCreateProduct}
                  disabled={createProduct.isPending}
                  className="bg-rose-pink hover:bg-rose-pink/90 text-white font-bold py-3 px-6 text-base h-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  🚀 CRIAR PRODUTO
                </Button>
                {selectedProduct && (
                  <>
                    <Button
                      onClick={() => handleUpdateProduct(selectedProduct)}
                      disabled={updateProduct.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6"
                    >
                      Atualizar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(null);
                        setFormData({
                          name: "",
                          slug: "",
                          description: "",
                          price: "",
                          originalPrice: "",
                          categoryId: "1",
                        });
                        setProductImages([]);
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tabela de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Produtos ({allProducts.data?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProducts.data?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>{product.categoryId}</TableCell>
                          <TableCell>R$ {product.price}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectProduct(product)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                deleteProduct.mutate({ id: product.id })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Avaliações */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Avaliação de Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Cliente</Label>
                    <Input
                      value={reviewForm.author}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, author: e.target.value })
                      }
                      placeholder="Ex: Maria Silva"
                    />
                  </div>
                  <div>
                    <Label>Classificação (Estrelas)</Label>
                    <Select
                      value={reviewForm.rating.toString()}
                      onValueChange={(value) =>
                        setReviewForm({
                          ...reviewForm,
                          rating: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 ⭐</SelectItem>
                        <SelectItem value="2">2 ⭐⭐</SelectItem>
                        <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                        <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                        <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Comentário</Label>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    placeholder="O que o cliente achou do produto?"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleAddReview}
                  className="bg-rose-pink hover:bg-rose-pink/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Avaliação
                </Button>
              </CardContent>
            </Card>

            {/* Tabela de Avaliações */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações Adicionadas ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">Nenhuma avaliação adicionada ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="border border-rose-pink/20 rounded-lg p-4 bg-rose-50/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-slate-purple">
                              {review.author}
                            </p>
                            <p className="text-sm text-rose-pink">
                              {"⭐".repeat(review.rating)} ({review.rating}/5)
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveReview(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
