-- ==============================================================================
-- AQUI TEM ANGOLA — CRM & CONSENTIMENTO BREVO: PROCEDIMENTO DE ROLLBACK SEGURO
-- Ficheiro: scripts/crm_brevo_rollback.sql
-- ==============================================================================
-- INSTRUÇÃO: Substitua '00000000-0000-0000-0000-000000000000' pelo batch_id 
-- retornado na execução da migração.
-- ==============================================================================

BEGIN;

WITH target_batch AS (
  SELECT '00000000-0000-0000-0000-000000000000'::UUID AS batch_id
),
batch_records AS (
  SELECT 
    m.id AS log_id,
    m.lead_id,
    m.extracted_email,
    m.previous_email,
    m.previous_marketing_consent,
    m.previous_consent_source,
    m.previous_consent_confirmed_at,
    m.previous_consent_updated_at,
    m.previous_consent_ip_address,
    m.previous_consent_user_agent,
    m.post_email,
    m.post_marketing_consent,
    m.post_consent_source,
    m.post_consent_confirmed_at,
    m.post_consent_updated_at,
    m.post_consent_ip_address,
    m.post_consent_user_agent,
    -- Comparação dinâmica e rigorosa: o lead existe e os 7 campos pós-migração permanecem intactos
    (
      l.id IS NOT NULL
      AND (
        (l.email IS NULL AND m.post_email IS NULL)
        OR (lower(trim(l.email)) = lower(trim(m.post_email)))
      )
      AND (l.marketing_consent IS NOT DISTINCT FROM m.post_marketing_consent)
      AND (l.consent_source IS NOT DISTINCT FROM m.post_consent_source)
      AND (l.consent_confirmed_at IS NOT DISTINCT FROM m.post_consent_confirmed_at)
      AND (l.consent_updated_at IS NOT DISTINCT FROM m.post_consent_updated_at)
      AND (l.consent_ip_address IS NOT DISTINCT FROM m.post_consent_ip_address)
      AND (l.consent_user_agent IS NOT DISTINCT FROM m.post_consent_user_agent)
    ) AS is_unmodified
  FROM public.crm_leads_email_migration_log m
  JOIN target_batch tb ON m.batch_id = tb.batch_id
  LEFT JOIN public.crm_leads l ON l.id = m.lead_id
  WHERE m.status = 'MIGRATED'
),
reverted_leads AS (
  UPDATE public.crm_leads l
  SET email = br.previous_email,
      marketing_consent = COALESCE(br.previous_marketing_consent, FALSE),
      consent_source = br.previous_consent_source,
      consent_confirmed_at = br.previous_consent_confirmed_at,
      consent_updated_at = br.previous_consent_updated_at,
      consent_ip_address = br.previous_consent_ip_address,
      consent_user_agent = br.previous_consent_user_agent
  FROM batch_records br
  WHERE l.id = br.lead_id
    AND br.is_unmodified = TRUE
  RETURNING l.id
),
marked_reverted_log AS (
  UPDATE public.crm_leads_email_migration_log m
  SET status = 'REVERTED'
  FROM batch_records br
  WHERE m.id = br.log_id
    AND br.is_unmodified = TRUE
  RETURNING m.id
),
marked_modified_log AS (
  UPDATE public.crm_leads_email_migration_log m
  SET status = 'MANUALLY_MODIFIED'
  FROM batch_records br
  WHERE m.id = br.log_id
    AND br.is_unmodified = FALSE
  RETURNING m.id
)
SELECT 
  (SELECT batch_id FROM target_batch) AS batch_id,
  (SELECT count(*) FROM reverted_leads) AS leads_reverted,
  (SELECT count(*) FROM marked_reverted_log) AS log_records_marked_reverted,
  (SELECT count(*) FROM marked_modified_log) AS log_records_marked_manually_modified;

COMMIT;
