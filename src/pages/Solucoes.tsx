import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, AlertTriangle, TrendingUp, Share2, Mic, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

const solutions = [
  {
    icon: Newspaper,
    title: 'Assessoria de Imprensa',
    description: 'Produção de textos jornalísticos profissionais e relacionamento estratégico com veículos de comunicação.',
    features: ['Produção de press releases', 'Relacionamento com jornalistas', 'Agendamento de entrevistas', 'Clipping de notícias'],
  },
  {
    icon: AlertTriangle,
    title: 'Gestão de Crise',
    description: 'Suporte especializado em momentos delicados, protegendo a imagem e reputação da sua empresa.',
    features: ['Comunicados oficiais', 'Posicionamento de porta-vozes', 'Monitoramento de mídia', 'Recuperação de imagem'],
  },
  {
    icon: TrendingUp,
    title: 'Apoio ao Marketing',
    description: 'Integração entre assessoria de imprensa e marketing para potencializar campanhas.',
    features: ['Divulgação de lançamentos', 'Cobertura de eventos', 'Ações promocionais', 'Integração com publicidade'],
  },
  {
    icon: Share2,
    title: 'Mídias Digitais',
    description: 'Amplificação do alcance das notícias através das redes sociais e canais digitais.',
    features: ['Compartilhamento estratégico', 'Engajamento de audiência', 'Monitoramento digital', 'Relatórios de performance'],
  },
  {
    icon: Mic,
    title: 'Media Training',
    description: 'Preparação de porta-vozes para entrevistas e aparições na mídia com segurança.',
    features: ['Técnicas de entrevista', 'Postura e linguagem', 'Simulações práticas', 'Feedback personalizado'],
  },
  {
    icon: PenTool,
    title: 'Produção de Conteúdo',
    description: 'Criação de textos jornalísticos para diversos canais de comunicação.',
    features: ['Artigos e colunas', 'Newsletters', 'Conteúdo institucional', 'Releases especiais'],
  },
];

export default function Solucoes() {
  return (
    <Layout>
      <PageHero 
        title="Nossas Soluções" 
        subtitle="Serviços especializados em comunicação corporativa" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <AnimatedSection key={solution.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card className="group bg-card border-border hover:shadow-card hover:border-primary/30 transition-all duration-300 h-full overflow-hidden shine">
                    <CardHeader>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300"
                      >
                        <solution.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                      </motion.div>
                      <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
                        {solution.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">{solution.description}</p>
                      <ul className="space-y-3">
                        {solution.features.map((feature, i) => (
                          <motion.li
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-sm text-muted-foreground flex items-center gap-3"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
