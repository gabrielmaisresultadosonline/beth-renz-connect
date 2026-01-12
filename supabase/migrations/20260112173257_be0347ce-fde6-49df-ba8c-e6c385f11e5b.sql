-- Create team_members table for the About Us page
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collaborators table for partners/collaborators
CREATE TABLE public.collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Anyone can view active team members"
ON public.team_members
FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage team members"
ON public.team_members
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.is_admin = true
));

-- RLS Policies for collaborators
CREATE POLICY "Anyone can view active collaborators"
ON public.collaborators
FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage collaborators"
ON public.collaborators
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.is_admin = true
));

-- Update trigger for team_members
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add company intro text to site_content table
INSERT INTO public.site_content (section, title, subtitle, content)
VALUES (
  'quem_somos_intro',
  'Quem Somos',
  'A SENHA Comunicação Integrada atua desde 1993 com foco em estratégias de comunicação para posicionar o cliente junto aos seus públicos-alvo, sejam externos quanto internos.',
  'Acredita que a Comunicação faz parte de todos os processos de uma organização. Por isto, aprofunda o conhecimento sobre o negócio do cliente para ser capaz de introduzir a Comunicação no rol de estratégias que contribuirão para as metas corporativas.'
);

-- Insert initial team members
INSERT INTO public.team_members (name, role, bio, photo_url, display_order) VALUES
(
  'Elizabeth Renz',
  'Fundadora e Diretora',
  'Formada em Comunicação Social/Jornalismo com especialização em Design Gráfico pela Universidade do Vale do Rio do Sinos – Unisinos, tem mais de duas décadas de atuação. Foi repórter ou editora em veículos de comunicação como Jornal Exclusivo e Revista Lançamentos (Grupo Sinos) e Revista Proteção (Proteção Publicações).

É idealizadora e produtora de conteúdo do portal São Leopoldo Negócios & Cia, cujo foco é a divulgação do potencial corporativo e empresarial da cidade; e do instagram São Leopoldo Gourmet & Lazer, para divulgar a gastronomia e a cultura local.

Também é apresentadora do programa de entrevistas Negócios & Cia, da Vale TV, divulgando empresas e novos projetos empreendedores.',
  '/images/team/elizabeth-renz.png',
  1
),
(
  'Márcia Greiner',
  'Jornalista',
  'Graduada em Comunicação Social – Jornalismo pela Unisinos/RS, em 1995, atuou durante 15 anos como editora de Economia do Jornal NH (Grupo Sinos). Como produtora de conteúdo, atuou na redação de edições especiais da Revista ADVB.

Como assessora de imprensa e produtos de conteúdo digital, atuou em clientes como Dresch Sports, Clínica Odonto, Óticas Carol São Leopoldo. Atualmente, atende o Centro de Câncer Oncologia Centenário e é produtora de conteúdo empresarial para o portal www.negociosecia.com.br.',
  '/images/team/marcia-greiner.png',
  2
),
(
  'Mateus do Nascimento',
  'Atendimento e Conteúdo',
  'Mateus atua no atendimento aos clientes e produção de conteúdo para nossas redes sociais. É co-autor do São Leopoldo Gourmet & Lazer, projeto que a SENHA desenvolve para divulgar a gastronomia e a cultura local.

É agente cultural qualificado pelo IFSul – Instituto Federal de Educação, Ciência e Tecnologia. Desde 2020 vem resgatando a História de São Leopoldo por meio do projeto Old São Leopoldo.

É apresentador do Café com Cultura, pela Vale TV, integra o Instituto 2024 e é voluntário no Museu Histórico Visconde de São Leopoldo.',
  '/images/team/mateus-nascimento.png',
  3
);

-- Insert collaborators
INSERT INTO public.collaborators (name, bio, display_order) VALUES
(
  'Vítor Amoretti',
  'Fotógrafo com ampla experiência em imagens corporativas e de eventos. Atua nas áreas de direção de fotografia, captura fotográfica de eventos sociais e corporativos, captura fotográfica de ensaios externos e edição fotográfica em geral.',
  1
),
(
  'Bruna Monteiro',
  'Graduanda em Publicidade e Propaganda pela Feevale, produz e edita materiais audiovisuais para as mais diversas áreas. Atua na produção e gestão de conteúdos on-line. Tem passagens pela AGECOM (Feevale); Vale TV; Vigília Nerd; Bonneterie Tricot; Rádio Arquitetura; e Altabox – Mkt Digital.',
  2
);

-- Add featured clients text
INSERT INTO public.site_content (section, title, content)
VALUES (
  'quem_somos_clientes',
  'Na lista de clientes SENHA Comunicação Integrada:',
  'Associação Comercial, Industrial, de Serviços e Tecnologia de São Leopoldo, Werle Vinhos & Espumantes, Cottar Contabilidade, Herzer & Santos Advogados Associados, Abarca Comunicação Integrada, Talent Consultoria Empresarial, Oliva Construções, In Focus Consultoria, dentre outros.'
);