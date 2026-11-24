-- Migration: Arquitectura Híbrida WhatsApp (Canal Interno & Canal Cliente)
ALTER TABLE public.whatsapp_dispatch_logs 
ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'internal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_dispatch_logs_channel_check'
  ) THEN
    ALTER TABLE public.whatsapp_dispatch_logs 
    ADD CONSTRAINT whatsapp_dispatch_logs_channel_check 
    CHECK (channel IN ('internal', 'customer'));
  END IF;
END $$;

ALTER TABLE public.whatsapp_dispatch_logs 
ADD COLUMN IF NOT EXISTS customer_consent boolean DEFAULT false;

ALTER TABLE public.whatsapp_dispatch_logs 
ADD COLUMN IF NOT EXISTS consent_source text;

ALTER TABLE public.whatsapp_dispatch_logs 
ADD COLUMN IF NOT EXISTS template_name text;

CREATE INDEX IF NOT EXISTS idx_wa_dispatch_order_channel 
ON public.whatsapp_dispatch_logs (order_code, channel, event_type);

ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS whatsapp_consent boolean DEFAULT false;

ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS whatsapp_opt_out boolean DEFAULT false;

ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at timestamp with time zone;

ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS whatsapp_opt_out_at timestamp with time zone;

ALTER TABLE public.crm_leads 
ADD COLUMN IF NOT EXISTS whatsapp_consent_source text;
