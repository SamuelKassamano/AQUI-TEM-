-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- MIGRATION: TABELA DE DESPACHO WHATSAPP & SUPORTE A MODO MOCK / SIMULAÇÃO
-- Ficheiro: scripts/whatsapp_mock_migration.sql
-- Project Ref: essjwjbtzytefycjodgh
--
-- NOTA DE SEGURANÇA:
-- 1. Idempotente, não-destrutivo e reversível.
-- 2. Não apaga encomendas, leads, nem auditorias financeiras.
-- 3. Suporta modo MOCK e modo CLOUD_API com separação estrita de estados.
-- 4. Não armazena Signed URLs completos (apenas document_storage_path).
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.whatsapp_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  order_code TEXT,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL DEFAULT '244950752933',
  status TEXT NOT NULL DEFAULT 'SIMULATED' CHECK (status IN ('SIMULATED', 'PENDING_CONFIG', 'SENT', 'FAILED', 'DELIVERED', 'READ')),
  dispatch_mode TEXT NOT NULL DEFAULT 'mock' CHECK (dispatch_mode IN ('mock', 'cloud_api')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'template')),
  meta_message_id TEXT,
  document_storage_path TEXT,
  document_filename TEXT,
  document_mime_type TEXT,
  deduplication_key TEXT UNIQUE,
  formatted_body TEXT,
  attempts INT NOT NULL DEFAULT 1,
  last_error TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'whatsapp_dispatch_logs') THEN
    ALTER TABLE public.whatsapp_dispatch_logs ADD COLUMN IF NOT EXISTS dispatch_mode TEXT NOT NULL DEFAULT 'mock' CHECK (dispatch_mode IN ('mock', 'cloud_api'));
    ALTER TABLE public.whatsapp_dispatch_logs ADD COLUMN IF NOT EXISTS document_storage_path TEXT;
    ALTER TABLE public.whatsapp_dispatch_logs ADD COLUMN IF NOT EXISTS document_filename TEXT;
    ALTER TABLE public.whatsapp_dispatch_logs ADD COLUMN IF NOT EXISTS document_mime_type TEXT;
    ALTER TABLE public.whatsapp_dispatch_logs ADD COLUMN IF NOT EXISTS formatted_body TEXT;
    
    ALTER TABLE public.whatsapp_dispatch_logs DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_status_check;
    ALTER TABLE public.whatsapp_dispatch_logs ADD CONSTRAINT whatsapp_dispatch_logs_status_check 
      CHECK (status IN ('SIMULATED', 'PENDING_CONFIG', 'SENT', 'FAILED', 'DELIVERED', 'READ'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wa_dispatch_order_code ON public.whatsapp_dispatch_logs(order_code);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_event ON public.whatsapp_dispatch_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_status ON public.whatsapp_dispatch_logs(status);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_mode ON public.whatsapp_dispatch_logs(dispatch_mode);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_created_at ON public.whatsapp_dispatch_logs(created_at DESC);

ALTER TABLE public.whatsapp_dispatch_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "wa_dispatch_admin_select" ON public.whatsapp_dispatch_logs;
  DROP POLICY IF EXISTS "wa_dispatch_admin_all" ON public.whatsapp_dispatch_logs;
END $$;

CREATE POLICY "wa_dispatch_admin_select"
  ON public.whatsapp_dispatch_logs
  FOR SELECT
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR (public.is_admin())
  );

CREATE POLICY "wa_dispatch_admin_all"
  ON public.whatsapp_dispatch_logs
  FOR ALL
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR (public.is_admin())
  )
  WITH CHECK (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR (public.is_admin())
  );

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.whatsapp_dispatch_logs TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

COMMIT;
