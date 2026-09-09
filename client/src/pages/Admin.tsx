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
import { Trash2, Plus, Edit2, Upload, X, Star, Loader2, GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadProductImage } from "@/lib/uploadImage";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Uma linha da tabela de produtos que pode ser arrastada pra cima/baixo
// pra reordenar (segura no ícone de "grip" e arrasta).
function SortableProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-accent touch-none"
          title="Segurar e arrastar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      <TableCell>{product.categoryId}</TableCell>
      <TableCell>R$ {product.price}</TableCell>
      <TableCell className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(product)}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

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
    featured: false,
  });

  // Avaliações
  const [reviews, setReviews] = useState<Array<{ author: string; rating: number; comment: string }>>([]);
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, comment: "" });

  // Bundles ("Compre o Look")
  const [bundleForm, setBundleForm] = useState({
    name: "",
    description: "",
    bundlePrice: "",
    image: "",
  });
  const [selectedBundleProducts, setSelectedBundleProducts] = useState<number[]>([]);

  // Variações (produtos vinculados entre si)
  // Variantes (cor/sabor/nome dentro de um mesmo produto)
  const [variantProductId, setVariantProductId] = useState<string>("");
  const [variantForm, setVariantForm] = useState({ label: "", image1: "", image2: "", stock: "" });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingVariantSlot, setUploadingVariantSlot] = useState<1 | 2 | null>(null);
  const [isUploadingBundleImage, setIsUploadingBundleImage] = useState(false);

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
        featured: false,
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

  const reorderProducts = trpc.products.adminReorder.useMutation({
    onSuccess: () => {
      allProducts.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao reordenar: ${error.message}`);
    },
  });

  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !allProducts.data) return;

    const ids = allProducts.data.map((p) => p.id);
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderProducts.mutate({ orderedIds: reordered });
  };

  const productVariantsQuery = trpc.products.getVariants.useQuery(
    { productId: parseInt(variantProductId) },
    { enabled: !!variantProductId }
  );

  const createVariant = trpc.products.adminCreateVariant.useMutation({
    onSuccess: () => {
      toast.success("Variante adicionada!");
      productVariantsQuery.refetch();
      setVariantForm({ label: "", image1: "", image2: "", stock: "" });
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar variante: ${error.message}`);
    },
  });

  const deleteVariant = trpc.products.adminDeleteVariant.useMutation({
    onSuccess: () => {
      toast.success("Variante removida!");
      productVariantsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao remover variante: ${error.message}`);
    },
  });

  const allBundles = trpc.bundles.adminGetAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const createBundle = trpc.bundles.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Bundle criado com sucesso!");
      allBundles.refetch();
      setBundleForm({ name: "", description: "", bundlePrice: "", image: "" });
      setSelectedBundleProducts([]);
    },
    onError: (error) => {
      toast.error(`Erro ao criar bundle: ${error.message}`);
    },
  });

  const deleteBundle = trpc.bundles.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Bundle deletado com sucesso!");
      allBundles.refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar bundle: ${error.message}`);
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
      featured: formData.featured ? 1 : 0,
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
      featured: formData.featured ? 1 : 0,
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
      featured: product.featured === 1,
    });
    setProductImages(product.images || []);
  };

  const handleVariantImageUpload = async (slot: 1 | 2, file: File) => {
    setUploadingVariantSlot(slot);
    try {
      const url = await uploadProductImage(file);
      setVariantForm((prev) => ({ ...prev, [`image${slot}`]: url }));
      toast.success("Imagem enviada");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar imagem");
    } finally {
      setUploadingVariantSlot(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        setProductImages((prev) => [...prev, url]);
        toast.success(`Imagem "${file.name}" enviada`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar imagem");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
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

  const toggleBundleProduct = (productId: number) => {
    setSelectedBundleProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCreateBundle = () => {
    if (!bundleForm.name || !bundleForm.bundlePrice) {
      toast.error("Preencha nome e preço do bundle");
      return;
    }
    if (selectedBundleProducts.length === 0) {
      toast.error("Selecione ao menos um produto para o bundle");
      return;
    }
    createBundle.mutate({
      ...bundleForm,
      productIds: selectedBundleProducts.map((productId) => ({ productId, quantity: 1 })),
    });
  };

  const handleCreateVariant = () => {
    if (!variantProductId) {
      toast.error("Selecione o produto primeiro");
      return;
    }
    if (!variantForm.label) {
      toast.error("Dê um nome para a variante (ex: Morango, Vermelho)");
      return;
    }
    createVariant.mutate({
      productId: parseInt(variantProductId),
      label: variantForm.label,
      images: [variantForm.image1, variantForm.image2].filter((url) => url.trim() !== ""),
      stock: variantForm.stock ? parseInt(variantForm.stock) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-rose-50 to-mint-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-purple mb-8">Painel de Administração</h1>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="variations">Variações</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
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

                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Mostrar na Home (Produtos em Destaque)
                  </span>
                </label>

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
                        <label className={`cursor-pointer flex items-center gap-2 text-rose-pink hover:text-rose-pink/80 ${isUploadingImage ? "opacity-50 pointer-events-none" : ""}`}>
                          {isUploadingImage ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                          <span>{isUploadingImage ? "Enviando..." : "Clique para adicionar imagens"}</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingImage}
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
                                className="w-full h-20 object-contain rounded bg-muted"
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
                          featured: false,
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
                <p className="text-xs text-muted-foreground">
                  Segure o ícone <GripVertical className="w-3 h-3 inline" /> e arraste para reordenar.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <DndContext
                    sensors={dragSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <SortableContext
                          items={allProducts.data?.map((p) => p.id) ?? []}
                          strategy={verticalListSortingStrategy}
                        >
                          {allProducts.data?.map((product) => (
                            <SortableProductRow
                              key={product.id}
                              product={product}
                              onEdit={handleSelectProduct}
                              onDelete={(id) => deleteProduct.mutate({ id })}
                            />
                          ))}
                        </SortableContext>
                      </TableBody>
                    </Table>
                  </DndContext>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Variações (produtos vinculados: mesma coisa em cor/sabor/nome diferente) */}
          <TabsContent value="variations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Variante a um Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Escolha um produto e adicione as opções dele (ex: cores ou sabores diferentes,
                  cada uma com sua própria foto). Na página do produto, o cliente escolhe a opção
                  antes de colocar no carrinho — a foto muda na hora, na mesma página.
                </p>
                <div>
                  <Label>Produto</Label>
                  <Select value={variantProductId} onValueChange={setVariantProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.data?.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {variantProductId && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Opção *</Label>
                        <Input
                          value={variantForm.label}
                          onChange={(e) => setVariantForm({ ...variantForm, label: e.target.value })}
                          placeholder="Ex: Morango, Vermelho"
                        />
                      </div>
                      <div>
                        <Label>Estoque</Label>
                        <Input
                          type="number"
                          value={variantForm.stock}
                          onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Foto 1</Label>
                        <div className="border-2 border-dashed border-rose-pink/30 rounded-lg p-3">
                          {variantForm.image1 ? (
                            <div className="relative">
                              <img
                                src={variantForm.image1}
                                alt="Foto 1"
                                className="w-full h-24 object-contain bg-muted rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setVariantForm({ ...variantForm, image1: "" })}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className={`cursor-pointer flex flex-col items-center gap-1 text-rose-pink hover:text-rose-pink/80 py-3 ${uploadingVariantSlot === 1 ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingVariantSlot === 1 ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                              <span className="text-xs">Escolher arquivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingVariantSlot === 1}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantImageUpload(1, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Foto 2</Label>
                        <div className="border-2 border-dashed border-rose-pink/30 rounded-lg p-3">
                          {variantForm.image2 ? (
                            <div className="relative">
                              <img
                                src={variantForm.image2}
                                alt="Foto 2"
                                className="w-full h-24 object-contain bg-muted rounded"
                              />
                              <button
                                type="button"
                                onClick={() => setVariantForm({ ...variantForm, image2: "" })}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className={`cursor-pointer flex flex-col items-center gap-1 text-rose-pink hover:text-rose-pink/80 py-3 ${uploadingVariantSlot === 2 ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingVariantSlot === 2 ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                              <span className="text-xs">Escolher arquivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingVariantSlot === 2}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantImageUpload(2, file);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateVariant}
                  disabled={createVariant.isPending || !variantProductId}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createVariant.isPending ? "Adicionando..." : "Adicionar Variante"}
                </Button>
              </CardContent>
            </Card>

            {variantProductId && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Variantes deste Produto ({productVariantsQuery.data?.length ?? 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!productVariantsQuery.data || productVariantsQuery.data.length === 0 ? (
                    <p className="text-muted-foreground">
                      Nenhuma variante cadastrada ainda para este produto.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {productVariantsQuery.data.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between border rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex items-center justify-center flex-shrink-0 p-0.5">
                              {variant.images && variant.images.length > 0 ? (
                                <img
                                  src={variant.images[0]}
                                  alt={variant.label ?? ""}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <span className="text-lg">📦</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{variant.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Estoque: {variant.stock ?? 0}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteVariant.mutate({ id: variant.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Bundles ("Compre o Look") */}
          <TabsContent value="bundles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Novo Bundle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Bundle *</Label>
                    <Input
                      value={bundleForm.name}
                      onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                      placeholder="Ex: Kit Rotina Noturna"
                    />
                  </div>
                  <div>
                    <Label>Preço do Bundle (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bundleForm.bundlePrice}
                      onChange={(e) => setBundleForm({ ...bundleForm, bundlePrice: e.target.value })}
                      placeholder="149.90"
                    />
                  </div>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={bundleForm.description}
                    onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                    placeholder="Descreva o combo de produtos"
                  />
                </div>
                <div>
                  <Label>Imagem do Bundle</Label>
                  <div className="border-2 border-dashed border-rose-pink/30 rounded-lg p-3">
                    {bundleForm.image ? (
                      <div className="relative">
                        <img
                          src={bundleForm.image}
                          alt="Bundle"
                          className="w-full h-32 object-contain bg-muted rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setBundleForm({ ...bundleForm, image: "" })}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className={`cursor-pointer flex flex-col items-center gap-1 text-rose-pink hover:text-rose-pink/80 py-3 ${isUploadingBundleImage ? "opacity-50 pointer-events-none" : ""}`}>
                        {isUploadingBundleImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        <span className="text-xs">Escolher arquivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingBundleImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploadingBundleImage(true);
                            try {
                              const url = await uploadProductImage(file);
                              setBundleForm((prev) => ({ ...prev, image: url }));
                              toast.success("Imagem enviada");
                            } catch (error: any) {
                              toast.error(error?.message || "Erro ao enviar imagem");
                            } finally {
                              setIsUploadingBundleImage(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Produtos que fazem parte do bundle *</Label>
                  {allProducts.data && allProducts.data.length > 0 ? (
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                      {allProducts.data.map((product) => (
                        <label
                          key={product.id}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer border text-sm ${
                            selectedBundleProducts.includes(product.id)
                              ? "border-accent bg-accent/10"
                              : "border-transparent hover:bg-muted"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedBundleProducts.includes(product.id)}
                            onChange={() => toggleBundleProduct(product.id)}
                            className="accent-accent"
                          />
                          {product.name} — R$ {parseFloat(product.price as any).toFixed(2)}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      Cadastre produtos na aba "Produtos" antes de criar um bundle.
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCreateBundle}
                  disabled={createBundle.isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createBundle.isPending ? "Criando..." : "Criar Bundle"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bundles Cadastrados ({allBundles.data?.length ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!allBundles.data || allBundles.data.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum bundle cadastrado ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Produtos</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allBundles.data.map((bundle: any) => (
                          <TableRow key={bundle.id}>
                            <TableCell>{bundle.name}</TableCell>
                            <TableCell>R$ {parseFloat(bundle.bundlePrice).toFixed(2)}</TableCell>
                            <TableCell>{bundle.items?.length ?? 0} produto(s)</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBundle.mutate({ id: bundle.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
