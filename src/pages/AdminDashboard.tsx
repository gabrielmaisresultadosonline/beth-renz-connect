import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Users, Scissors, Lightbulb, Handshake, Mail, LogOut, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';

const adminSections = [
  { title: 'Press Releases', icon: Newspaper, href: '/admin/press-releases', desc: 'Gerenciar comunicados' },
  { title: 'Clientes', icon: Users, href: '/admin/clientes', desc: 'Gerenciar logos de clientes' },
  { title: 'Clipping', icon: Scissors, href: '/admin/clipping', desc: 'Gerenciar publicações' },
  { title: 'Dicas', icon: Lightbulb, href: '/admin/dicas', desc: 'Gerenciar dicas de comunicação' },
  { title: 'Parceiros', icon: Handshake, href: '/admin/parceiros', desc: 'Gerenciar parceiros' },
  { title: 'Mensagens', icon: Mail, href: '/admin/mensagens', desc: 'Ver mensagens de contato' },
  { title: 'Configurações', icon: Settings, href: '/admin/config', desc: 'Conteúdo do site' },
];

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/admin');
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <img src={logo} alt="Beth Renz" className="h-10" />
          <Button variant="ghost" onClick={() => { signOut(); navigate('/'); }}><LogOut className="h-4 w-4 mr-2" />Sair</Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Painel Administrativo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((s) => (
            <Card key={s.href} className="cursor-pointer hover:shadow-card transition-all" onClick={() => navigate(s.href)}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><s.icon className="h-6 w-6 text-primary" /></div>
                <div><CardTitle className="text-lg">{s.title}</CardTitle><p className="text-sm text-muted-foreground">{s.desc}</p></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
