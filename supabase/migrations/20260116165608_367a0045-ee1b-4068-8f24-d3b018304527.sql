-- Adicionar campo image_url na tabela services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Inserir novos serviços: Cerimonial e Palestras
INSERT INTO public.services (title, description, icon, how_we_do, features, display_order, active, image_url)
VALUES 
  ('Cerimonial', 'Atuamos também como Mestre de Cerimônias em eventos corporativos.', 'Mic', 'O que oferecemos:', 
   ARRAY['Apoio na redação do roteiro do cerimonial, para que esteja conectado com o propósito do cliente e do seu evento', 'Condução do evento por meio do cerimonial'], 
   6, true, '/images/services/mestre-cerimonias.jpg'),
  
  ('Palestras sobre Comunicação', 'Conhecimento sobre a importância da comunicação nas diversas situações.', 'Lightbulb', 'Como fazemos:', 
   ARRAY['Palestramos sobre media training - técnicas para criar e manter bons relacionamentos', 'Palestras sobre como promover networking de valor'], 
   7, true, '/images/services/palestras.jpg');

-- Atualizar imagens dos serviços existentes
UPDATE public.services SET image_url = '/images/services/assessoria-imprensa.jpg' WHERE title = 'Relacionamento com a Mídia';
UPDATE public.services SET image_url = '/images/services/entrevista-audiovisual.jpg' WHERE title = 'Entrevista Audiovisual';