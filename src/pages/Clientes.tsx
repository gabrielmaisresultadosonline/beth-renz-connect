import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .order('display_order', { ascending: true });
      
      setClients(data || []);
      setLoading(false);
    }

    fetchClients();
  }, []);

  return (
    <Layout>
      <PageHero 
        title="Quem Atendemos" 
        subtitle="Empresas e instituições que confiam em nosso trabalho" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/2] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {clients.map((client) => (
                <a
                  key={client.id}
                  href={client.website || '#'}
                  target={client.website ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group aspect-[3/2] bg-card border border-border rounded-lg p-6 flex items-center justify-center hover:shadow-card hover:border-primary/30 transition-all duration-300"
                >
                  {client.logo_url ? (
                    <img
                      src={client.logo_url}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {client.name}
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Em breve
              </h3>
              <p className="text-muted-foreground">
                Nossos clientes serão exibidos aqui em breve.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
