-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- ROLLBACK: SUPORTE A EVENTOS EXTERNOS DA META E DIAGNÓSTICO DE ERROS
-- Ficheiro: scripts/whatsapp_external_events_rollback.sql
-- Project Ref: essjwjbtzytefycjodgh
-- ==============================================================================

BEGIN;

ALTER TABLE public.whatsapp_dispatch_logs 
  DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_dispatch_mode_check;

ALTER TABLE public.whatsapp_dispatch_logs 
  ADD CONSTRAINT whatsapp_dispatch_logs_dispatch_mode_check 
  CHECK (dispatch_mode IN ('mock', 'cloud_api'));

ALTER TABLE public.whatsapp_dispatch_logs 
  DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_message_type_check;

ALTER TABLE public.whatsapp_dispatch_logs 
  ADD CONSTRAINT whatsapp_dispatch_logs_message_type_check 
  CHECK (message_type IN ('text', 'document', 'image', 'template'));

DROP INDEX IF EXISTS public.idx_wa_dispatch_error_code;
DROP INDEX IF EXISTS public.idx_wa_dispatch_mode_status;

ALTER TABLE public.whatsapp_dispatch_logs 
  DROP COLUMN IF EXISTS error_code,
  DROP COLUMN IF EXISTS error_details,
  DROP COLUMN IF EXISTS fbtrace_id,
  DROP COLUMN IF EXISTS raw_meta_status;

COMMIT;
