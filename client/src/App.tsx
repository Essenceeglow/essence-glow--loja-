import { useState } from "react";
import * as React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

function Router() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Escutar eventos de adicionar ao carrinho
  React.useEffect(() => {
    const handleAddToCartEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const item = customEvent.detail as CartItem;
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.id === item.id && i.size === item.size && i.color === item.color
        );

        if (existingItem) {
          return prevItems.map((i) =>
            i === existingItem
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }

        return [...prevItems, item];
      });
      setIsCartOpen(true);
    };

    window.addEventListener('addToCart', handleAddToCartEvent);
    return () => window.removeEventListener('addToCart', handleAddToCartEvent);
  }, []);



  const handleRemoveFromCart = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header cartCount={cartItems.length} onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/profile" component={Profile} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/admin" component={Admin} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <Footer />

      <CartDrawer
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
