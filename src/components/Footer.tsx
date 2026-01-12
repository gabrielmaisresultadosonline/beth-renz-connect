import { Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src={logo} alt="Beth Renz" className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground">
              Assessoria de Imprensa e Relacionamento. Transformamos fatos empresariais em notícias de impacto.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/quem-somos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Quem Somos
              </Link>
              <Link to="/solucoes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Soluções
              </Link>
              <Link to="/press-releases" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Press Releases
              </Link>
              <Link to="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contato
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="mailto:imprensa@bethrenz.com.br"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                imprensa@bethrenz.com.br
              </a>
              <a
                href="tel:+5551981284627"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                (51) 98128-4627
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-accent hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Beth Renz - Imprensa & Relacionamento. Todos os direitos reservados.
          </p>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
