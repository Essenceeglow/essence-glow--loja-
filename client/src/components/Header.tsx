import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Search, ShoppingBag, User, LogOut, X, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartCount = 0, onCartClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsSearchOpen(false);
      toast.success(`Buscando por: "${searchTerm}"`);
    } else {
      toast.error("Digite algo para buscar");
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      toast.info("Carrinho aberto");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-soft border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 font-serif text-xl font-bold text-foreground hover:text-accent transition-smooth">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-pink-300" />
            Essence & Glow
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/catalog">
            <a className="text-sm font-medium text-foreground hover:text-accent transition-smooth">
              Todos os Produtos
            </a>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-48"
              />
              <button
                type="submit"
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
                title="Buscar"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm("");
                }}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
                title="Fechar"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-muted rounded-lg transition-smooth hidden sm:flex"
              title="Abrir busca"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
          )}

          {/* Cart */}
          <button
            onClick={handleCartClick}
            className="relative p-2 hover:bg-muted rounded-lg transition-smooth"
            title="Carrinho"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link href="/admin">
                  <a className="p-2 hover:bg-muted rounded-lg transition-smooth" title="Painel de Admin">
                    <Settings className="w-5 h-5 text-accent" />
                  </a>
                </Link>
              )}
              <Link href="/profile">
                <a className="p-2 hover:bg-muted rounded-lg transition-smooth" title="Perfil">
                  <User className="w-5 h-5 text-foreground" />
                </a>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 hover:bg-muted rounded-lg transition-smooth"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-foreground" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => startLogin()}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Entrar
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="submit"
                    className="p-2 hover:bg-muted rounded-lg transition-smooth"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>

                <Link href="/catalog">
                  <a
                    onClick={() => setIsMenuOpen(false)}
                    className="text-sm font-medium text-foreground hover:text-accent transition-smooth"
                  >
                    Todos os Produtos
                  </a>
                </Link>
                <div className="border-t border-border pt-4">
                  {user ? (
                    <>
                      {user.role === 'admin' && (
                        <Link href="/admin">
                          <a
                            onClick={() => setIsMenuOpen(false)}
                            className="block text-sm font-medium text-accent hover:text-accent/80 transition-smooth mb-2"
                          >
                            ⚙️ Painel de Admin
                          </a>
                        </Link>
                      )}
                      <Link href="/profile">
                        <a
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-sm font-medium text-foreground hover:text-accent transition-smooth mb-2"
                        >
                          Meu Perfil
                        </a>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left text-sm font-medium text-foreground hover:text-accent transition-smooth"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        startLogin();
                        setIsMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Entrar
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
