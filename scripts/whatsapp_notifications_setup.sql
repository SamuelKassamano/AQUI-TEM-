-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- MIGRATION: REGISTO DE NOTIFICAÇÕES WHATSAPP BUSINESS & DEDUPLICAÇÃO
-- Ficheiro: scripts/whatsapp_notifications_setup.sql
-- Project Ref: essjwjbtzytefycjodgh
--
-- NOTA DE SEGURANÇA:
-- Este script é estritamente idempotente, não-destrutivo e reversível.
-- Cria a tabela de logs de envio da WhatsApp Business Cloud API com políticas RLS.
-- ==============================================================================

BEGIN;

-- 1. Tabela de Logs de Despacho de Notificações WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  order_code TEXT,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL DEFAULT '244950752933',
  status TEXT NOT NULL DEFAULT 'PENDING_CONFIG' CHECK (status IN ('PENDING_CONFIG', 'SENT', 'FAILED', 'DELIVERED', 'READ')),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'document', 'image', 'template')),
  meta_message_id TEXT,
  document_url TEXT,
  deduplication_key TEXT UNIQUE,
  attempts INT NOT NULL DEFAULT 1,
  last_error TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Índices de Pesquisa e Performance
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_order_code ON public.whatsapp_dispatch_logs(order_code);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_event ON public.whatsapp_dispatch_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_meta_id ON public.whatsapp_dispatch_logs(meta_message_id) WHERE meta_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_status ON public.whatsapp_dispatch_logs(status);
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_created_at ON public.whatsapp_dispatch_logs(created_at DESC);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.whatsapp_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança RLS
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

-- 5. Concessão de Permissões aos Papéis do Supabase
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.whatsapp_dispatch_logs TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

COMMIT;
