import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string;
  photo_url: string | null;
  display_order: number;
}

interface Collaborator {
  id: string;
  name: string;
  bio: string;
  photo_url: string | null;
  display_order: number;
}

interface SiteContent {
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
}

export default function QuemSomos() {
  const { data: intro } = useQuery({
    queryKey: ['site-content', 'quem_somos_intro'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'quem_somos_intro')
        .single();
      return data as SiteContent | null;
    },
  });

  const { data: clientesContent } = useQuery({
    queryKey: ['site-content', 'quem_somos_clientes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', 'quem_somos_clientes')
        .single();
      return data as SiteContent | null;
    },
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('active', true)
        .order('display_order');
      return data as TeamMember[];
    },
  });

  const { data: collaborators } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collaborators')
        .select('*')
        .eq('active', true)
        .order('display_order');
      return data as Collaborator[];
    },
  });

  return (
    <Layout>
      <PageHero 
        title="Quem Somos" 
        subtitle="Comunicação estratégica desde 1993" 
      />

      {/* Intro Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {intro?.subtitle || 'A SENHA Comunicação Integrada atua desde 1993 com foco em estratégias de comunicação para posicionar o cliente junto aos seus públicos-alvo, sejam externos quanto internos.'}
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {intro?.content || 'Acredita que a Comunicação faz parte de todos os processos de uma organização. Por isto, aprofunda o conhecimento sobre o negócio do cliente para ser capaz de introduzir a Comunicação no rol de estratégias que contribuirão para as metas corporativas.'}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Nossa Equipe
            </h2>
          </AnimatedSection>

          <div className="max-w-5xl mx-auto space-y-16">
            {teamMembers?.map((member, index) => (
              <AnimatedSection key={member.id} delay={index * 0.1}>
                <div className={`flex flex-col md:flex-row gap-8 items-start ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Photo */}
                  <motion.div 
                    className="w-48 h-48 flex-shrink-0 mx-auto md:mx-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    {member.photo_url ? (
                      <img 
                        src={member.photo_url} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Users className="w-16 h-16 text-primary/50" />
                      </div>
                    )}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold text-primary mb-2">
                      {member.name}
                    </h3>
                    {member.role && (
                      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
                        {member.role}
                      </p>
                    )}
                    <div className="text-muted-foreground space-y-3 whitespace-pre-line">
                      {member.bio.split('\n\n').map((paragraph, i) => {
                        // Convert specific text to links with visible URL
                        let processedText = paragraph;
                        
                        // Replace "São Leopoldo Negócios & Cia" with clickable link + visible URL
                        if (processedText.includes('São Leopoldo Negócios & Cia')) {
                          const parts = processedText.split(/(São Leopoldo Negócios & Cia)/);
                          return (
                            <p key={i}>
                              {parts.map((part, j) => 
                                part === 'São Leopoldo Negócios & Cia' ? (
                                  <span key={j}>
                                    <a 
                                      href="https://slnegociosecia.com.br/" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {part}
                                    </a>
                                    <span className="text-primary"> (</span>
                                    <a 
                                      href="https://slnegociosecia.com.br/" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      https://slnegociosecia.com.br/
                                    </a>
                                    <span className="text-primary">)</span>
                                  </span>
                                ) : (
                                  <span key={j}>{part}</span>
                                )
                              )}
                            </p>
                          );
                        }
                        
                        // Replace "Negócios & Cia" standalone with clickable link
                        if (processedText.includes('Negócios & Cia') && !processedText.includes('São Leopoldo Negócios & Cia')) {
                          const parts = processedText.split(/(Negócios & Cia)/);
                          return (
                            <p key={i}>
                              {parts.map((part, j) => 
                                part === 'Negócios & Cia' ? (
                                  <a 
                                    key={j}
                                    href="https://slnegociosecia.com.br/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {part}
                                  </a>
                                ) : (
                                  <span key={j}>{part}</span>
                                )
                              )}
                            </p>
                          );
                        }
                        
                        return <p key={i}>{processedText}</p>;
                      })}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Section */}
      {clientesContent && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <AnimatedSection>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  {clientesContent.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {clientesContent.content}
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* Collaborators Section */}
      {collaborators && collaborators.length > 0 && (
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Nossos Parceiros de Produção Audiovisual
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Também atuamos com parceiros para a produção audiovisual, que já fazem parte da nossa história:
              </p>
            </AnimatedSection>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {collaborators.map((collab, index) => (
                <AnimatedSection key={collab.id} delay={index * 0.1}>
                  <Card className="bg-card border-border h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-display font-bold text-primary mb-3">
                        {collab.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {collab.bio}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}