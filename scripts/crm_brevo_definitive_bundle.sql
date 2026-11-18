-- ==============================================================================
-- AQUI TEM ANGOLA — CRM & CONSENTIMENTO BREVO: PACOTE SQL DEFINITIVO
-- Ficheiro: scripts/crm_brevo_definitive_bundle.sql
-- Projeto Supabase: essjwjbtzytefycjodgh
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. VERIFICAÇÃO PRÉVIA DO ESQUEMA & ESTRUTURA
-- ------------------------------------------------------------------------------

-- 1.1 Tabela de Administradores (alinhada com o esquema do projecto: id REFERENCES auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Garantir coluna email e campos de consentimento em public.crm_leads
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crm_leads 
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS consent_source TEXT DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS consent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_ip_address TEXT,
  ADD COLUMN IF NOT EXISTS consent_user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON public.crm_leads(email);
CREATE INDEX IF NOT EXISTS idx_crm_leads_marketing_consent ON public.crm_leads(marketing_consent);

-- 1.3 Tabela de Tokens de Double Opt-in e Unsubscribe
CREATE TABLE IF NOT EXISTS public.crm_double_optin_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  token_type TEXT NOT NULL CHECK (token_type IN ('OPTIN', 'UNSUBSCRIBE')),
  target_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_tokens_lookup 
  ON public.crm_double_optin_tokens (token_hash, token_type) 
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_crm_tokens_lead_type
  ON public.crm_double_optin_tokens (lead_id, token_type)
  WHERE used_at IS NULL;

-- 1.4 Tabela de Histórico de Auditoria de Consentimento (Append-Only)
-- Nota técnica: Não utiliza ON DELETE CASCADE para garantir a persistência forense
-- do consentimento/revogação mesmo se o lead operacional for apagado do CRM.
CREATE TABLE IF NOT EXISTS public.crm_leads_consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  token_id UUID REFERENCES public.crm_double_optin_tokens(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('OPTIN_GRANTED', 'CONSENT_REVOKED')),
  previous_state BOOLEAN NOT NULL,
  new_state BOOLEAN NOT NULL,
  source TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_consent_audit_lead 
  ON public.crm_leads_consent_audit_log (lead_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_consent_audit_email
  ON public.crm_leads_consent_audit_log (email, created_at DESC);

-- 1.5 Tabela de Registo e Rastreabilidade da Migração de E-mails
CREATE TABLE IF NOT EXISTS public.crm_leads_email_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  extracted_email TEXT NOT NULL,
  previous_email TEXT,
  previous_marketing_consent BOOLEAN,
  previous_consent_source TEXT,
  previous_consent_confirmed_at TIMESTAMPTZ,
  previous_consent_updated_at TIMESTAMPTZ,
  previous_consent_ip_address TEXT,
  previous_consent_user_agent TEXT,
  post_email TEXT,
  post_marketing_consent BOOLEAN,
  post_consent_source TEXT,
  post_consent_confirmed_at TIMESTAMPTZ,
  post_consent_updated_at TIMESTAMPTZ,
  post_consent_ip_address TEXT,
  post_consent_user_agent TEXT,
  notes_snapshot TEXT,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  batch_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'MIGRATED' CHECK (status IN ('MIGRATED', 'REVERTED', 'REVERT_FAILED', 'MANUALLY_MODIFIED'))
);

ALTER TABLE public.crm_leads_email_migration_log
  ADD COLUMN IF NOT EXISTS previous_email TEXT,
  ADD COLUMN IF NOT EXISTS previous_marketing_consent BOOLEAN,
  ADD COLUMN IF NOT EXISTS previous_consent_source TEXT,
  ADD COLUMN IF NOT EXISTS previous_consent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS previous_consent_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS previous_consent_ip_address TEXT,
  ADD COLUMN IF NOT EXISTS previous_consent_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS post_email TEXT,
  ADD COLUMN IF NOT EXISTS post_marketing_consent BOOLEAN,
  ADD COLUMN IF NOT EXISTS post_consent_source TEXT,
  ADD COLUMN IF NOT EXISTS post_consent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS post_consent_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS post_consent_ip_address TEXT,
  ADD COLUMN IF NOT EXISTS post_consent_user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_email_migration_lead 
  ON public.crm_leads_email_migration_log (lead_id, batch_id);

CREATE INDEX IF NOT EXISTS idx_crm_email_migration_batch 
  ON public.crm_leads_email_migration_log (batch_id);

-- ------------------------------------------------------------------------------
-- 2. TRIGGER DE PROTECÇÃO APPEND-ONLY DO HISTÓRICO
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_consent_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Permite exclusivamente a anulação referencial de chaves estrangeiras (ON DELETE SET NULL)
  -- disparada internamente pelo motor quando um lead ou token é eliminado.
  -- Todos os campos de dados (email, action, previous_state, new_state, source, ip, ua, created_at)
  -- têm de permanecer ESTRITAMENTE IDÊNTICOS aos registados no evento original.
  IF TG_OP = 'UPDATE' 
     AND OLD.id = NEW.id
     AND OLD.email = NEW.email 
     AND OLD.action = NEW.action 
     AND OLD.previous_state = NEW.previous_state 
     AND OLD.new_state = NEW.new_state 
     AND OLD.source = NEW.source
     AND (OLD.ip_address IS NOT DISTINCT FROM NEW.ip_address)
     AND (OLD.user_agent IS NOT DISTINCT FROM NEW.user_agent)
     AND OLD.created_at = NEW.created_at
     AND (
       -- Caso 1: Apenas lead_id é anulado (ON DELETE SET NULL de crm_leads), token_id estritamente inalterado
       (OLD.lead_id IS NOT NULL AND NEW.lead_id IS NULL AND OLD.token_id IS NOT DISTINCT FROM NEW.token_id)
       OR 
       -- Caso 2: Apenas token_id é anulado (ON DELETE SET NULL de tokens), lead_id estritamente inalterado
       (OLD.token_id IS NOT NULL AND NEW.token_id IS NULL AND OLD.lead_id IS NOT DISTINCT FROM NEW.lead_id)
     ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'CANNOT_MODIFY_OR_DELETE_CONSENT_AUDIT_LOG: O registo de auditoria de consentimento é estritamente append-only e não pode ser alterado ou eliminado.'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_consent_audit_log ON public.crm_leads_consent_audit_log;
CREATE TRIGGER trg_protect_consent_audit_log
  BEFORE UPDATE OR DELETE ON public.crm_leads_consent_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_consent_audit_log();

-- Trigger explícito para bloquear TRUNCATE
CREATE OR REPLACE FUNCTION public.block_truncate_consent_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'CANNOT_TRUNCATE_CONSENT_AUDIT_LOG: A tabela de auditoria de consentimento não pode ser truncada.'
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS trg_block_truncate_consent_audit_log ON public.crm_leads_consent_audit_log;
CREATE TRIGGER trg_block_truncate_consent_audit_log
  BEFORE TRUNCATE ON public.crm_leads_consent_audit_log
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.block_truncate_consent_audit_log();

-- ------------------------------------------------------------------------------
-- 3. FUNÇÃO DE VERIFICAÇÃO ADMINISTRATIVA (public.is_admin)
-- ------------------------------------------------------------------------------
-- 0 argumentos. Consulta estritamente auth.uid() contra public.admin_users (id).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('super_admin', 'admin', 'manager')
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. FUNÇÃO DE EMISSÃO DE TOKENS (public.issue_double_optin_token)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_double_optin_token(
  p_lead_id UUID,
  p_target_email TEXT,
  p_token_hash TEXT,
  p_token_type TEXT,
  p_validity_interval INTERVAL DEFAULT INTERVAL '48 hours'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token_id UUID;
  v_lead_email TEXT;
BEGIN
  -- Autorização fail-closed: service_role ou administrador
  IF NOT (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Apenas administradores ou service_role podem emitir tokens.'
      USING ERRCODE = '42501';
  END IF;

  -- Validação de tipo de token
  IF p_token_type NOT IN ('OPTIN', 'UNSUBSCRIBE') THEN
    RAISE EXCEPTION 'INVALID_TOKEN_TYPE: Tipo de token deve ser OPTIN ou UNSUBSCRIBE.'
      USING ERRCODE = '22023';
  END IF;

  -- Validação de formato SHA-256 (64 hexadecimais)
  IF p_token_hash IS NULL OR p_token_hash !~ '^[0-9a-fA-F]{64}$' THEN
    RAISE EXCEPTION 'INVALID_HASH_FORMAT: O hash do token deve conter exactamente 64 caracteres hexadecimais SHA-256.'
      USING ERRCODE = '22023';
  END IF;

  -- Validação de janela de validade (1 hora a 30 dias)
  IF p_validity_interval < INTERVAL '1 hour' OR p_validity_interval > INTERVAL '30 days' THEN
    RAISE EXCEPTION 'INVALID_EXPIRY_INTERVAL: A validade do token deve situar-se entre 1 hora e 30 dias.'
      USING ERRCODE = '22023';
  END IF;

  -- Bloqueio exclusivo no lead para serializar e prevenir condições de corrida
  SELECT email INTO v_lead_email
  FROM public.crm_leads
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEAD_NOT_FOUND: Lead com o ID indicado não existe.'
      USING ERRCODE = '02000';
  END IF;

  IF v_lead_email IS NULL OR TRIM(v_lead_email) = '' THEN
    RAISE EXCEPTION 'LEAD_EMAIL_EMPTY: O lead não tem um e-mail válido registado.'
      USING ERRCODE = '22000';
  END IF;

  IF LOWER(TRIM(v_lead_email)) <> LOWER(TRIM(p_target_email)) THEN
    RAISE EXCEPTION 'EMAIL_MISMATCH: O e-mail de destino não coincide com o e-mail do lead.'
      USING ERRCODE = '22000';
  END IF;

  -- Invalida tokens anteriores do mesmo tipo para o lead
  UPDATE public.crm_double_optin_tokens
  SET expires_at = NOW()
  WHERE lead_id = p_lead_id
    AND token_type = p_token_type
    AND used_at IS NULL
    AND expires_at > NOW();

  -- Emissão do novo token
  INSERT INTO public.crm_double_optin_tokens (
    lead_id,
    token_hash,
    token_type,
    target_email,
    expires_at
  ) VALUES (
    p_lead_id,
    LOWER(TRIM(p_token_hash)),
    p_token_type,
    LOWER(TRIM(p_target_email)),
    NOW() + p_validity_interval
  )
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_double_optin_token(UUID, TEXT, TEXT, TEXT, INTERVAL) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_double_optin_token(UUID, TEXT, TEXT, TEXT, INTERVAL) TO service_role;

-- ------------------------------------------------------------------------------
-- 5. FUNÇÃO DE CONFIRMAÇÃO DE DOUBLE OPT-IN (public.confirm_marketing_double_optin)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_marketing_double_optin(
  p_token_hash TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token RECORD;
  v_lead RECORD;
BEGIN
  -- Bloqueio exclusivo do token
  SELECT * INTO v_token
  FROM public.crm_double_optin_tokens
  WHERE token_hash = LOWER(TRIM(p_token_hash))
    AND token_type = 'OPTIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_TOKEN: Token não encontrado ou inválido.'
      USING ERRCODE = '02000';
  END IF;

  IF v_token.used_at IS NOT NULL THEN
    RAISE EXCEPTION 'ALREADY_USED: Este token já foi consumido anteriormente.'
      USING ERRCODE = '22000';
  END IF;

  IF v_token.expires_at <= NOW() THEN
    RAISE EXCEPTION 'EXPIRED_TOKEN: Este token de confirmação expirou.'
      USING ERRCODE = '22000';
  END IF;

  -- Bloqueio exclusivo e validação do lead
  SELECT * INTO v_lead
  FROM public.crm_leads
  WHERE id = v_token.lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEAD_NOT_FOUND: O lead associado a este token já não existe.'
      USING ERRCODE = '02000';
  END IF;

  -- Validação de consistência do e-mail actual do lead
  IF LOWER(TRIM(v_lead.email)) <> LOWER(TRIM(v_token.target_email)) THEN
    RAISE EXCEPTION 'EMAIL_MISMATCH: O e-mail actual do lead foi alterado e já não coincide com o token.'
      USING ERRCODE = '22000';
  END IF;

  -- Consumo imediato do token
  UPDATE public.crm_double_optin_tokens
  SET used_at = NOW()
  WHERE id = v_token.id;

  -- Actualização do estado de consentimento no lead
  UPDATE public.crm_leads
  SET marketing_consent = TRUE,
      consent_source = 'DOUBLE_OPTIN',
      consent_confirmed_at = COALESCE(consent_confirmed_at, NOW()),
      consent_updated_at = NOW(),
      consent_ip_address = p_ip_address,
      consent_user_agent = p_user_agent
  WHERE id = v_token.lead_id;

  -- Registo de auditoria com preservação do e-mail
  INSERT INTO public.crm_leads_consent_audit_log (
    lead_id,
    email,
    token_id,
    action,
    previous_state,
    new_state,
    source,
    ip_address,
    user_agent
  ) VALUES (
    v_token.lead_id,
    v_token.target_email,
    v_token.id,
    'OPTIN_GRANTED',
    COALESCE(v_lead.marketing_consent, FALSE),
    TRUE,
    'DOUBLE_OPTIN_CONFIRMATION',
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', v_token.lead_id,
    'email', v_token.target_email,
    'confirmed_at', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_marketing_double_optin(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_marketing_double_optin(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 6. FUNÇÃO DE REVOGAÇÃO DE CONSENTIMENTO (public.revoke_marketing_consent)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_marketing_consent(
  p_lead_id UUID,
  p_unsubscribe_token_hash TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT 'USER_REQUEST',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lead RECORD;
  v_token_id UUID := NULL;
  v_is_authorized BOOLEAN := FALSE;
  v_token RECORD;
BEGIN
  -- Bloqueio exclusivo e validação do lead
  SELECT * INTO v_lead
  FROM public.crm_leads
  WHERE id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'LEAD_NOT_FOUND: Lead inexistente.'
      USING ERRCODE = '02000';
  END IF;

  -- Se foi fornecido token de cancelamento (link nos emails)
  IF p_unsubscribe_token_hash IS NOT NULL AND TRIM(p_unsubscribe_token_hash) <> '' THEN
    SELECT * INTO v_token
    FROM public.crm_double_optin_tokens
    WHERE token_hash = LOWER(TRIM(p_unsubscribe_token_hash))
      AND token_type = 'UNSUBSCRIBE'
      AND lead_id = p_lead_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'INVALID_UNSUBSCRIBE_TOKEN: Token de cancelamento inválido para este lead.'
        USING ERRCODE = '02000';
    END IF;

    IF v_token.used_at IS NOT NULL THEN
      RAISE EXCEPTION 'ALREADY_USED: Este token de cancelamento já foi consumido.'
        USING ERRCODE = '22000';
    END IF;

    IF v_token.expires_at <= NOW() THEN
      RAISE EXCEPTION 'EXPIRED_TOKEN: O token de cancelamento expirou.'
        USING ERRCODE = '22000';
    END IF;

    IF LOWER(TRIM(v_lead.email)) <> LOWER(TRIM(v_token.target_email)) THEN
      RAISE EXCEPTION 'EMAIL_MISMATCH: O e-mail actual do lead foi alterado e já não coincide com o token.'
        USING ERRCODE = '22000';
    END IF;

    UPDATE public.crm_double_optin_tokens
    SET used_at = NOW()
    WHERE id = v_token.id;

    v_token_id := v_token.id;
    v_is_authorized := TRUE;
  ELSE
    -- Sem token: exige permissão de administrador ou service_role
    IF (current_setting('request.jwt.claim.role', true) = 'service_role') OR public.is_admin() THEN
      v_is_authorized := TRUE;
    END IF;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Sem permissão para revogar o consentimento deste contacto.'
      USING ERRCODE = '42501';
  END IF;

  -- Actualiza consentimento preservando a data histórica de consent_confirmed_at
  UPDATE public.crm_leads
  SET marketing_consent = FALSE,
      consent_source = 'REVOKED_' || UPPER(TRIM(p_reason)),
      consent_updated_at = NOW(),
      consent_ip_address = p_ip_address,
      consent_user_agent = p_user_agent
  WHERE id = p_lead_id;

  -- Registo de auditoria com e-mail persistente
  INSERT INTO public.crm_leads_consent_audit_log (
    lead_id,
    email,
    token_id,
    action,
    previous_state,
    new_state,
    source,
    ip_address,
    user_agent
  ) VALUES (
    p_lead_id,
    v_lead.email,
    v_token_id,
    'CONSENT_REVOKED',
    COALESCE(v_lead.marketing_consent, FALSE),
    FALSE,
    UPPER(TRIM(p_reason)),
    p_ip_address,
    p_user_agent
  );

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', p_lead_id,
    'revoked_at', NOW()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_marketing_consent(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_marketing_consent(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS) E PERMISSÕES
-- ------------------------------------------------------------------------------
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads FORCE ROW LEVEL SECURITY;

ALTER TABLE public.crm_double_optin_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_double_optin_tokens FORCE ROW LEVEL SECURITY;

ALTER TABLE public.crm_leads_consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads_consent_audit_log FORCE ROW LEVEL SECURITY;

ALTER TABLE public.crm_leads_email_migration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads_email_migration_log FORCE ROW LEVEL SECURITY;

-- Limpeza dinâmica e exaustiva de TODAS as políticas existentes nas quatro tabelas
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('crm_leads', 'crm_double_optin_tokens', 'crm_leads_consent_audit_log', 'crm_leads_email_migration_log')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Políticas crm_leads:
-- Anónimos apenas inserem compras sem leitura (.select() bloqueado)
CREATE POLICY "crm_leads_insert_checkout_policy"
  ON public.crm_leads
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Administradores autenticados e backend service_role gerem todos os dados
CREATE POLICY "crm_leads_admin_all_policy"
  ON public.crm_leads
  FOR ALL
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  )
  WITH CHECK (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  );

-- Políticas crm_double_optin_tokens
CREATE POLICY "crm_tokens_admin_service_policy"
  ON public.crm_double_optin_tokens
  FOR ALL
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  );

-- Políticas crm_leads_consent_audit_log
CREATE POLICY "crm_audit_admin_service_policy"
  ON public.crm_leads_consent_audit_log
  FOR SELECT
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  );

-- Políticas crm_leads_email_migration_log
CREATE POLICY "crm_migration_admin_service_policy"
  ON public.crm_leads_email_migration_log
  FOR ALL
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR public.is_admin()
  );

-- Privilégios de tabela estritos (Princípio do menor privilégio e bloqueio de TRUNCATE)
REVOKE ALL ON public.crm_leads FROM PUBLIC;
REVOKE TRUNCATE ON public.crm_leads FROM PUBLIC, anon, authenticated;
GRANT INSERT ON public.crm_leads TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.crm_leads TO authenticated, service_role;

REVOKE ALL ON public.crm_double_optin_tokens FROM PUBLIC, anon;
REVOKE TRUNCATE ON public.crm_double_optin_tokens FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.crm_double_optin_tokens TO authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.crm_double_optin_tokens TO service_role;

REVOKE ALL ON public.crm_leads_consent_audit_log FROM PUBLIC, anon;
REVOKE UPDATE, DELETE, TRUNCATE ON public.crm_leads_consent_audit_log FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.crm_leads_consent_audit_log TO authenticated, service_role;
GRANT INSERT ON public.crm_leads_consent_audit_log TO service_role;

REVOKE ALL ON public.crm_leads_email_migration_log FROM PUBLIC, anon;
REVOKE TRUNCATE ON public.crm_leads_email_migration_log FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.crm_leads_email_migration_log TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 8. MIGRAÇÃO SEGURA DE E-MAILS COM REGEX B LITERAL E BATCH ID DINÂMICO
-- ------------------------------------------------------------------------------
-- A expressão regular pura Regex B é aplicada via dollar-quoting:
-- (?:^|[^A-Za-z0-9._%+-])([A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,})(?=$|[^A-Za-z0-9._%+-])
-- ------------------------------------------------------------------------------
WITH config AS (
  SELECT gen_random_uuid() AS batch_id, NOW() AS migrated_at
),
extracted AS (
  SELECT
    l.id,
    l.created_at,
    l.email AS previous_email,
    l.marketing_consent AS previous_marketing_consent,
    l.consent_source AS previous_consent_source,
    l.consent_confirmed_at AS previous_consent_confirmed_at,
    l.consent_updated_at AS previous_consent_updated_at,
    l.consent_ip_address AS previous_consent_ip_address,
    l.consent_user_agent AS previous_consent_user_agent,
    l.notes,
    ARRAY(
      SELECT DISTINCT lower(m[1])
      FROM regexp_matches(
        l.notes,
        $re$(?:^|[^A-Za-z0-9._%+-])([A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,})(?=$|[^A-Za-z0-9._%+-])$re$,
        'g'
      ) AS m
      ORDER BY 1
    ) AS emails_found
  FROM public.crm_leads l
  WHERE (l.email IS NULL OR trim(l.email) = '')
    AND l.notes IS NOT NULL
    AND trim(l.notes) <> ''
),
candidates AS (
  SELECT
    e.id,
    e.created_at,
    e.previous_email,
    e.previous_marketing_consent,
    e.previous_consent_source,
    e.previous_consent_confirmed_at,
    e.previous_consent_updated_at,
    e.previous_consent_ip_address,
    e.previous_consent_user_agent,
    e.emails_found[1] AS clean_email,
    e.notes
  FROM extracted e
  WHERE cardinality(e.emails_found) = 1
),
deduped_candidates AS (
  SELECT
    c.*,
    ROW_NUMBER() OVER (PARTITION BY c.clean_email ORDER BY c.created_at ASC NULLS LAST, c.id ASC) AS email_occurrence
  FROM candidates c
),
valid_candidates AS (
  SELECT dc.*
  FROM deduped_candidates dc
  WHERE dc.email_occurrence = 1
    AND dc.clean_email IS NOT NULL
    AND dc.clean_email <> ''
    AND NOT EXISTS (
      SELECT 1 FROM public.crm_leads existing
      WHERE existing.id <> dc.id
        AND lower(trim(existing.email)) = dc.clean_email
    )
),
updated_leads AS (
  UPDATE public.crm_leads l
  SET email = vc.clean_email,
      marketing_consent = FALSE,
      consent_source = 'HISTORIC_NOTES_MIGRATION',
      consent_updated_at = config.migrated_at
  FROM valid_candidates vc, config
  WHERE l.id = vc.id
    AND (l.email IS NULL OR trim(l.email) = '')
  RETURNING 
    l.id,
    vc.previous_email,
    vc.previous_marketing_consent,
    vc.previous_consent_source,
    vc.previous_consent_confirmed_at,
    vc.previous_consent_updated_at,
    vc.previous_consent_ip_address,
    vc.previous_consent_user_agent,
    l.email AS post_email,
    l.marketing_consent AS post_marketing_consent,
    l.consent_source AS post_consent_source,
    l.consent_confirmed_at AS post_consent_confirmed_at,
    l.consent_updated_at AS post_consent_updated_at,
    l.consent_ip_address AS post_consent_ip_address,
    l.consent_user_agent AS post_consent_user_agent,
    l.notes
),
logged_migration AS (
  INSERT INTO public.crm_leads_email_migration_log (
    lead_id,
    extracted_email,
    previous_email,
    previous_marketing_consent,
    previous_consent_source,
    previous_consent_confirmed_at,
    previous_consent_updated_at,
    previous_consent_ip_address,
    previous_consent_user_agent,
    post_email,
    post_marketing_consent,
    post_consent_source,
    post_consent_confirmed_at,
    post_consent_updated_at,
    post_consent_ip_address,
    post_consent_user_agent,
    notes_snapshot,
    migrated_at,
    batch_id,
    status
  )
  SELECT
    ul.id,
    ul.post_email,
    ul.previous_email,
    ul.previous_marketing_consent,
    ul.previous_consent_source,
    ul.previous_consent_confirmed_at,
    ul.previous_consent_updated_at,
    ul.previous_consent_ip_address,
    ul.previous_consent_user_agent,
    ul.post_email,
    ul.post_marketing_consent,
    ul.post_consent_source,
    ul.post_consent_confirmed_at,
    ul.post_consent_updated_at,
    ul.post_consent_ip_address,
    ul.post_consent_user_agent,
    ul.notes,
    config.migrated_at,
    config.batch_id,
    'MIGRATED'
  FROM updated_leads ul
  CROSS JOIN config
  RETURNING lead_id
)
SELECT 
  (SELECT batch_id FROM config) AS execution_batch_id,
  (SELECT count(*) FROM updated_leads) AS leads_updated,
  (SELECT count(*) FROM logged_migration) AS audit_records_created;

COMMIT;
