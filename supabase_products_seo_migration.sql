-- ==============================================================================
-- AQUI TEM — MIGRAÇÃO DE PRODUTOS E SEO PARA SUPABASE (PostgreSQL)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/essjwjbtzytefycjodgh/sql
-- ==============================================================================

-- 1. ADICIONAR COLUNAS DE SEO NA TABELA public.products
-- seo_title: Título exclusivo para <title> e Google (não exibido no corpo)
-- seo_description: Descrição exclusiva para <meta name="description"> (não exibida no corpo)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 2. GARANTIR UNICIDADE DO SLUG PARA CADA PRODUTO
-- Cria índice único no slug para evitar duplicações de URLs amigáveis
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique 
ON public.products(slug);

-- 3. ÍNDICES DE PERFORMANCE PARA BUSCA E CATÁLOGO
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- 4. PREENCHER SEO PADRÃO NOS PRODUTOS EXISTENTES (CASO ESTEJAM NULOS)
UPDATE public.products
SET 
  seo_title = COALESCE(seo_title, name || ' | AQUI TEM Angola'),
  seo_description = COALESCE(
    seo_description, 
    'Compre ' || name || ' na AQUI TEM Angola com garantia oficial e entrega rápida em Luanda e províncias. Atendimento WhatsApp: +244 950 752 933.'
  )
WHERE seo_title IS NULL OR seo_description IS NULL;

-- 5. NOTA DE CONFIRMAÇÃO
COMMENT ON COLUMN public.products.seo_title IS 'Título exclusivo para motores de busca (<title>). Não exibir no corpo da página.';
COMMENT ON COLUMN public.products.seo_description IS 'Descrição exclusiva para meta tag description e redes sociais. Não exibir no corpo da página.';
