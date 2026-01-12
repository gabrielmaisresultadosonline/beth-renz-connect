import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Target, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuemSomos() {
  return (
    <Layout>
      <PageHero 
        title="Quem Somos" 
        subtitle="Jornalismo a serviço da sua marca" 
      />

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Liderada pela jornalista <strong className="text-foreground">Elizabeth Renz</strong> (registro profissional 8228/95), 
                a <strong className="text-primary">Beth Renz Imprensa & Relacionamento</strong> atua com excelência em comunicação integrada 
                há mais de duas décadas no mercado do Rio Grande do Sul.
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={0.1}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Nossa missão é transformar os fatos gerados pela sua empresa em notícias de impacto, 
                conquistando espaço espontâneo em rádio, televisão, jornais e portais de notícias. 
                Toda empresa gera pauta: aquisições, aniversários, prêmios, eventos, lançamentos de produtos. 
                Nossa expertise jornalística identifica essas oportunidades e as transforma em visibilidade real para sua marca.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Trabalhamos com o conceito de <strong className="text-foreground">mídia espontânea</strong>, 
                onde as publicações acontecem pelo mérito da notícia e não por espaço pago. 
                Essa é a grande diferença entre a assessoria de imprensa e a publicidade tradicional, 
                conferindo maior credibilidade à mensagem transmitida.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Além da assessoria de imprensa, atuamos na gestão de crises, apoio ao marketing e 
                estratégias de mídias digitais, oferecendo um serviço completo de comunicação corporativa.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Nossos Valores
            </h2>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Missão', description: 'Transformar fatos empresariais em notícias relevantes que geram visibilidade e credibilidade.' },
              { icon: Eye, title: 'Visão', description: 'Ser referência em assessoria de imprensa e comunicação corporativa no Rio Grande do Sul.' },
              { icon: Award, title: 'Excelência', description: 'Compromisso com a qualidade e ética jornalística em cada projeto realizado.' },
              { icon: Heart, title: 'Relacionamento', description: 'Construção de parcerias duradouras baseadas em confiança e resultados concretos.' },
            ].map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 h-full shine">
                    <CardContent className="p-6 text-center">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <value.icon className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="font-display font-semibold text-xl text-foreground mb-3">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
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
