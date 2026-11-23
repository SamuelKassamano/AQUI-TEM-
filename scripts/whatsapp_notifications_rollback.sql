-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- ROLLBACK: REGISTO DE NOTIFICAÇÕES WHATSAPP BUSINESS
-- Ficheiro: scripts/whatsapp_notifications_rollback.sql
-- Project Ref: essjwjbtzytefycjodgh
-- ==============================================================================

BEGIN;

DROP POLICY IF EXISTS "wa_dispatch_admin_select" ON public.whatsapp_dispatch_logs;
DROP POLICY IF EXISTS "wa_dispatch_admin_all" ON public.whatsapp_dispatch_logs;
DROP TABLE IF EXISTS public.whatsapp_dispatch_logs CASCADE;

COMMIT;
