import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-pink-300" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Beauty & Fashion
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Beleza e moda íntima feminina com elegância e sofisticação.
            </p>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categorias</h4>
            <ul className="space-y-2">
              {["Maquiagem", "Skincare", "Pijamas", "Lingerie"].map((cat) => (
                <li key={cat}>
                  <Link href={`/catalog?category=${cat.toLowerCase()}`}>
                    <a className="text-sm text-muted-foreground hover:text-accent transition-smooth">
                      {cat}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Atendimento</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:contato@beautyandashion.com" className="hover:text-accent transition-smooth">contato@beautyandashion.com</a></li>
              <li><a href="tel:+5511999999999" className="hover:text-accent transition-smooth">(11) 99999-9999</a></li>
              <li className="pt-2">Segunda a Sexta: 9h às 18h</li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              {["Instagram", "TikTok", "Pinterest"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-accent hover:text-white flex items-center justify-center transition-smooth text-sm font-medium"
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; {currentYear} Beauty & Fashion. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-accent transition-smooth">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-accent transition-smooth">
                Termos de Serviço
              </a>
              <a href="#" className="hover:text-accent transition-smooth">
                Trocas e Devoluções
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
