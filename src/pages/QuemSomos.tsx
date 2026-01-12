import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Target, Eye, Heart } from 'lucide-react';

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
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Liderada pela jornalista <strong className="text-foreground">Elizabeth Renz</strong> (registro profissional 8228/95), 
                a <strong className="text-primary">Beth Renz Imprensa & Relacionamento</strong> atua com excelência em comunicação integrada 
                há mais de duas décadas no mercado do Rio Grande do Sul.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Nossa missão é transformar os fatos gerados pela sua empresa em notícias de impacto, 
                conquistando espaço espontâneo em rádio, televisão, jornais e portais de notícias. 
                Toda empresa gera pauta: aquisições, aniversários, prêmios, eventos, lançamentos de produtos. 
                Nossa expertise jornalística identifica essas oportunidades e as transforma em visibilidade real para sua marca.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Trabalhamos com o conceito de <strong className="text-foreground">mídia espontânea</strong>, 
                onde as publicações acontecem pelo mérito da notícia e não por espaço pago. 
                Essa é a grande diferença entre a assessoria de imprensa e a publicidade tradicional, 
                conferindo maior credibilidade à mensagem transmitida.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Além da assessoria de imprensa, atuamos na gestão de crises, apoio ao marketing e 
                estratégias de mídias digitais, oferecendo um serviço completo de comunicação corporativa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center text-foreground mb-12">
            Nossos Valores
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Missão</h3>
                <p className="text-sm text-muted-foreground">
                  Transformar fatos empresariais em notícias relevantes que geram visibilidade e credibilidade.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Visão</h3>
                <p className="text-sm text-muted-foreground">
                  Ser referência em assessoria de imprensa e comunicação corporativa no Rio Grande do Sul.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Excelência</h3>
                <p className="text-sm text-muted-foreground">
                  Compromisso com a qualidade e ética jornalística em cada projeto realizado.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Relacionamento</h3>
                <p className="text-sm text-muted-foreground">
                  Construção de parcerias duradouras baseadas em confiança e resultados concretos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
