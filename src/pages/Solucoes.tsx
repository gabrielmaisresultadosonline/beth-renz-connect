import { Layout } from '@/components/Layout';
import { PageHero } from '@/components/PageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, AlertTriangle, TrendingUp, Share2, Mic, PenTool } from 'lucide-react';

const solutions = [
  {
    icon: Newspaper,
    title: 'Assessoria de Imprensa',
    description: 'Produção de textos jornalísticos profissionais (press releases, artigos, notas) e relacionamento estratégico com veículos de comunicação.',
    features: [
      'Produção de press releases e notas',
      'Relacionamento com jornalistas e editores',
      'Agendamento de entrevistas',
      'Acompanhamento de pautas',
      'Clipping de notícias',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Gestão de Crise',
    description: 'Suporte especializado em momentos delicados, protegendo a imagem e reputação da sua empresa com comunicação estratégica.',
    features: [
      'Comunicados oficiais',
      'Posicionamento de porta-vozes',
      'Monitoramento de mídia',
      'Estratégia de resposta',
      'Recuperação de imagem',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Apoio ao Marketing',
    description: 'Integração entre assessoria de imprensa e marketing para potencializar lançamentos e campanhas promocionais.',
    features: [
      'Divulgação de lançamentos',
      'Cobertura de eventos',
      'Ações promocionais',
      'Materiais de apoio',
      'Integração com publicidade',
    ],
  },
  {
    icon: Share2,
    title: 'Mídias Digitais',
    description: 'Amplificação do alcance das notícias através das redes sociais e canais digitais da empresa.',
    features: [
      'Compartilhamento estratégico',
      'Engajamento de audiência',
      'Conteúdo adaptado',
      'Monitoramento digital',
      'Relatórios de performance',
    ],
  },
  {
    icon: Mic,
    title: 'Media Training',
    description: 'Preparação de porta-vozes para entrevistas e aparições na mídia com segurança e eficácia.',
    features: [
      'Técnicas de entrevista',
      'Postura e linguagem corporal',
      'Mensagens-chave',
      'Simulações práticas',
      'Feedback personalizado',
    ],
  },
  {
    icon: PenTool,
    title: 'Produção de Conteúdo',
    description: 'Criação de textos jornalísticos para diversos canais de comunicação da empresa.',
    features: [
      'Artigos e colunas',
      'Newsletters',
      'Conteúdo institucional',
      'Releases especiais',
      'Edição e revisão',
    ],
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
              <Card 
                key={solution.title} 
                className="group bg-card border-border hover:shadow-card hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <solution.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <CardTitle className="font-display text-xl">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature) => (
                      <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
