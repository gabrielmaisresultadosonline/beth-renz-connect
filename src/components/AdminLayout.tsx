import { ReactNode, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
  Briefcase
} from 'lucide-react';
import { useState } from 'react';
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
  { title: 'Configurações', icon: Settings, href: '/admin/config' },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Wait for auth to finish loading
      if (loading) return;

      if (!user) {
        setAdminVerified(false);
        navigate('/admin');
        return;
      }

      setAdminVerified(null);

      // Server-side verification using RPC
      const { data: isAdminVerified, error } = await supabase.rpc('is_current_user_admin');

      if (error || !isAdminVerified) {
        console.error('Admin verification failed:', error);
        setAdminVerified(false);
        navigate('/admin');
        return;
      }

      setAdminVerified(true);
    };

    verifyAdminAccess();
  }, [user, loading, navigate]);

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
    </div>
  );
}
