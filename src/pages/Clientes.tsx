import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
                <div key={i} className="aspect-[3/2] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : clients.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {clients.map((client, index) => (
                <AnimatedSection key={client.id} delay={index * 0.05}>
                  <motion.a
                    href={client.website || '#'}
                    target={client.website ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    whileHover={{ y: -8, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="group block aspect-[3/2] bg-card border border-border rounded-xl p-6 flex items-center justify-center hover:shadow-card hover:border-primary/30 transition-all duration-300 shine"
                  >
                    {client.logo_url ? (
                      <img
                        src={client.logo_url}
                        alt={client.name}
                        className="max-w-full max-h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    ) : (
                      <div className="text-center">
                        <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          {client.name}
                        </span>
                      </div>
                    )}
                  </motion.a>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <AnimatedSection className="text-center py-20">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
              >
                <Building2 className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">
                Em breve
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Nossos clientes serão exibidos aqui em breve.
              </p>
            </AnimatedSection>
          )}
        </div>
      </section>
    </Layout>
  );
}
