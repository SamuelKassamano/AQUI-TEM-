-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- MIGRATION: SUPORTE A EVENTOS EXTERNOS DA META E DIAGNÓSTICO DE ERROS
-- Ficheiro: scripts/whatsapp_external_events_migration.sql
-- Project Ref: essjwjbtzytefycjodgh
--
-- NOTA DE SEGURANÇA:
-- 1. Idempotente, não-destrutivo e reversível.
-- 2. Não apaga registos existentes nem modifica dados financeiros.
-- 3. Adiciona 'external_meta' ao dispatch_mode e 'status_update' ao message_type.
-- 4. Adiciona colunas dedicadas para error_code, error_details e fbtrace_id.
-- ==============================================================================

BEGIN;

-- 1. Actualizar restrição de dispatch_mode para aceitar 'external_meta'
ALTER TABLE public.whatsapp_dispatch_logs 
  DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_dispatch_mode_check;

ALTER TABLE public.whatsapp_dispatch_logs 
  ADD CONSTRAINT whatsapp_dispatch_logs_dispatch_mode_check 
  CHECK (dispatch_mode IN ('mock', 'cloud_api', 'external_meta'));

-- 2. Actualizar restrição de message_type para aceitar 'status_update'
ALTER TABLE public.whatsapp_dispatch_logs 
  DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_message_type_check;

ALTER TABLE public.whatsapp_dispatch_logs 
  ADD CONSTRAINT whatsapp_dispatch_logs_message_type_check 
  CHECK (message_type IN ('text', 'document', 'image', 'template', 'status_update'));

-- 3. Adicionar colunas estruturadas para auditoria técnica detalhada da Meta
ALTER TABLE public.whatsapp_dispatch_logs 
  ADD COLUMN IF NOT EXISTS error_code TEXT,
  ADD COLUMN IF NOT EXISTS error_details TEXT,
  ADD COLUMN IF NOT EXISTS fbtrace_id TEXT,
  ADD COLUMN IF NOT EXISTS raw_meta_status TEXT;

-- 4. Índices para pesquisa rápida de erros e modos de despacho
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_meta_id ON public.whatsapp_dispatch_logs(meta_message_id) WHERE meta_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_error_code ON public.whatsapp_dispatch_logs(error_code) WHERE error_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wa_dispatch_mode_status ON public.whatsapp_dispatch_logs(dispatch_mode, status);

COMMIT;
