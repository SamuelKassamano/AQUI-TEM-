-- ==============================================================================
-- AQUI TEM ANGOLA — PLANO DE RECUPERAÇÃO INDEPENDENTE: DDL, RLS, PERMISSÕES & FUNÇÕES
-- Ficheiro: scripts/crm_brevo_ddl_rls_recovery.sql
-- Projecto Supabase: essjwjbtzytefycjodgh
--
-- OBJECTIVO:
-- Restaurar de forma 100% idempotente toda a infra-estrutura estrutural
-- (tabelas, colunas, índices, funções, políticas RLS e concessões de permissões)
-- sem apagar, modificar ou perder qualquer dado existente em produção.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ESTRUTURA DAS TABELAS & COLUNAS (DDL SEGURO)
-- ------------------------------------------------------------------------------

-- 1.1 Tabela de Administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 1.2 Tabela Principal de Leads & Encomendas
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
  status TEXT NOT NULL DEFAULT 'Novo Lead',
  traffic_source TEXT DEFAULT 'Direto',
  time_on_site TEXT DEFAULT '0m 0s',
  pages_viewed INTEGER DEFAULT 1,
  notes TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Garantir existência das colunas de e-mail e consentimento
ALTER TABLE public.crm_leads 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS consent_source TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS consent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip_address TEXT,
  ADD COLUMN IF NOT EXISTS consent_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON public.crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_marketing_consent ON public.crm_leads(marketing_consent);
CREATE INDEX IF NOT EXISTS idx_crm_leads_lead_code ON public.crm_leads(lead_code);

-- 1.3 Tabela de Tokens de Consentimento
CREATE TABLE IF NOT EXISTS public.crm_double_optin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL CHECK (token_type IN ('OPTIN', 'UNSUBSCRIBE')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_tokens_lookup ON public.crm_double_optin_tokens(token_hash, token_type);

-- 1.4 Tabela de Auditoria de Consentimento
CREATE TABLE IF NOT EXISTS public.crm_leads_consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  previous_consent BOOLEAN,
  new_consent BOOLEAN NOT NULL,
  source TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_consent_audit_lead ON public.crm_leads_consent_audit_log(lead_id);

-- 1.5 Tabela de Histórico de Migração
CREATE TABLE IF NOT EXISTS public.crm_leads_email_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  extracted_email TEXT NOT NULL,
  previous_email TEXT,
  post_email TEXT,
  previous_marketing_consent BOOLEAN,
  post_marketing_consent BOOLEAN,
  previous_consent_source TEXT,
  post_consent_source TEXT,
  previous_consent_confirmed_at TIMESTAMPTZ,
  post_consent_confirmed_at TIMESTAMPTZ,
  previous_consent_updated_at TIMESTAMPTZ,
  post_consent_updated_at TIMESTAMPTZ,
  previous_consent_ip_address TEXT,
  post_consent_ip_address TEXT,
  previous_consent_user_agent TEXT,
  post_consent_user_agent TEXT,
  status TEXT NOT NULL,
  notes_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_crm_migration_log_batch ON public.crm_leads_email_migration_log(batch_id, status);

-- 1.6 Tabela de Bloqueios Atómicos de Disparo (Anti-Race Condition & Rate Limiting Distribuído)
CREATE TABLE IF NOT EXISTS public.brevo_dispatch_locks (
  lock_key TEXT PRIMARY KEY,
  locked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);


CREATE INDEX IF NOT EXISTS idx_brevo_locks_until ON public.brevo_dispatch_locks(locked_until);

-- ------------------------------------------------------------------------------
-- 2. FUNÇÕES DE SUPORTE & SEGURANÇA
-- ------------------------------------------------------------------------------

-- Função de verificação de administrador (evita recursão RLS)
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

-- Função de bloqueio atómico contra race conditions em envios simultâneos
CREATE OR REPLACE FUNCTION public.check_and_acquire_dispatch_lock(
  p_lock_key TEXT,
  p_cooldown_seconds INT DEFAULT 120
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- Limpar locks antigos expirados
  DELETE FROM public.brevo_dispatch_locks WHERE locked_until < v_now;

  -- Tentar inserir novo lock atomicamente
  INSERT INTO public.brevo_dispatch_locks (lock_key, locked_until, created_at)
  VALUES (p_lock_key, v_now + (p_cooldown_seconds || ' seconds')::INTERVAL, v_now)
  ON CONFLICT (lock_key) DO UPDATE
    SET locked_until = EXCLUDED.locked_until,
        created_at = EXCLUDED.created_at
    WHERE public.brevo_dispatch_locks.locked_until < v_now;

  RETURN FOUND;
END;
$$;

-- Trigger para updated_at em admin_users
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 3. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_double_optin_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads_consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads_email_migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brevo_dispatch_locks ENABLE ROW LEVEL SECURITY;

-- Limpeza preventiva de políticas existentes nas tabelas
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Public can create leads during checkout" ON public.crm_leads;
DROP POLICY IF EXISTS "Admins have full access to crm_leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Public can verify tokens" ON public.crm_double_optin_tokens;
DROP POLICY IF EXISTS "Admins have full access to tokens" ON public.crm_double_optin_tokens;
DROP POLICY IF EXISTS "Public can insert audit log" ON public.crm_leads_consent_audit_log;
DROP POLICY IF EXISTS "Admins have full access to audit log" ON public.crm_leads_consent_audit_log;
DROP POLICY IF EXISTS "Admins have full access to migration log" ON public.crm_leads_email_migration_log;
DROP POLICY IF EXISTS "Admins have full access to dispatch locks" ON public.brevo_dispatch_locks;

-- 3.1 Políticas para public.admin_users
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin_users"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.2 Políticas para public.crm_leads
CREATE POLICY "Public can create leads during checkout"
  ON public.crm_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins have full access to crm_leads"
  ON public.crm_leads
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.3 Políticas para public.crm_double_optin_tokens
CREATE POLICY "Public can verify tokens"
  ON public.crm_double_optin_tokens
  FOR SELECT
  TO anon, authenticated
  USING (used_at IS NULL AND expires_at > timezone('utc'::text, now()));

CREATE POLICY "Admins have full access to tokens"
  ON public.crm_double_optin_tokens
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.4 Políticas para public.crm_leads_consent_audit_log
CREATE POLICY "Public can insert audit log"
  ON public.crm_leads_consent_audit_log
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins have full access to audit log"
  ON public.crm_leads_consent_audit_log
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.5 Políticas para public.crm_leads_email_migration_log
CREATE POLICY "Admins have full access to migration log"
  ON public.crm_leads_email_migration_log
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3.6 Políticas para public.brevo_dispatch_locks
CREATE POLICY "Admins have full access to dispatch locks"
  ON public.brevo_dispatch_locks
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 4. CONCESSÃO DE PERMISSÕES (GRANTS)
-- ------------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Checkout público anónimo
GRANT SELECT, INSERT ON TABLE public.crm_leads TO anon;
GRANT INSERT ON TABLE public.crm_leads_consent_audit_log TO anon;
GRANT SELECT, UPDATE ON TABLE public.crm_double_optin_tokens TO anon;

-- Utilizadores autenticados
GRANT SELECT, INSERT, UPDATE ON TABLE public.crm_leads TO authenticated;
GRANT SELECT, INSERT ON TABLE public.crm_leads_consent_audit_log TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.crm_double_optin_tokens TO authenticated;
GRANT SELECT ON TABLE public.admin_users TO authenticated;

-- Gestão de locks distribuídos e função atómica
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.brevo_dispatch_locks TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_and_acquire_dispatch_lock TO anon, authenticated, service_role;

COMMIT;
