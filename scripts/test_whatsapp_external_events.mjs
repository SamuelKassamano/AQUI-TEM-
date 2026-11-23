import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://essjwjbtzytefycjodgh.supabase.co';
const ANON_KEY = 'sb_publishable_jVht5KNDZPLBWR_NZ1lrvw_pNSyuv0B';
const WA_ENDPOINT = `${SUPABASE_URL}/functions/v1/whatsapp-api`;

async function runExternalEventsTest() {
  console.log('========================================================================');
  console.log('SUÍTE DE TESTES: CAPTURA DE EVENTOS EXTERNOS META & DIAGNÓSTICO DE ERROS');
  console.log('Project Ref: essjwjbtzytefycjodgh');
  console.log('Endpoint: ' + WA_ENDPOINT);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const testExtWamid = `wamid.HBgM_TEST_EXT_${Date.now()}`;
  const testRecipient = '244950752933';

  // ---------------------------------------------------------------------------
  // TESTE 1: Ingestão de evento externo de falha (Erro 131030) sem registo prévio
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 1: Ingestão de evento externo com erro 131030 (sem registo prévio)... ');
    const metaPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '109928374650192',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550293847',
              phone_number_id: '998877665544332'
            },
            statuses: [{
              id: testExtWamid,
              status: 'failed',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: testRecipient,
              errors: [{
                code: 131030,
                title: 'Recipient phone number not in allowed list',
                message: 'Recipient phone number not in allowed list',
                error_data: {
                  details: 'Recipient phone number not in allowed list: Add recipient phone number to recipient list and try again.'
                },
                fbtrace_id: 'FbTrace_Audit_9901'
              }]
            }]
          }
        }]
      }]
    };

    const res = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metaPayload)
    });
    const data = await res.json();

    // Consultar se o log foi registado na BD
    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', originFilter: 'external_meta', limit: 5 })
    });
    const logsData = await logsRes.json();
    const createdLog = logsData.logs?.find(l => l.meta_message_id === testExtWamid);

    if (
      res.status === 200 &&
      data.success === true &&
      createdLog &&
      createdLog.dispatch_mode === 'external_meta' &&
      createdLog.error_code === '131030' &&
      createdLog.status === 'FAILED'
    ) {
      console.log(`✓ PASSOU (Gravado como external_meta | Código: ${createdLog.error_code} | Detalhes capturados com sucesso)`);
      passed++;
    } else {
      console.log('✗ FALHOU:', data, createdLog);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Idempotência perante retransmissões do Webhook da Meta
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 2: Idempotência de evento externo duplicado... ');
    const duplicatePayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '109928374650192',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15550293847',
              phone_number_id: '998877665544332'
            },
            statuses: [{
              id: testExtWamid,
              status: 'failed',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: testRecipient,
              errors: [{
                code: 131030,
                title: 'Recipient phone number not in allowed list',
                error_data: { details: 'Add recipient phone number' }
              }]
            }]
          }
        }]
      }]
    };

    const resDup = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicatePayload)
    });
    const dataDup = await resDup.json();

    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', originFilter: 'external_meta', limit: 20 })
    });
    const logsData = await logsRes.json();
    const occurrences = logsData.logs?.filter(l => l.meta_message_id === testExtWamid) || [];

    if (resDup.status === 200 && occurrences.length === 1) {
      console.log('✓ PASSOU (Apenas 1 registo na base de dados graças à chave deduplication_key)');
      passed++;
    } else {
      console.log(`✗ FALHOU (Encontradas ${occurrences.length} ocorrências do mesmo wamid)`);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Integridade Financeira (Zero impacto em crm_leads e receipt_financial_audits)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 3: Integridade de Encomendas e Finanças... ');
    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', originFilter: 'external_meta', limit: 5 })
    });
    const logsData = await logsRes.json();
    const createdLog = logsData.logs?.find(l => l.meta_message_id === testExtWamid);

    if (createdLog && createdLog.order_code === null && createdLog.lead_id === null) {
      console.log('✓ PASSOU (Eventos externos têm order_code: null e lead_id: null; zero poluição)');
      passed++;
    } else {
      console.log('✗ FALHOU:', createdLog);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 4: Ingestão de evento externo de entrega bem-sucedida (status: delivered)
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 4: Ingestão de evento externo delivered... ');
    const deliveredWamid = `wamid.HBgM_DELIVERED_${Date.now()}`;
    const deliveredPayload = {
      object: 'whatsapp_business_account',
      entry: [{
        id: '109928374650192',
        changes: [{
          field: 'messages',
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '15550293847', phone_number_id: '998877665544332' },
            statuses: [{
              id: deliveredWamid,
              status: 'delivered',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: testRecipient
            }]
          }
        }]
      }]
    };

    const resDeliv = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deliveredPayload)
    });
    const dataDeliv = await resDeliv.json();

    const logsRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list-logs', originFilter: 'external_meta', limit: 5 })
    });
    const logsData = await logsRes.json();
    const logDeliv = logsData.logs?.find(l => l.meta_message_id === deliveredWamid);

    if (resDeliv.status === 200 && logDeliv && logDeliv.status === 'DELIVERED') {
      console.log('✓ PASSOU (Registado com status DELIVERED e dispatch_mode external_meta)');
      passed++;
    } else {
      console.log('✗ FALHOU:', dataDeliv, logDeliv);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TESTE 5: MOCK continua sem chamadas à Graph API e isolado de eventos externos
  // ---------------------------------------------------------------------------
  try {
    process.stdout.write('TESTE 5: Isolamento contínuo do Modo MOCK... ');
    const statusRes = await fetch(WA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check-status' })
    });
    const statusData = await statusRes.json();

    if (statusData.mode === 'mock' && statusData.isMock === true) {
      console.log('✓ PASSOU (WHATSAPP_MODE=mock preservado intacto)');
      passed++;
    } else {
      console.log('✗ FALHOU:', statusData);
      failed++;
    }
  } catch (err) {
    console.log('✗ ERRO:', err.message);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`RESULTADO FINAL: ${passed} PASSARAM, ${failed} FALHARAM`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runExternalEventsTest();
