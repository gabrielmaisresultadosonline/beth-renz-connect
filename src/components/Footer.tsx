import { Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Instagram, Facebook, Youtube } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src={logo} alt="Beth Renz" className="h-12 w-auto brightness-0 invert" />
            <p className="text-sm text-background/70">
              Assessoria de Imprensa e Relacionamento. Transformamos fatos empresariais em notícias de impacto.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/quem-somos" className="text-sm text-background/70 hover:text-primary transition-colors">
                Quem Somos
              </Link>
              <Link to="/solucoes" className="text-sm text-background/70 hover:text-primary transition-colors">
                Nossas Soluções
              </Link>
              <Link to="/clientes" className="text-sm text-background/70 hover:text-primary transition-colors">
                Quem Atendemos
              </Link>
              <Link to="/press-releases" className="text-sm text-background/70 hover:text-primary transition-colors">
                Press Releases
              </Link>
              <Link to="/clipping" className="text-sm text-background/70 hover:text-primary transition-colors">
                Clipping
              </Link>
              <Link to="/dicas" className="text-sm text-background/70 hover:text-primary transition-colors">
                Dicas de Comunicação
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="mailto:imprensa@bethrenz.com.br"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                imprensa@bethrenz.com.br
              </a>
              <a
                href="tel:+5551981284627"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                (51) 98128-4627
              </a>
            </div>
          </div>

          {/* Social & Legal */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Redes Sociais</h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.linkedin.com/in/elizabethrenz/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/bethrenz/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/elizabeth.renz.3"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@BetheCiapodcast"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2">
              <Link to="#" className="block text-xs text-background/50 hover:text-background/70 transition-colors">
                Política de Privacidade
              </Link>
              <Link to="#" className="block text-xs text-background/50 hover:text-background/70 transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} Beth Renz - Imprensa & Relacionamento. Todos os direitos reservados.
          </p>
          <Link
            to="/admin"
            className="text-xs text-background/30 hover:text-background/50 transition-colors"
          >
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
