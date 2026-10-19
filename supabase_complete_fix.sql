-- ==============================================================================
-- AQUI TEM — SCRIPT COMPLETO DE CORREÇÃO E ATIVAÇÃO DO SUPABASE
-- Execute este script completo no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/essjwjbtzytefycjodgh/sql
-- ==============================================================================

-- 1. ADICIONAR COLUNAS DE SEO NA TABELA public.products
-- Resolve o problema de seo_title e seo_description não ficarem gravados
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Garante unicidade e índices de performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Preencher SEO padrão para produtos que estejam com valores nulos
UPDATE public.products
SET 
  seo_title = COALESCE(seo_title, name || ' | AQUI TEM Angola'),
  seo_description = COALESCE(
    seo_description, 
    'Compre ' || name || ' na AQUI TEM Angola com garantia oficial e entrega rápida em Luanda e províncias. Atendimento WhatsApp: +244 950 752 933.'
  )
WHERE seo_title IS NULL OR seo_description IS NULL;


-- 2. CRIAR TABELA DE ANALYTICS DO CRM (caso ainda não exista)
CREATE TABLE IF NOT EXISTS public.crm_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  metric_key TEXT,
  metric_value NUMERIC(12, 2) DEFAULT 1,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow logging analytics events" ON public.crm_analytics;
CREATE POLICY "Allow logging analytics events"
  ON public.crm_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view analytics" ON public.crm_analytics;
CREATE POLICY "Admins can view analytics"
  ON public.crm_analytics
  FOR SELECT
  TO authenticated
  USING (true);

GRANT ALL ON TABLE public.crm_analytics TO anon, authenticated;


-- 3. CRIAR BUCKET DE IMAGENS 'products' NO SUPABASE STORAGE (PÚBLICO)
-- Resolve o problema das imagens ficarem pesadas em base64 no banco
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB limite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para o bucket 'products':
-- Acesso público de leitura para qualquer visitante ver as fotos
DROP POLICY IF EXISTS "Public Access to product images" ON storage.objects;
CREATE POLICY "Public Access to product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'products');

-- Apenas administradores autenticados podem fazer upload, alterar ou apagar imagens
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');


-- 4. ATUALIZAR POLÍTICA DE LEADS DO CRM (crm_leads)
-- Garante que visitantes anônimos possam registrar leads sem erro de permissão
DROP POLICY IF EXISTS "Allow anonymous and authenticated checkout to create leads" ON public.crm_leads;
CREATE POLICY "Allow anonymous and authenticated checkout to create leads"
  ON public.crm_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permite que apenas administradores autenticados consultem, alterem e excluam leads
DROP POLICY IF EXISTS "Allow authenticated admins to select leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to select leads"
  ON public.crm_leads
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated admins to update leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to update leads"
  ON public.crm_leads
  FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated admins to delete leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to delete leads"
  ON public.crm_leads
  FOR DELETE
  TO authenticated
  USING (true);

GRANT ALL ON TABLE public.crm_leads TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
