import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { Handshake } from 'lucide-react';

interface Partner { id: string; name: string; logo_url: string | null; website: string | null; }

export default function Parceiros() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('partners').select('*').order('display_order');
      setPartners(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <Layout>
      <PageHero title="Nossos Parceiros" subtitle="Empresas e profissionais que colaboram conosco" />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">{[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/2] bg-muted animate-pulse rounded-lg" />)}</div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {partners.map((p) => (
                <a key={p.id} href={p.website || '#'} target="_blank" rel="noopener noreferrer" className="aspect-[3/2] bg-card border border-border rounded-lg p-6 flex items-center justify-center hover:shadow-card transition-all">
                  {p.logo_url ? <img src={p.logo_url} alt={p.name} className="max-w-full max-h-full object-contain" /> : <span className="text-sm font-medium text-muted-foreground">{p.name}</span>}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Handshake className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Em breve</h3>
              <p className="text-muted-foreground">Nossos parceiros serão exibidos aqui.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
