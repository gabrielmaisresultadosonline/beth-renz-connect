-- Create services table for the Solutions/Services page
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'Briefcase',
  features TEXT[] DEFAULT '{}',
  how_we_do TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.is_admin = true
));

-- Update trigger
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert services with the new content
INSERT INTO public.services (title, description, icon, features, how_we_do, display_order) VALUES
(
  'Estratégias de Comunicação',
  'Consultoria e/ou Assessoria para construir projetos para a divulgação do cliente e/ou produto junto aos seus públicos-alvo.',
  'Target',
  ARRAY['Conhecendo a empresa', 'Conhecendo seu público-alvo', 'Conhecendo sua equipe', 'Identificando oportunidades de divulgação', 'Identificando oportunidade de relacionamento', 'Apontando ações de divulgação'],
  'Como fazemos?',
  1
),
(
  'Relacionamento com a Mídia',
  'Nos conectamos com jornalistas nacionais, regionais, veículos de grande imprensa e segmentados e formadores de opinião para dar visibilidade a fatos, histórias, pessoas e marcas.',
  'Newspaper',
  ARRAY['Redação e envio de informações (press release) para veículos adequados ao perfil do cliente', 'Organização de coletivas de Imprensa', 'Organização de eventos voltados para a Imprensa'],
  'Assessoria de Imprensa',
  2
),
(
  'Produção de Conteúdo',
  'Seja qual for seu objetivo, plataforma a ser utilizada e o público-alvo, seu conteúdo precisa ser produzido de forma estratégica para entregar a mensagem certa, no lugar mais adequado e no timing perfeito. Como bons jornalistas, gostamos de contar histórias. Boas histórias engajam e geram resultados.',
  'PenTool',
  ARRAY['Conteúdo editorial para sites, blogs, jornais e revistas', 'Conteúdo para ações e campanhas publicitárias', 'Serviço de ghost writing', 'Apresentações e materiais institucionais'],
  'O que oferecemos:',
  3
),
(
  'Personalização do Empreendedor nas Redes Sociais',
  'O(a) empreendedor(a) é o principal vendedor da sua empresa/marca. E suas redes sociais precisam estar alinhadas com estes posicionamentos.',
  'User',
  ARRAY['Elaboramos a estratégia mais adequada para dar visibilidade nas suas redes sociais', 'Avaliamos o estilo, perfil e personalidade do empreendedor, criando sua identidade empreendedora', 'Inserimos e/ou atualizamos as informações pessoais nas redes sociais', 'Produzimos imagens de qualidade para os perfis', 'Orientamos a inserção de conteúdo', 'Contribuímos com a imagem de pessoas físicas, lideranças e empresas'],
  'O que fazemos:',
  4
),
(
  'Entrevista Audiovisual',
  'Os vídeos são uma das formas mais diretas para divulgação de atividades, projetos e conquistas das empresas. Produzimos entrevistas audiovisuais com o cliente, para tornar a divulgação ágil, atraente e moderna.',
  'Video',
  ARRAY['Entrevistas com fontes dos clientes para divulgação por meio de vídeos curtos', 'Cobertura de eventos especiais dos clientes'],
  'Como fazemos:',
  5
);

-- Update the company name in site_content
UPDATE public.site_content 
SET subtitle = 'A Beth Renz Imprensa & Relacionamento atua desde 1993 com foco em estratégias de comunicação para posicionar o cliente junto aos seus públicos-alvo, sejam externos quanto internos.'
WHERE section = 'quem_somos_intro';

-- Update clients section title
UPDATE public.site_content 
SET title = 'Na lista de clientes Beth Renz Imprensa & Relacionamento:'
WHERE section = 'quem_somos_clientes';