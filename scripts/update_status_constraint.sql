ALTER TABLE public.whatsapp_dispatch_logs DROP CONSTRAINT IF EXISTS whatsapp_dispatch_logs_status_check;
ALTER TABLE public.whatsapp_dispatch_logs ADD CONSTRAINT whatsapp_dispatch_logs_status_check 
CHECK (status IN ('SIMULATED', 'PENDING_CONFIG', 'SENT', 'FAILED', 'DELIVERED', 'READ', 'BLOCKED_NO_CONSENT', 'BLOCKED_OPT_OUT'));
