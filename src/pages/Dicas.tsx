import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, ArrowRight } from 'lucide-react';

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
      const { data } = await supabase
        .from('tips')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      setTips(data || []);
      setLoading(false);
    }
    fetchTips();
  }, []);

  // Helper to get a preview snippet from content (strip ALL HTML and markdown)
  const getPreview = (content: string, maxLength = 120) => {
    let cleaned = content;
    
    // Remove ALL HTML tags with their attributes (including inline styles)
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    
    // Remove markdown images and videos
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)(\{width=\d+%\})?/g, '');
    cleaned = cleaned.replace(/\[video\]\(.*?\)/g, '');
    
    // Remove markdown headings
    cleaned = cleaned.replace(/#{1,6}\s/g, '');
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');
    cleaned = cleaned.replace(/~~/g, '');
    cleaned = cleaned.replace(/<\/?u>/g, '');
    
    // Remove markdown links but keep text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Clean up CSS/style remnants that might appear as text
    cleaned = cleaned.replace(/style="[^"]*"/gi, '');
    cleaned = cleaned.replace(/margin[^:]*:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/padding[^:]*:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/border[^:]*:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/font[^:]*:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/color:[^;]+;?/gi, '');
    cleaned = cleaned.replace(/background[^:]*:[^;]+;?/gi, '');
    
    // Clean HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    cleaned = cleaned.replace(/&quot;/g, '"');
    
    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
  };

  return (
    <Layout>
      <PageHero title="Dicas de Comunicação" subtitle="Conteúdos para melhorar sua comunicação corporativa" />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-80" />
              ))}
            </div>
          ) : tips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tips.map((tip) => (
                <Card key={tip.id} className="bg-card border-border hover:shadow-card transition-all overflow-hidden group">
                  {tip.image_url && (
                    <Link to={`/dicas/${tip.id}`}>
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={tip.image_url} 
                          alt={tip.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    </Link>
                  )}
                  <CardHeader>
                    <CardTitle className="font-display">
                      <Link to={`/dicas/${tip.id}`} className="hover:text-primary transition-colors">
                        {tip.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3">{getPreview(tip.content)}</p>
                    <Link to={`/dicas/${tip.id}`}>
                      <Button variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Ver mais
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
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
