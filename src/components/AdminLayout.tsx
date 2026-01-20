import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Newspaper, 
  Users, 
  Scissors, 
  Lightbulb, 
  Handshake, 
  Mail, 
  Settings, 
  LogOut, 
  Home,
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  Briefcase,
  Play,
  Send
} from 'lucide-react';
import logo from '@/assets/logo.png';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { title: 'Press Releases', icon: Newspaper, href: '/admin/press-releases' },
  { title: 'Clientes', icon: Users, href: '/admin/clientes' },
  { title: 'Clipping', icon: Scissors, href: '/admin/clipping' },
  { title: 'Dicas', icon: Lightbulb, href: '/admin/dicas' },
  { title: 'Parceiros', icon: Handshake, href: '/admin/parceiros' },
  { title: 'Quem Somos', icon: UserCircle, href: '/admin/equipe' },
  { title: 'Serviços', icon: Briefcase, href: '/admin/servicos' },
  { title: 'Mensagens', icon: Mail, href: '/admin/mensagens' },
  { title: 'Email', icon: Send, href: '/admin/email' },
  { title: 'Página Inicial', icon: Home, href: '/admin/homepage' },
  { title: 'Textos do Site', icon: Settings, href: '/admin/config' },
  { title: 'Config. Gerais', icon: Settings, href: '/admin/site-settings' },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Wait for auth to finish loading
      if (loading) {
        setAdminVerified(null);
        return;
      }

      if (!user) {
        setAdminVerified(false);
        navigate('/admin', { replace: true });
        return;
      }

      // First check from context (already verified in auth provider)
      if (isAdmin) {
        setAdminVerified(true);
        return;
      }

      // Double-check with server-side RPC verification
      try {
        const { data: isAdminResult, error } = await supabase.rpc('is_current_user_admin');

        if (error) {
          console.error('Admin verification error:', error);
          setAdminVerified(false);
          navigate('/admin', { replace: true });
          return;
        }

        if (isAdminResult) {
          setAdminVerified(true);
        } else {
          setAdminVerified(false);
          navigate('/admin', { replace: true });
        }
      } catch (err) {
        console.error('Admin verification failed:', err);
        setAdminVerified(false);
        navigate('/admin', { replace: true });
      }
    };

    verifyAdminAccess();
  }, [user, loading, isAdmin, navigate]);

  if (loading || adminVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || adminVerified === false) return null;


  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Beth Renz" className="h-10" />
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <Home className="h-5 w-5" />
              Ver Site
            </Link>
            <button 
              onClick={() => setTutorialOpen(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all w-full"
            >
              <Play className="h-5 w-5" />
              TUTORIAL
            </button>
            <button 
              onClick={() => { signOut(); navigate('/'); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-foreground truncate">
            {title}
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Tutorial Video Modal */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-4xl p-0 bg-black border-none">
          <div className="relative w-full aspect-video">
            <iframe
              src="https://www.youtube.com/embed/jUQvtu8HLrM?autoplay=1"
              title="Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
