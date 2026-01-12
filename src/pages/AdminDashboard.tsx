import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/AdminLayout';
import { 
  Newspaper, 
  Users, 
  Scissors, 
  Lightbulb, 
  Handshake, 
  Mail, 
  Settings
} from 'lucide-react';

const adminSections = [
  { title: 'Press Releases', icon: Newspaper, href: '/admin/press-releases', desc: 'Gerenciar comunicados', color: 'bg-blue-500/10 text-blue-500' },
  { title: 'Clientes', icon: Users, href: '/admin/clientes', desc: 'Gerenciar logos de clientes', color: 'bg-green-500/10 text-green-500' },
  { title: 'Clipping', icon: Scissors, href: '/admin/clipping', desc: 'Gerenciar publicações na mídia', color: 'bg-purple-500/10 text-purple-500' },
  { title: 'Dicas', icon: Lightbulb, href: '/admin/dicas', desc: 'Gerenciar dicas de comunicação', color: 'bg-yellow-500/10 text-yellow-500' },
  { title: 'Parceiros', icon: Handshake, href: '/admin/parceiros', desc: 'Gerenciar parceiros', color: 'bg-pink-500/10 text-pink-500' },
  { title: 'Mensagens', icon: Mail, href: '/admin/mensagens', desc: 'Ver mensagens de contato', color: 'bg-red-500/10 text-red-500' },
  { title: 'Configurações', icon: Settings, href: '/admin/config', desc: 'Conteúdo do site', color: 'bg-gray-500/10 text-gray-500' },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Painel Administrativo">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adminSections.map((s) => (
          <Link key={s.href} to={s.href}>
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{s.title}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{s.desc}</p>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
