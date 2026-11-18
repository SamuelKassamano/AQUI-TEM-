-- ==============================================================================
-- PROJECTO: AQUI TEM ANGOLA
-- MIGRATION: GESTÃO AVANÇADA DE COMPROVATIVOS FINANCEIROS E AUDITORIA IMUTÁVEL
-- Ficheiro: scripts/financial_receipts_management.sql
-- Project Ref: essjwjbtzytefycjodgh
--
-- NOTA DE SEGURANÇA:
-- Este script é estritamente idempotente e não-destrutivo.
-- Não elimina tabelas, não altera o bucket público de produtos e não modifica
-- dados de encomendas existentes.
-- Apenas cria a tabela de auditoria financeira e adiciona índices de performance.
-- ==============================================================================

-- 1. Assegurar colunas financeiras e de comprovativo em public.crm_leads
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS receipt_token TEXT;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS receipt_storage_path TEXT;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMPTZ;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS payment_confirmed_by TEXT;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.crm_leads ADD COLUMN IF NOT EXISTS estimated_delivery_date TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_leads_receipt_path ON public.crm_leads (receipt_storage_path) WHERE receipt_storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_leads_tracking ON public.crm_leads (tracking_number) WHERE tracking_number IS NOT NULL;

-- 2. Tabela de Auditoria Imutável de Decisões Financeiras
CREATE TABLE IF NOT EXISTS public.receipt_financial_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  decision TEXT NOT NULL CHECK (decision IN ('APROVADO', 'REJEITADO', 'SUBMETIDO')),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  amount_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  receipt_storage_path TEXT,
  admin_email TEXT NOT NULL,
  reason_or_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receipt_audits_order_code ON public.receipt_financial_audits (order_code);
CREATE INDEX IF NOT EXISTS idx_receipt_audits_decision ON public.receipt_financial_audits (decision);
CREATE INDEX IF NOT EXISTS idx_receipt_audits_created_at ON public.receipt_financial_audits (created_at DESC);

-- 3. Habilitar Row Level Security (RLS) na Tabela de Auditoria
ALTER TABLE public.receipt_financial_audits ENABLE ROW LEVEL SECURITY;

-- 4. Função de Apoio: Imutabilidade do Registo de Auditoria
-- Impede categoricamente actualizações (UPDATE) ou eliminações (DELETE) na tabela de auditoria
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE EXCEPTION 'Registo de auditoria financeira é estritamente imutável. Não é permitido actualizar nem eliminar entradas.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_modification ON public.receipt_financial_audits;
CREATE TRIGGER trg_prevent_audit_log_modification
  BEFORE UPDATE OR DELETE ON public.receipt_financial_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();

-- 5. Políticas de Segurança RLS
DO $$
BEGIN
  DROP POLICY IF EXISTS "audits_admin_select_policy" ON public.receipt_financial_audits;
  DROP POLICY IF EXISTS "audits_admin_insert_policy" ON public.receipt_financial_audits;
END $$;

-- Apenas Administradores (verificados via public.is_admin()) e service_role podem consultar
CREATE POLICY "audits_admin_select_policy"
  ON public.receipt_financial_audits
  FOR SELECT
  TO authenticated, service_role
  USING (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR (public.is_admin())
  );

-- Apenas Administradores e service_role podem inserir novos registos de auditoria
CREATE POLICY "audits_admin_insert_policy"
  ON public.receipt_financial_audits
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    (current_setting('request.jwt.claim.role', true) = 'service_role')
    OR (public.is_admin())
  );

-- Concessão de permissões de execução aos papéis autorizados
GRANT SELECT, INSERT ON public.receipt_financial_audits TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
