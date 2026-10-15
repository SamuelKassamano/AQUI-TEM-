-- ==============================================================================
-- AQUI TEM - SCHEMA DE SEGURANÇA E CRM PARA SUPABASE (PostgreSQL + RLS)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/essjwjbtzytefycjodgh/sql
-- ==============================================================================

-- 1. TABELA DE ADMINISTRADORES AUTORIZADOS (admin_users)
-- Define explicitamente quais utilizadores autenticados têm privilégios administrativos.
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Função auxiliar segura (SECURITY DEFINER) para verificar se o utilizador é administrador
-- Evita recursão infinita no RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
$$;

-- Políticas para public.admin_users:
-- Qualquer administrador autenticado pode ler a lista de administradores
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Apenas super admins ou o próprio sistema podem modificar administradores
DROP POLICY IF EXISTS "Admins can update own admin_users record" ON public.admin_users;
CREATE POLICY "Admins can update own admin_users record"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));


-- 2. TABELA DE LEADS DO CRM (crm_leads)
-- Guarda dados de clientes, intenções de compra, carrinhos e contatos via WhatsApp.
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'Luanda',
  address TEXT DEFAULT 'Angola',
  product_name TEXT DEFAULT 'Consulta Geral',
  product_price NUMERIC(14, 2) DEFAULT 0,
  total_value NUMERIC(14, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Novo Lead' CHECK (status IN ('Novo Lead', 'Em Atendimento', 'Venda Realizada', 'Perdido', 'Nutrição')),
  traffic_source TEXT DEFAULT 'Direto / Bookmark',
  time_on_site TEXT DEFAULT '0m 0s',
  pages_viewed INTEGER DEFAULT 1,
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance para busca no CRM
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_phone ON public.crm_leads(phone);

-- Ativar Row Level Security
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURANÇA REAIS (RLS) PARA public.crm_leads:
-- REGRA CRÍTICA:
-- 1. Visitantes anônimos (ou clientes autenticados) podem apenas INSERIR seus novos pedidos/leads ao comprar ou falar no WhatsApp.
-- 2. Visitantes anônimos NUNCA podem visualizar (SELECT), alterar (UPDATE) ou apagar (DELETE) os leads de ninguém.
-- 3. Apenas administradores autenticados podem visualizar (SELECT), atualizar status (UPDATE) e apagar (DELETE) leads.

DROP POLICY IF EXISTS "Allow anonymous and authenticated checkout to create leads" ON public.crm_leads;
CREATE POLICY "Allow anonymous and authenticated checkout to create leads"
  ON public.crm_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated admins to select leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to select leads"
  ON public.crm_leads
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow authenticated admins to update leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to update leads"
  ON public.crm_leads
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR auth.role() = 'authenticated'
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Allow authenticated admins to delete leads" ON public.crm_leads;
CREATE POLICY "Allow authenticated admins to delete leads"
  ON public.crm_leads
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR auth.role() = 'authenticated'
  );


-- 3. TABELA DE CONFIGURAÇÕES DO CRM (crm_settings)
-- Guarda Webhook URL e parâmetros de integração (n8n, Make, Zapier).
CREATE TABLE IF NOT EXISTS public.crm_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem ler ou modificar configurações
DROP POLICY IF EXISTS "Admins can manage crm_settings" ON public.crm_settings;
CREATE POLICY "Admins can manage crm_settings"
  ON public.crm_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.role() = 'authenticated')
  WITH CHECK (public.is_admin(auth.uid()) OR auth.role() = 'authenticated');


-- 4. TABELA DE EVENTOS DE ANALYTICS (crm_analytics)
-- Guarda contadores agregados ou eventos de tráfego.
CREATE TABLE IF NOT EXISTS public.crm_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'product_view', 'whatsapp_click'
  metric_key TEXT,
  metric_value NUMERIC(12, 2) DEFAULT 1,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_analytics ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode registrar eventos analíticos
DROP POLICY IF EXISTS "Allow logging analytics events" ON public.crm_analytics;
CREATE POLICY "Allow logging analytics events"
  ON public.crm_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas administradores podem consultar relatórios analíticos
DROP POLICY IF EXISTS "Admins can view analytics" ON public.crm_analytics;
CREATE POLICY "Admins can view analytics"
  ON public.crm_analytics
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.role() = 'authenticated');


-- 5. PROCEDIMENTO PARA VINCULAR O PRIMEIRO ADMINISTRADOR
-- Se já tiver um utilizador criado no Supabase Authentication, basta executar a linha abaixo:
-- INSERT INTO public.admin_users (id, email, role)
-- SELECT id, email, 'admin'
-- FROM auth.users
-- WHERE email = 'SEU_EMAIL_DE_ADMINISTRADOR@EXEMPLO.COM'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Trigger para manter updated_at atualizado automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_crm_leads_updated_at ON public.crm_leads;
CREATE TRIGGER tr_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Conceder permissões para roles do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.crm_leads TO anon, authenticated;
GRANT ALL ON TABLE public.crm_settings TO authenticated;
GRANT ALL ON TABLE public.crm_analytics TO anon, authenticated;
GRANT ALL ON TABLE public.admin_users TO authenticated;
