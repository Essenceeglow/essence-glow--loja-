import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Filter, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Catalog() {
  const searchParams = useSearch();
  const category = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    return params.get("category") || "";
  }, [searchParams]);
  
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Buscar produtos reais do banco de dados
  const { data: allProducts = [], isLoading } = trpc.products.getAll.useQuery();

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: any) => {
      const matchesCategory = !category || product.categoryId.toString() === category.toLowerCase() || 
        (category === "maquiagem" && product.categoryId === 1) ||
        (category === "skincare" && product.categoryId === 2);
      
      const price = parseFloat(product.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [allProducts, category, priceRange, searchTerm]);

  return (
    <>
      <main className="flex-1">
        <div className="container py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Catálogo de Produtos
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore nossa coleção completa de beleza
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filtros */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h2 className="text-lg font-bold">Filtros</h2>
                  <button onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="w-5 h-5" />
                  </button>
                </div>

                {(showFilters || window.innerWidth >= 1024) && (
                  <div className="space-y-6">
                    {/* Busca */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Buscar
                      </label>
                      <Input
                        placeholder="Nome do produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Faixa de Preço */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-4">
                        Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                      </label>
                      <Slider
                        min={0}
                        max={500}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                    </div>

                    {/* Limpar Filtros */}
                    {(searchTerm || priceRange[0] > 0 || priceRange[1] < 500) && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSearchTerm("");
                          setPriceRange([0, 500]);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Produtos */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: any) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="group cursor-pointer hover:shadow-soft transition-smooth overflow-hidden h-full flex flex-col">
                        <div className="bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform overflow-hidden p-3">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif font-bold text-foreground mb-2 group-hover:text-accent transition-smooth line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < Math.floor(parseFloat(product.rating || 0))
                                      ? "text-yellow-400"
                                      : "text-muted"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-accent">
                                R$ {parseFloat(product.price).toFixed(2)}
                              </span>
                              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  R$ {parseFloat(product.originalPrice).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
