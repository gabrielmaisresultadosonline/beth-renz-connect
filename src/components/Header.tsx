import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import defaultLogo from '@/assets/logo.png';

const navItems = [
  { label: 'Quem Somos', href: '/quem-somos' },
  { label: 'Nossas Soluções', href: '/solucoes' },
  { label: 'Quem Atendemos', href: '/clientes' },
  { label: 'Press Releases', href: '/press-releases' },
  { label: 'Clipping', href: '/clipping' },
  { label: 'Dicas de Comunicação', href: '/dicas' },
  { label: 'Parceiros', href: '/parceiros' },
  { label: 'Contato', href: '/contato' },
];

interface SiteSettings {
  logo_url?: string;
  favicon_url?: string;
  site_name?: string;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCta, setShowCta] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      // Fetch header_cta visibility
      const { data: ctaData } = await supabase
        .from('homepage_sections')
        .select('visible')
        .eq('section_key', 'header_cta')
        .maybeSingle();
      
      if (ctaData) {
        setShowCta(ctaData.visible ?? true);
      }

      // Fetch logo from site settings
      const { data: settingsData } = await supabase
        .from('site_content')
        .select('metadata')
        .eq('section', 'settings')
        .maybeSingle();

      if (settingsData?.metadata) {
        const settings = settingsData.metadata as SiteSettings;
        if (settings.logo_url) {
          setLogoUrl(settings.logo_url);
        }
      }
    }

    fetchSettings();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-background/98 backdrop-blur-xl shadow-lg border-b border-border' 
          : 'bg-background/90 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="relative group flex-shrink-0">
            <motion.img 
              src={logoUrl} 
              alt="Beth Renz" 
              className="h-14 w-auto transition-all duration-300 group-hover:scale-105"
              whileHover={{ scale: 1.05 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative px-2.5 py-2 text-xs font-medium transition-all duration-300 rounded-md group whitespace-nowrap ${
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-foreground/80 hover:text-primary'
                }`}
              >
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {item.label}
                </motion.span>
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                  location.pathname === item.href ? 'w-3/4' : 'w-0 group-hover:w-1/2'
                }`} />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          {showCta && (
            <div className="hidden xl:flex items-center gap-2">
              <Button asChild size="sm" className="text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0 px-3 py-1.5 h-auto whitespace-normal text-center leading-tight">
                <a href="https://slnegociosecia.com.br/" target="_blank" rel="noopener noreferrer">
                  <span className="block">Portal São Leopoldo</span>
                  <span className="block">Negócios & Cia</span>
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-xs font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1.5 h-auto">
                <Link to="/contato">Fale conosco</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="xl:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium transition-all duration-300 rounded-md ${
                        location.pathname === item.href
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                {showCta && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                    className="px-4 pt-4 space-y-3"
                  >
                    <Button asChild className="w-full font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0">
                      <a href="https://slnegociosecia.com.br/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)}>
                        Portal São Leopoldo Negócios & Cia
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Link to="/contato" onClick={() => setIsMenuOpen(false)}>
                        Fale conosco
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
