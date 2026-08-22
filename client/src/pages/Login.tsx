import { useState } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail se for pedida confirmação.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login realizado!");
      }

      // Garante que o próximo request já tenha o token novo e recarrega o usuário.
      await utils.auth.me.invalidate();
      navigate("/");
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-sm p-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-1 text-center">
            {mode === "signin" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {mode === "signin"
              ? "Acesse sua conta da Essence & Glow"
              : "Leva menos de um minuto"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {mode === "signin" ? (
              <>
                Não tem conta?{" "}
                <button
                  type="button"
                  className="text-accent font-semibold hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  className="text-accent font-semibold hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
