import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Newspaper, Users, MessageSquare, Megaphone } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo.png';

const solutions = [
  {
    icon: Newspaper,
    title: 'Assessoria de Imprensa',
    description: 'Produção de textos jornalísticos, relacionamento com veículos de comunicação e geração de pautas estratégicas.',
  },
  {
    icon: MessageSquare,
    title: 'Gestão de Crise',
    description: 'Apoio em situações adversas com comunicados oficiais e gestão da imagem institucional.',
  },
  {
    icon: Megaphone,
    title: 'Apoio ao Marketing',
    description: 'Suporte estratégico para divulgação de novos produtos e serviços junto à imprensa.',
  },
  {
    icon: Users,
    title: 'Mídias Digitais',
    description: 'Compartilhamento de notícias em redes sociais para gerar engajamento e amplificar resultados.',
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <img 
            src={logo} 
            alt="Beth Renz" 
            className="h-24 md:h-32 w-auto mx-auto mb-8 animate-fade-up drop-shadow-2xl"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Transformamos fatos em
            <span className="block mt-2">notícias de impacto</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Assessoria de imprensa estratégica para empresas que desejam conquistar espaço na mídia espontânea em rádio, TV, jornais e portais.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" variant="secondary" className="text-base font-medium shadow-elevated">
              <Link to="/contato">
                Fale Conosco
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base font-medium bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/solucoes">
                Conheça Nossas Soluções
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Quem Somos
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Liderada pela jornalista <strong className="text-foreground">Elizabeth Renz</strong> (registro 8228/95), 
              a Beth Renz Imprensa & Relacionamento atua com excelência em comunicação integrada. 
              Nossa missão é transformar os fatos gerados pela sua empresa em notícias de impacto, 
              conquistando espaço espontâneo em rádio, TV, jornais e portais.
            </p>
            <Button asChild variant="outline">
              <Link to="/quem-somos">
                Saiba Mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Nossas Soluções
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Serviços especializados em comunicação corporativa para impulsionar sua marca na mídia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, index) => (
              <Card 
                key={solution.title} 
                className="group bg-card hover:shadow-card transition-all duration-300 border-border hover:border-primary/30"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <solution.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {solution.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild>
              <Link to="/solucoes">
                Ver Todas as Soluções
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
            Pronto para transformar sua comunicação?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Entre em contato e descubra como podemos ajudar sua empresa a conquistar espaço na mídia.
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-elevated">
            <Link to="/contato">
              Entre em Contato
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
