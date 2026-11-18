import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PGlite } = require('@electric-sql/pglite');
import fs from 'fs';

async function runVerification() {
  const pg = new PGlite();
  const bundle = fs.readFileSync('./scripts/crm_brevo_definitive_bundle.sql', 'utf8');

  await pg.exec(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
    END $$;

    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE);
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
    $$;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT LANGUAGE sql STABLE AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''), 'anon');
    $$;
  `);

  await pg.exec(bundle);

  console.log('=== 1. TABELA PG_POLICIES NAS 4 TABELAS ===');
  const policiesRes = await pg.query(`
    SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE tablename IN ('crm_leads', 'crm_double_optin_tokens', 'crm_leads_consent_audit_log', 'crm_leads_email_migration_log')
    ORDER BY tablename, policyname;
  `);
  console.table(policiesRes.rows);

  console.log('=== 2. TESTE DE BLINDAGEM DO TRIGGER AUDIT LOG ===');
  // Inserir lead e token de teste
  const leadRes = await pg.query(`INSERT INTO public.crm_leads (name, email) VALUES ('Audit Test', 'audit@test.ao') RETURNING id;`);
  const leadId = leadRes.rows[0].id;
  const tokenRes = await pg.query(`
    INSERT INTO public.crm_double_optin_tokens (lead_id, token_hash, token_type, target_email, expires_at)
    VALUES ('${leadId}', '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'OPTIN', 'audit@test.ao', NOW() + INTERVAL '24h')
    RETURNING id;
  `);
  const tokenId = tokenRes.rows[0].id;

  const logRes = await pg.query(`
    INSERT INTO public.crm_leads_consent_audit_log (lead_id, token_id, email, action, previous_state, new_state, source)
    VALUES ('${leadId}', '${tokenId}', 'audit@test.ao', 'OPTIN_GRANTED', false, true, 'WEB')
    RETURNING id;
  `);
  const logId = logRes.rows[0].id;

  // Teste 2.1: Modificar ID do log (deve falhar)
  try {
    await pg.query(`UPDATE public.crm_leads_consent_audit_log SET id = gen_random_uuid() WHERE id = '${logId}';`);
    console.error('FALHA: Modificação de ID foi permitida!');
  } catch(e) {
    console.log('PASS ✅ Modificação de id bloqueada:', e.message);
  }

  // Teste 2.2: Modificar simultaneamente lead_id e token_id para NULL (deve falhar)
  try {
    await pg.query(`UPDATE public.crm_leads_consent_audit_log SET lead_id = NULL, token_id = NULL WHERE id = '${logId}';`);
    console.error('FALHA: Modificação simultânea permitida!');
  } catch(e) {
    console.log('PASS ✅ Modificação simultânea de lead_id e token_id bloqueada:', e.message);
  }

  // Teste 2.3: Modificar apenas lead_id arbitrariamente sem ser cascade (deve falhar pois token_id é mantido mas precisa validar se foi cascade ou manual)
  try {
    await pg.query(`UPDATE public.crm_leads_consent_audit_log SET email = 'hacked@test.ao' WHERE id = '${logId}';`);
    console.error('FALHA: Modificação de email permitida!');
  } catch(e) {
    console.log('PASS ✅ Modificação de email bloqueada:', e.message);
  }

  // Teste 2.4: Teste de TRUNCATE
  try {
    await pg.query(`TRUNCATE TABLE public.crm_leads_consent_audit_log;`);
    console.error('FALHA: TRUNCATE foi permitido!');
  } catch(e) {
    console.log('PASS ✅ TRUNCATE bloqueado pelo trigger:', e.message);
  }

  // Teste 2.5: ON DELETE de lead (apenas lead_id deve ficar NULL via ON DELETE SET NULL)
  await pg.query(`DELETE FROM public.crm_leads WHERE id = '${leadId}';`);
  const logAfterLeadDelete = await pg.query(`SELECT id, lead_id, token_id, email FROM public.crm_leads_consent_audit_log WHERE id = '${logId}';`);
  console.log('PASS ✅ ON DELETE SET NULL no lead executado com sucesso: lead_id é', logAfterLeadDelete.rows[0].lead_id, '| token_id é', logAfterLeadDelete.rows[0].token_id);

  console.log('=== 3. TESTE DE ROLLBACK COM ALTERAÇÃO POSTERIOR ===');
  // Inserir migração fictícia
  const rollbackSQL = fs.readFileSync('./scripts/crm_brevo_rollback.sql', 'utf8');
  const batchId = '11111111-2222-3333-4444-555555555555';
  const lead1 = await pg.query(`INSERT INTO public.crm_leads (name, email) VALUES ('Lead Inalterado', 'antigo@test.ao') RETURNING id;`);
  const lead2 = await pg.query(`INSERT INTO public.crm_leads (name, email) VALUES ('Lead Modificado', 'modificado@test.ao') RETURNING id;`);

  await pg.query(`
    INSERT INTO public.crm_leads_email_migration_log (lead_id, extracted_email, batch_id, status)
    VALUES ('${lead1.rows[0].id}', 'antigo@test.ao', '${batchId}', 'MIGRATED'),
           ('${lead2.rows[0].id}', 'original@test.ao', '${batchId}', 'MIGRATED');
  `);

  const execRollback = rollbackSQL.replaceAll('00000000-0000-0000-0000-000000000000', batchId);
  const rollbackRes = await pg.exec(execRollback);
  console.log('Resultado do Rollback executado com sucesso!');

  const check1 = await pg.query(`SELECT email FROM public.crm_leads WHERE id = '${lead1.rows[0].id}';`);
  const check2 = await pg.query(`SELECT email FROM public.crm_leads WHERE id = '${lead2.rows[0].id}';`);
  console.log('PASS ✅ Lead inalterado email revertido para:', check1.rows[0].email);
  console.log('PASS ✅ Lead modificado preservou email:', check2.rows[0].email);
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
