import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb } from 'lucide-react';

interface Tip {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
}

export default function Dicas() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTips() {
      const { data } = await supabase.from('tips').select('*').order('created_at', { ascending: false });
      setTips(data || []);
      setLoading(false);
    }
    fetchTips();
  }, []);

  return (
    <Layout>
      <PageHero title="Dicas de Comunicação" subtitle="Conteúdos para melhorar sua comunicação corporativa" />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[...Array(4)].map((_, i) => <div key={i} className="bg-muted animate-pulse rounded-lg h-60" />)}</div>
          ) : tips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tips.map((tip) => (
                <Card key={tip.id} className="bg-card border-border hover:shadow-card transition-all">
                  {tip.image_url && <img src={tip.image_url} alt={tip.title} className="w-full aspect-video object-cover rounded-t-lg" />}
                  <CardHeader><CardTitle className="font-display">{tip.title}</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground">{tip.content}</p></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Em breve</h3>
              <p className="text-muted-foreground">Nossas dicas serão exibidas aqui.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
