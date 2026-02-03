import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { RichContentRenderer } from '@/components/RichContentRenderer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Share2, Facebook, Linkedin, Twitter, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Tip {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  slug: string | null;
}

export default function DicaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedTips, setRelatedTips] = useState<Tip[]>([]);

  useEffect(() => {
    const fetchTip = async () => {
      if (!slug) return;

      // Try to find by slug first, then by id (backwards compatibility)
      let { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      // If not found by slug, try by id
      if (error || !data) {
        const idResult = await supabase
          .from('tips')
          .select('*')
          .eq('id', slug)
          .eq('published', true)
          .single();
        
        data = idResult.data;
        error = idResult.error;
      }

      if (error || !data) {
        navigate('/dicas');
        return;
      }

      setTip(data);

      // Fetch related tips
      const { data: related } = await supabase
        .from('tips')
        .select('id, title, image_url, created_at, slug')
        .eq('published', true)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (related) {
        setRelatedTips(related as Tip[]);
      }

      setLoading(false);
    };

    fetchTip();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const text = tip?.title || '';
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!tip) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Dica não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="min-h-screen bg-background">
        {/* Hero Image */}
        {tip.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden"
          >
            <img
              src={tip.image_url}
              alt={tip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </motion.div>
        )}

        {/* Content */}
        <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </motion.div>

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(tip.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              DICA DE COMUNICAÇÃO
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-6"
          >
            {tip.title}
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="h-px bg-border mb-8 origin-left"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RichContentRenderer content={tip.content} className="mb-12" />
          </motion.div>

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-t border-b border-border py-6 mb-12"
          >
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Share2 className="h-4 w-4" />
                Compartilhar:
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="gap-2"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Related tips */}
          {relatedTips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-display font-bold text-foreground mb-6">
                Outras Dicas
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedTips.map((related) => (
                  <Link
                    key={related.id}
                    to={`/dicas/${related.slug || related.id}`}
                    className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {related.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={related.image_url}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(related.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Back to all */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-12"
          >
            <Link to="/dicas">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Ver todas as Dicas
              </Button>
            </Link>
          </motion.div>
        </div>
      </article>
    </Layout>
  );
}
